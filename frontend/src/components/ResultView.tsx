"use client";

import { useState } from "react";
import { ArrowRight, Activity, ThermometerSun } from "lucide-react";
import { DiagnosisResult } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";
import { ChatWidget } from "./ChatWidget";

interface ResultViewProps {
  result: DiagnosisResult;
  originalImage: string;
  onReset: () => void;
}

export function ResultView({ result, originalImage, onReset }: ResultViewProps) {
  const { lang, t } = useLanguage();
  const [chatOpen, setChatOpen] = useState(false);

  // Severity colours
  const severityColors = {
    0: "bg-gray-100 text-gray-800 border-gray-200",
    1: "bg-green-100 text-green-800 border-green-200",
    2: "bg-yellow-100 text-yellow-800 border-yellow-200",
    3: "bg-orange-100 text-orange-800 border-orange-200",
    4: "bg-red-100 text-red-800 border-red-200",
  };
  const sc = severityColors[result.severity_level as keyof typeof severityColors] || severityColors[0];

  const severityLabels: Record<number, { ar: string; fr: string }> = {
    0: { ar: "سليمة", fr: "Aucune" },
    1: { ar: "خفيفة", fr: "Légère" },
    2: { ar: "متوسطة", fr: "Modérée" },
    3: { ar: "قوية", fr: "Élevée" },
    4: { ar: "خطيرة", fr: "Sévère" },
  };

  const severityText = severityLabels[result.severity_level]?.[lang === "fr" ? "fr" : "ar"] || (lang === "fr" ? "Inconnue" : "غير معروفة");

  return (
    <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden relative">
      
      {/* Heatmap Image Header */}
      <div className="relative h-64 w-full bg-black">
        <img src={originalImage} alt="Original" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        {result.grad_cam_heatmap && (
          <img 
            src={`data:image/png;base64,${result.grad_cam_heatmap}`} 
            alt="Heatmap" 
            className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className={`inline-flex px-3 py-1 rounded-full border text-sm font-bold mb-2 ${sc}`}>
            {severityText}
          </div>
          <h1 className="text-3xl font-bold text-white">{result.disease_class}</h1>
        </div>
      </div>

      <div className="p-6 space-y-6">
        
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-olive-50 rounded-2xl p-4 border border-olive-100">
            <div className="flex items-center gap-2 text-olive-600 mb-1">
              <Activity className="w-4 h-4" />
              <span className="text-xs font-medium">{lang === "fr" ? "Précision:" : "نسبة التأكد:"}</span>
            </div>
            <p className="text-2xl font-bold text-olive-900">{(result.confidence * 100).toFixed(1)}%</p>
          </div>
          
          <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <ThermometerSun className="w-4 h-4" />
              <span className="text-xs font-medium">{lang === "fr" ? "Risque météo:" : "خطر الطقس:"}</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{(result.risk_score * 100).toFixed(0)}%</p>
          </div>
        </div>

        {/* Severity Index Bar */}
        <div>
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-600">{lang === "fr" ? "Surface infectée (Infected Area)" : "مؤشر الضرر (Infected Area)"}</span>
            <span className="text-gray-900">{result.severity_index.toFixed(1)}%</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${result.severity_index > 50 ? 'bg-red-500' : result.severity_index > 20 ? 'bg-orange-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(100, result.severity_index)}%` }}
            ></div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="p-6 pt-0 space-y-3">
        <button 
          onClick={() => setChatOpen(true)}
          className="w-full bg-olive-600 hover:bg-olive-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-olive-600/20 transition-transform active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
        >
          {lang === "fr" ? "Demander le traitement au Chatbot" : "إسأل المساعد على الدواء"}
          <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
        </button>
        
        <button 
          onClick={onReset}
          className="w-full bg-white hover:bg-gray-50 text-olive-900 border border-olive-200 font-bold py-4 rounded-2xl transition-colors text-sm"
        >
          {lang === "fr" ? "Analyser une autre feuille" : "صور ورقة أخرى"}
        </button>
      </div>

      <ChatWidget 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)} 
        diagnosisContext={result}
      />
    </div>
  );
}
