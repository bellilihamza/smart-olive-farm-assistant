"use client";

import { useState } from "react";
import { Camera, ImageUp, Loader2, Leaf, Sparkles, TreePine } from "lucide-react";
import { analyzeImage, analyzeWaterStress, DiagnosisResult, WaterStressResult } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface UploadCardProps {
  onAnalysisComplete: (result: DiagnosisResult, originalImage: string) => void;
  onWaterStressComplete?: (result: WaterStressResult, originalImage: string) => void;
}

export function UploadCard({ onAnalysisComplete, onWaterStressComplete }: UploadCardProps) {
  const { lang } = useLanguage();
  const [loadingDisease, setLoadingDisease] = useState(false);
  const [loadingStress, setLoadingStress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOverLeaf, setDragOverLeaf] = useState(false);
  const [dragOverTree, setDragOverTree] = useState(false);

  // ── Disease analysis (leaf photo) ──────────────────────────────────────
  const processLeafFile = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setLoadingDisease(true);
    setError(null);
    try {
      const result = await analyzeImage(file);
      onAnalysisComplete(result, imageUrl);
    } catch (err: any) {
      setError(err.message || (lang === "fr" ? "Erreur pendant l'analyse." : "حدث خطأ أثناء التحليل."));
    } finally {
      setLoadingDisease(false);
    }
  };

  // ── Water stress analysis (tree/plant photo) ──────────────────────────
  const processTreeFile = async (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setLoadingStress(true);
    setError(null);
    try {
      const result = await analyzeWaterStress(file);
      onWaterStressComplete?.(result, imageUrl);
    } catch (err: any) {
      setError(err.message || (lang === "fr" ? "Erreur pendant l'analyse." : "حدث خطأ أثناء التحليل."));
    } finally {
      setLoadingStress(false);
    }
  };

  const handleLeafChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processLeafFile(file);
  };

  const handleTreeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processTreeFile(file);
  };

  const handleLeafDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverLeaf(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) await processLeafFile(file);
  };

  const handleTreeDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverTree(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) await processTreeFile(file);
  };

  // ── Loading state ─────────────────────────────────────────────────────
  if (loadingDisease || loadingStress) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-12 bg-white rounded-3xl shadow-xl border border-olive-100 min-h-[320px]">
        {/* Animated rings */}
        <div className="relative flex items-center justify-center">
          <div className="absolute w-24 h-24 rounded-full border-4 border-olive-200 animate-ping opacity-30" />
          <div className="absolute w-20 h-20 rounded-full border-4 border-olive-300 animate-ping opacity-40 [animation-delay:0.3s]" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-olive-500 to-olive-700 shadow-lg shadow-olive-600/30">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold text-olive-900">
            {loadingDisease
              ? (lang === "fr" ? "Analyse de la feuille..." : "قاعدين نحللو في التصويرة...")
              : (lang === "fr" ? "Analyse du stress hydrique..." : "قاعدين نحللو الإجهاد المائي...")}
          </p>
          <p className="text-sm text-olive-600 mt-1 font-medium">
            {loadingDisease ? "YOLOv8 → U-Net → ResNet-50 → LSTM" : "ResNet-50 Water Stress Model"}
          </p>
        </div>
        {/* Step indicators */}
        <div className="flex gap-2">
          {(loadingDisease
            ? (lang === "fr" ? ["Détection", "Sévérité", "Risque"] : ["كشف المرض", "تحديد الشدة", "حساب الخطر"])
            : (lang === "fr" ? ["Chargement", "Classification", "Résultat"] : ["تحميل", "تصنيف", "نتيجة"])
          ).map((step, i) => (
            <div key={step} className="flex items-center gap-1">
              <div className={`h-2 w-2 rounded-full bg-olive-400 animate-bounce`} style={{ animationDelay: `${i * 0.2}s` }} />
              {i < 2 && <div className="h-0.5 w-6 bg-olive-200" />}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl shadow-olive-900/8 border border-olive-100 w-full overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-olive-600 to-olive-800 p-6 relative overflow-hidden">
        <div className="absolute -top-6 -right-6 opacity-10">
          <Leaf className="w-32 h-32 text-white" />
        </div>
        <div className="absolute -bottom-4 -left-4 opacity-5">
          <Sparkles className="w-24 h-24 text-white" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-white/80 text-sm font-medium">AI · YOLOv8 · FAISS RAG</span>
          </div>
          <h2 className="text-2xl font-bold text-white leading-snug">
            {lang === "fr" ? "Bienvenue dans l'Assistant IA" : "مرحباً بيك في المساعد الذكي"}
          </h2>
          <p className="text-olive-200 text-sm mt-1">
            {lang === "fr"
              ? "Deux analyses indépendantes : maladie (feuille) et stress hydrique (arbre entier)."
              : "تحليلين مستقلين : مرض (ورقة) و إجهاد مائي (شجرة كاملة)."}
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="p-6">
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm border border-red-100">
            <span className="flex-shrink-0 text-lg">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* ── Zone 1: Leaf Disease Upload ── */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-olive-100 flex items-center justify-center">
              <Leaf className="w-4 h-4 text-olive-700" />
            </div>
            <div>
              <h3 className="font-bold text-olive-900 text-sm">
                {lang === "fr" ? "Analyse de Maladie" : "تحليل المرض"}
              </h3>
              <p className="text-[10px] text-gray-500">
                {lang === "fr" ? "Photo d'une feuille d'olivier isolée" : "صورة ورقة زيتون منفصلة"}
              </p>
            </div>
          </div>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOverLeaf(true); }}
            onDragLeave={() => setDragOverLeaf(false)}
            onDrop={handleLeafDrop}
            className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6 ${
              dragOverLeaf
                ? "border-olive-500 bg-olive-50 scale-[1.01]"
                : "border-olive-200 bg-olive-50/40 hover:border-olive-400 hover:bg-olive-50"
            }`}
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl mb-3 transition-all ${
              dragOverLeaf ? "bg-olive-600 text-white scale-110" : "bg-olive-100 text-olive-700"
            }`}>
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-olive-900 mb-0.5">
              {lang === "fr" ? "📷 Photo de la Feuille" : "📷 صورة الورقة"}
            </p>
            <p className="text-xs text-olive-600">
              {lang === "fr" ? "Glissez ou cliquez · JPEG / PNG / WEBP" : "اسحب أو انقر · JPEG / PNG / WEBP"}
            </p>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleLeafChange}
            />
          </label>
        </div>

        {/* ── Zone 2: Tree Water Stress Upload ── */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <TreePine className="w-4 h-4 text-blue-700" />
            </div>
            <div>
              <h3 className="font-bold text-blue-900 text-sm">
                {lang === "fr" ? "Analyse du Stress Hydrique" : "تحليل الإجهاد المائي"}
              </h3>
              <p className="text-[10px] text-gray-500">
                {lang === "fr" ? "Photo de l'arbre entier ou de la plante en pot" : "صورة الشجرة الكاملة أو النبتة في الأصيص"}
              </p>
            </div>
          </div>
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOverTree(true); }}
            onDragLeave={() => setDragOverTree(false)}
            onDrop={handleTreeDrop}
            className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 p-6 ${
              dragOverTree
                ? "border-blue-500 bg-blue-50 scale-[1.01]"
                : "border-blue-200 bg-blue-50/40 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <div className={`flex items-center justify-center w-12 h-12 rounded-2xl mb-3 transition-all ${
              dragOverTree ? "bg-blue-600 text-white scale-110" : "bg-blue-100 text-blue-700"
            }`}>
              <TreePine className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-blue-900 mb-0.5">
              {lang === "fr" ? "🌳 Photo de l'Arbre" : "🌳 صورة الشجرة"}
            </p>
            <p className="text-xs text-blue-600">
              {lang === "fr" ? "Glissez ou cliquez · JPEG / PNG / WEBP" : "اسحب أو انقر · JPEG / PNG / WEBP"}
            </p>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleTreeChange}
            />
          </label>
        </div>
      </div>

      {/* Footer Note */}
      <div className="px-6 pb-5 text-center">
        <p className="text-xs text-olive-500">
          {lang === "fr" ? "Données sécurisées & anonymisées · INPDP Compliant" : "بياناتك محمية ومجهولة الهوية · INPDP Compliant"}
        </p>
      </div>
    </div>
  );
}
