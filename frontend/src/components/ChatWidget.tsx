"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, X, MessageSquarePlus, Clock, ChevronRight } from "lucide-react";
import { sendChatMessage, getConversations, Conversation, ConversationMessage } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { DiagnosisResult } from "@/lib/api";

interface ChatWidgetProps {
  diagnosisContext?: DiagnosisResult;
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
}

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === "fr" ? "fr-FR" : "ar-TN", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export function ChatWidget({ diagnosisContext, isOpen, onClose }: ChatWidgetProps) {
  const { lang, t } = useLanguage();
  const [view, setView] = useState<"history" | "chat">("history");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load history when opened
  useEffect(() => {
    if (isOpen) {
      const token = localStorage.getItem("token");
      if (token) {
        setLoadingHistory(true);
        getConversations().then(data => {
          setConversations(data);
          setLoadingHistory(false);
          // If no history, just go straight to chat
          if (data.length === 0) {
            startNewConversation(true);
          } else {
            setView("history");
          }
        }).catch(() => {
          setLoadingHistory(false);
          startNewConversation(true);
        });
      } else {
        // Not logged in, go straight to chat
        startNewConversation(true);
      }
    }
  }, [isOpen]);

  const startNewConversation = (autoAsk = false) => {
    // Generate an ID without relying on crypto.randomUUID() which is undefined in HTTP non-localhost contexts
    const randomId = Date.now().toString(36) + Math.random().toString(36).substring(2);
    setCurrentConversationId(randomId);
    
    if (autoAsk && diagnosisContext && diagnosisContext.disease_class !== "Healthy") {
      const askMsg = lang === "fr" 
        ? `Donne-moi le plan de traitement détaillé pour cette maladie : ${diagnosisContext.disease_class}.` 
        : `شنوة الدواء للمرض هذا : ${diagnosisContext.disease_class}؟`;
      setView("chat");
      handleSend(askMsg, randomId);
    } else {
      setMessages([{ id: "1", role: "bot", content: t("chat.welcome") }]);
      setView("chat");
    }
  };

  const openConversation = (conv: Conversation) => {
    setCurrentConversationId(conv.conversation_id);
    const loadedMessages: Message[] = [];
    conv.messages.forEach(m => {
      loadedMessages.push({ id: `q-${m.id}`, role: "user", content: m.question });
      loadedMessages.push({ id: `a-${m.id}`, role: "bot", content: m.answer });
    });
    // Add welcome message at start if empty (shouldn't be, but just in case)
    if (loadedMessages.length === 0) {
      loadedMessages.push({ id: "1", role: "bot", content: t("chat.welcome") });
    }
    setMessages(loadedMessages);
    setView("chat");
  };

  useEffect(() => {
    if (scrollRef.current && view === "chat") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, view]);

  const handleSend = async (overrideMsg?: string, overrideConvId?: string) => {
    const userMsg = overrideMsg && typeof overrideMsg === 'string' ? overrideMsg : input.trim();
    if (!userMsg) return;

    if (typeof overrideMsg !== 'string') setInput("");
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(userMsg, diagnosisContext, overrideConvId || currentConversationId || undefined);
      if (res.conversation_id && !(overrideConvId || currentConversationId)) {
        setCurrentConversationId(res.conversation_id);
      }
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "bot", content: res.answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "bot",
          content: lang === "fr" ? "Désolé, problème de connexion au serveur." : "عذراً، فمة مشكلة في الاتصال.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 sm:inset-auto sm:bottom-6 sm:left-6 sm:w-96 sm:h-[600px] bg-white sm:rounded-3xl shadow-2xl flex flex-col border border-olive-100 overflow-hidden animate-in slide-in-from-bottom-10">
      {/* Header */}
      <div className="bg-olive-600 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full cursor-pointer hover:bg-white/30 transition-colors" onClick={() => conversations.length > 0 && setView("history")}>
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm">{t("chat.title")}</h3>
            <p className="text-xs text-olive-100 opacity-90">{t("chat.subtitle")}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {view === "history" ? (
        /* History View */
        <div className="flex-1 overflow-y-auto bg-olive-50/30 p-4 flex flex-col gap-3">
          <button
            onClick={() => startNewConversation(true)}
            className="w-full bg-white border border-olive-200 hover:border-olive-400 hover:shadow-md text-olive-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all group"
          >
            <MessageSquarePlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {lang === "fr" ? "Nouvelle conversation" : "محادثة جديدة"}
          </button>
          
          <div className="mt-2 space-y-2">
            <h4 className="text-xs font-bold text-gray-400 uppercase px-2 mb-3">
              {lang === "fr" ? "Conversations récentes" : "المحادثات الأخيرة"}
            </h4>
            
            {loadingHistory ? (
              <div className="flex justify-center p-6">
                <div className="w-6 h-6 border-2 border-olive-200 border-t-olive-600 rounded-full animate-spin" />
              </div>
            ) : conversations.map(conv => (
              <button
                key={conv.conversation_id}
                onClick={() => openConversation(conv)}
                className="w-full text-left bg-white border border-gray-100 hover:border-olive-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <p className="text-sm font-semibold text-gray-800 line-clamp-1 flex-1">
                    {conv.first_question}
                  </p>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-olive-500 transition-colors rtl:-scale-x-100" />
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(conv.last_timestamp, lang)}
                  </span>
                  <span>
                    {conv.message_count} {lang === "fr" ? "msgs" : "رسالة"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Chat View */
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-olive-50/30" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-start" : "justify-end"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl p-3 ${
                    msg.role === "user"
                      ? "bg-olive-100 text-olive-900 rounded-tr-none"
                      : "bg-white border border-olive-100 text-gray-800 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-white border border-olive-100 rounded-2xl rounded-tl-none p-3 shadow-sm flex gap-1">
                  <div className="w-2 h-2 bg-olive-300 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-olive-300 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-olive-300 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 bg-white border-t border-olive-100">
            <div className="flex items-center gap-2 bg-olive-50 rounded-full p-1 pl-4">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("chat.placeholder")}
                className="flex-1 bg-transparent border-none outline-none text-sm py-2 px-2"
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="bg-olive-600 text-white p-2 rounded-full hover:bg-olive-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <Send className="w-4 h-4 rtl:-scale-x-100" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
