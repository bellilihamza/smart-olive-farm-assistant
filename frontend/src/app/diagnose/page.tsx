"use client";

import { useState, useEffect } from "react";
import { UploadCard } from "@/components/UploadCard";
import { DiagnosisResult, WaterStressResult, getDiagnosisHistory, HistoryItem } from "@/lib/api";
import { ResultView } from "@/components/ResultView";
import { WaterStressResultView } from "@/components/WaterStressResultView";
import { WeatherWidget } from "@/components/WeatherWidget";
import { AlertsWidget } from "@/components/AlertsWidget";
import { CalendarWidget } from "@/components/CalendarWidget";
import { Leaf, Shield, Zap, Cpu, ArrowRight, History, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const severityColors: Record<number, string> = {
  0: "text-gray-700 bg-gray-50 border-gray-200",
  1: "text-green-700 bg-green-50 border-green-200",
  2: "text-yellow-700 bg-yellow-50 border-yellow-200",
  3: "text-orange-700 bg-orange-50 border-orange-200",
  4: "text-red-700 bg-red-50 border-red-200",
};

const severityLabel: Record<number, { ar: string; fr: string }> = {
  0: { ar: "سليمة", fr: "Aucune" },
  1: { ar: "خفيفة", fr: "Légère" },
  2: { ar: "متوسطة", fr: "Modérée" },
  3: { ar: "قوية", fr: "Élevée" },
  4: { ar: "خطيرة", fr: "Sévère" },
};

function formatDate(iso: string, lang: string) {
  return new Date(iso).toLocaleString(lang === "fr" ? "fr-FR" : "ar-TN", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function DiagnosePage() {
  const { lang, t } = useLanguage();
  const [result, setResult] = useState<{ data: DiagnosisResult; image: string } | null>(null);
  const [waterStressResult, setWaterStressResult] = useState<{ data: WaterStressResult; image: string } | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      getDiagnosisHistory().then(setHistory).catch(console.error);
    }
  }, []);

  const steps = [
    {
      num: "01",
      title: lang === "fr" ? "Prenez une photo" : "التقط صورة",
      desc: lang === "fr" ? "Feuille isolée (maladie) ou arbre entier (stress hydrique)" : "ورقة منفصلة (مرض) أو شجرة كاملة (إجهاد مائي)",
    },
    {
      num: "02",
      title: lang === "fr" ? "Analyse IA" : "حلّل الصورة",
      desc: lang === "fr" ? "5 modèles IA détectent maladie et stress hydrique" : "5 نماذج ذكاء اصطناعي تكشف المرض والإجهاد المائي",
    },
    {
      num: "03",
      title: lang === "fr" ? "Plan de traitement" : "احصل على العلاج",
      desc: lang === "fr" ? "Recommandation instantanée par Mistral AI" : "خطة علاج فورية من Mistral AI",
    },
  ];

  // Show upload card only if neither result is present
  const showUpload = !result && !waterStressResult;

  return (
    <div className="min-h-screen gradient-hero">
      {/* Breadcrumb */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <nav className="flex items-center gap-2 text-sm text-olive-600">
          <Link href="/" className="hover:text-olive-800 transition-colors">
            {t("nav.home")}
          </Link>
          <span className="text-olive-300">/</span>
          <span className="text-olive-900 font-semibold">{t("diagnose.title")}</span>
        </nav>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid lg:grid-cols-2 gap-12 items-start">

          {/* Left: Upload & Results */}
          <div>
            <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-olive-200">
              <Cpu className="w-3.5 h-3.5" />
              YOLOv8 · U-Net · ResNet-50 · LSTM
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-olive-900 mb-3 leading-tight">
              {t("diagnose.title")}
              <span className="block text-olive-600 text-2xl mt-1">{t("diagnose.subtitle")}</span>
            </h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {t("diagnose.desc")}
            </p>

            {/* Upload card (shows when no results yet) */}
            {showUpload && (
              <UploadCard
                onAnalysisComplete={(data, image) => setResult({ data, image })}
                onWaterStressComplete={(data, image) => setWaterStressResult({ data, image })}
              />
            )}

            {/* Disease result card */}
            {result && (
              <div className="mb-6">
                <ResultView
                  result={result.data}
                  originalImage={result.image}
                  onReset={() => setResult(null)}
                />
              </div>
            )}

            {/* Water stress result card */}
            {waterStressResult && (
              <div className="mb-6">
                <WaterStressResultView
                  result={waterStressResult.data}
                  originalImage={waterStressResult.image}
                  onReset={() => setWaterStressResult(null)}
                />
              </div>
            )}

            {/* Trust */}
            <div className="flex flex-wrap gap-4 mt-6">
              {[
                { icon: Shield, text: lang === "fr" ? "Données sécurisées INPDP" : "بيانات مجهولة الهوية" },
                { icon: Zap, text: lang === "fr" ? "Résultats en < 5s" : "نتائج في 5 ثوانٍ" },
                { icon: Leaf, text: lang === "fr" ? "Gratuit pour les agriculteurs" : "مجاني للفلاحين" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/70 px-3 py-1.5 rounded-full border border-gray-200">
                  <Icon className="w-3.5 h-3.5 text-olive-500" />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right: How it works + Model pipeline */}
          <div className="space-y-6">
            {/* Steps */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
              <h2 className="font-bold text-gray-900 mb-5">
                {lang === "fr" ? "Comment ça marche ?" : "كيف يعمل النظام؟"}
              </h2>
              <div className="space-y-5">
                {steps.map(({ num, title, desc }) => (
                  <div key={num} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-olive-600 text-white font-extrabold text-sm flex items-center justify-center shadow-md shadow-olive-600/20">
                      {num}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{title}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Pipeline */}
            {isLoggedIn ? (
              <>
                <WeatherWidget />
                <AlertsWidget />
                <CalendarWidget />
              </>
            ) : (
              <>
                <div className="bg-olive-900 rounded-3xl p-7 text-white">
                  <h2 className="font-bold text-white mb-2 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-olive-300" />
                    {lang === "fr" ? "Pipeline de Modèles IA" : "سلسلة نماذج الذكاء الاصطناعي"}
                  </h2>
                  <p className="text-olive-300 text-xs mb-5">
                    {lang === "fr" ? "4 modèles exécutés en séquence" : "4 نماذج تعمل بالتسلسل لإنتاج تشخيص دقيق"}
                  </p>
                  <div className="space-y-3">
                    {[
                      { name: "YOLOv8", role: lang === "fr" ? "Détection & localisation des lésions" : "كشف وتحديد مكان المرض على الورقة", color: "bg-green-500" },
                      { name: "U-Net", role: lang === "fr" ? "Segmentation précise de la zone infectée" : "تجزئة دقيقة للمنطقة المصابة", color: "bg-blue-500" },
                      { name: "ResNet-50", role: lang === "fr" ? "Classification (94% précision)" : "تصنيف نوع المرض بدقة 94%", color: "bg-purple-500" },
                      { name: "LSTM", role: lang === "fr" ? "Prédiction du risque sur 7 jours" : "توقع تطور الخطر خلال 7 أيام", color: "bg-orange-500" },
                    ].map(({ name, role, color }, i) => (
                      <div key={name} className="flex items-center gap-3">
                        <div className={`w-2 h-8 rounded-full ${color} flex-shrink-0`} />
                        <div className="flex-1">
                          <p className="text-white font-bold text-sm">{name}</p>
                          <p className="text-olive-300 text-xs">{role}</p>
                        </div>
                        {i < 3 && <ArrowRight className="w-4 h-4 text-olive-500 flex-shrink-0 -rotate-90" />}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Supported diseases */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                  <h2 className="font-bold text-gray-900 mb-4 text-sm">
                    {lang === "fr" ? "Maladies Détectées" : "الأمراض المكتشفة"}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {["Peacock Spot (Œil de paon)", "Olive Knot (Galle)", "Verticillium Wilt (Verticilliose)", "Sooty Mold (Fumagine)", "Leaf Scorch", "Healthy (Saine) ✓"].map((d) => (
                      <span key={d} className="bg-olive-50 text-olive-800 text-xs font-semibold px-3 py-1 rounded-full border border-olive-100">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* History Section */}
      {isLoggedIn && history.length > 0 && (
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center">
                <History className="w-5 h-5 text-olive-600" />
              </div>
              <h2 className="font-bold text-gray-900 text-lg">
                {lang === "fr" ? "Historique de vos diagnostics" : "سجل التشخيصات الخاصة بك"}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {history.map((d) => (
                <div key={d.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-olive-50 border border-olive-100 flex items-center justify-center flex-shrink-0 text-2xl">
                    {d.disease_class === "Healthy" ? "✅" : "🍃"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{d.disease_class}</h3>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${severityColors[d.severity_level] || ""}`}>
                        {severityLabel[d.severity_level]?.[lang === "fr" ? "fr" : "ar"] || ""}
                      </span>
                      <span className="text-xs text-gray-400 font-medium">
                        {(d.confidence * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex flex-col gap-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(d.timestamp, lang)}
                      </span>
                      {d.risk_score && (
                        <span className="flex items-center gap-1 text-orange-500 font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          {(d.risk_score * 100).toFixed(0)}% {lang === "fr" ? "risque" : "خطر"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
