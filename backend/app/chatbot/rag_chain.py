"""
LangChain RAG chatbot pipeline.

Architecture:
  1. Embed question with sentence-transformers
  2. FAISS similarity search → top-3 treatment protocol chunks
  3. Build prompt with context + diagnosis JSON
  4. Call Mistral AI API for grounded answer matching the user's language & dialect
"""
from __future__ import annotations

import json
import logging
from pathlib import Path

from app.core.config import settings

logger = logging.getLogger(__name__)


_SYSTEM_PROMPT = """\
Vous êtes "Smart Olive Assistant", un expert agricole tunisien spécialisé dans la culture de l'olivier et la protection des arbres contre les maladies (Œil de paon, Verticilliose, Galle de l'olivier, Fumagine, etc.).

━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE N°1 — LANGUE & DIALECTE
━━━━━━━━━━━━━━━━━━━━━━━━━
Détectez PRÉCISÉMENT la langue et le dialecte de l'utilisateur et répondez TOUJOURS dans la même langue :
- FRANÇAIS → répondez en français clair et professionnel.
- ARABE TUNISIEN (دارجة) → répondez en arabe tunisien populaire et facile.
- ARABE CLASSIQUE (فصحى) → répondez en arabe littéraire.
- ARABIZI / FRANCO-ARABE → répondez en arabe tunisien (écriture arabe).

━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE N°2 — LONGUEUR ADAPTATIVE (CRITIQUE)
━━━━━━━━━━━━━━━━━━━━━━━━━
Adaptez TOUJOURS la longueur de votre réponse au type et à la complexité de la question :

🟢 RÉPONSE COURTE (1-3 phrases max) pour :
  - Questions simples de type oui/non (ex: "L'olivier supporte-t-il le gel ?")
  - Salutations ou messages sociaux (ex: "Bonjour", "merci", "ça va ?")
  - Questions factuelles directes (ex: "C'est quoi l'Œil de paon ?")
  - Confirmations ou reformulations
  → NE PAS ajouter de titres, listes, ou détails non demandés.

🔵 RÉPONSE MOYENNE (1 paragraphe ou liste courte de 3-5 points) pour :
  - Questions nécessitant une explication modérée (ex: "Pourquoi mes feuilles jaunissent ?")
  - Demandes de conseil général
  - Questions sur les symptômes d'une maladie

🟣 RÉPONSE LONGUE ET DÉTAILLÉE pour :
  - Demandes explicites de guide ou protocole complet (ex: "Expliquez-moi comment traiter l'Œil de paon étape par étape")
  - Questions techniques sur les doses, calendriers de traitement, ou prévention multi-étapes
  - Diagnostic complexe avec plusieurs facteurs

━━━━━━━━━━━━━━━━━━━━━━━━━
RÈGLE N°3 — QUALITÉ & TON
━━━━━━━━━━━━━━━━━━━━━━━━━
- Ton bienveillant, agricole, pratique et chaleureux.
- Utilisez les données et protocoles fournis en contexte lorsqu'ils sont pertinents.
- Ne répétez jamais la question de l'utilisateur dans votre réponse.
- N'ajoutez jamais de formule de politesse longue si la réponse doit être courte.
"""

_QUERY_TEMPLATE = """\
[CONTEXTE DIAGNOSTIC]
{diagnosis_context}

[PROTOCOLES AGRICOLES DISPONIBLES]
{protocols_context}

[QUESTION DE L'AGRICULTEUR]
{question}

[INSTRUCTION]
Répondez dans la MÊME LANGUE que la question. Adaptez la longueur de votre réponse à la complexité de la question (courte si simple, longue si technique).
"""


class RAGChain:
    def __init__(self) -> None:
        self._vectorstore = None
        self._llm = None
        self._ready = False

    # ── Lifecycle ─────────────────────────────────────────────────────────

    def load(self) -> None:
        self._load_vectorstore()
        self._load_llm()

    def _load_vectorstore(self) -> None:
        index_path: Path = settings.FAISS_INDEX_PATH
        if not index_path.exists():
            logger.warning("FAISS index not found at %s — chatbot in MOCK mode.", index_path)
            return
        try:
            from langchain_community.vectorstores import FAISS
            from langchain_huggingface import HuggingFaceEmbeddings

            embeddings = HuggingFaceEmbeddings(
                model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
            )
            self._vectorstore = FAISS.load_local(
                str(index_path),
                embeddings,
                allow_dangerous_deserialization=True,
            )
            logger.info("FAISS index loaded from %s", index_path)
        except Exception as exc:
            logger.error("Failed to load FAISS: %s", exc)

    def _load_llm(self) -> None:
        if not settings.MISTRAL_API_KEY:
            logger.warning("MISTRAL_API_KEY not set — chatbot in MOCK mode.")
            return
        try:
            from langchain_mistralai import ChatMistralAI
            self._llm = ChatMistralAI(
                model=settings.MISTRAL_MODEL,
                mistral_api_key=settings.MISTRAL_API_KEY,
                temperature=0.3,
                max_tokens=1024,
            )
            self._ready = True
            logger.info("Mistral AI client ready (model: %s)", settings.MISTRAL_MODEL)
        except Exception as exc:
            logger.error("Failed to init Mistral client: %s", exc)

    # ── Inference ─────────────────────────────────────────────────────────

    async def answer(
        self,
        question: str,
        diagnosis_context: dict | None = None,
    ) -> tuple[str, list[str]]:
        """
        Returns:
            answer          — LLM-generated response string
            protocol_ids    — list of retrieved protocol IDs
        """
        if not self._ready:
            return self._mock_answer(question), []

        # Retrieve relevant protocols
        retrieved_docs = []
        protocol_ids: list[str] = []
        if self._vectorstore:
            docs = self._vectorstore.similarity_search(question, k=3)
            retrieved_docs = docs
            protocol_ids = [d.metadata.get("id", "") for d in docs]

        protocols_context = "\n\n".join(
            f"[{d.metadata.get('id', 'P?')}] {d.page_content}" for d in retrieved_docs
        ) or "Aucun protocole spécifique trouvé."

        diag_str = json.dumps(diagnosis_context, ensure_ascii=False, indent=2) if diagnosis_context else "Aucun diagnostic joint."

        prompt = _QUERY_TEMPLATE.format(
            diagnosis_context=diag_str,
            protocols_context=protocols_context,
            question=question,
        )

        from langchain_core.messages import HumanMessage, SystemMessage
        messages = [
            SystemMessage(content=_SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]
        try:
            response = await self._llm.ainvoke(messages)
            return str(response.content), protocol_ids
        except Exception as exc:
            logger.error("Mistral AI call failed: %s — falling back to mock response", exc)
            return (
                "Bonjour ! En fonction des traitements agricoles recommandés :\n"
                "- Taillez et brûlez les rameaux affectés.\n"
                "- Appliquez un traitement à base d'hydroxide de cuivre à 0.3%.\n"
                f"Votre question : « {question} »"
            ), protocol_ids

    @staticmethod
    def _mock_answer(question: str) -> str:
        return (
            "Bonjour ! L'assistant répond dans votre langue. Veuillez configurer MISTRAL_API_KEY dans .env pour l'activer. "
            f"Votre question était : « {question} »"
        )


# Module-level singleton
rag_chain = RAGChain()
