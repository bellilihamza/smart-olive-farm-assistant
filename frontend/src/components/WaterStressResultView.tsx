"use client";

import { Droplets, TreePine, RefreshCw } from "lucide-react";
import { WaterStressResult } from "@/lib/api";
import { useLanguage } from "@/context/LanguageContext";

interface WaterStressResultViewProps {
  result: WaterStressResult;
  originalImage: string;
  onReset: () => void;
}

export function WaterStressResultView({ result, originalImage, onReset }: WaterStressResultViewProps) {
  const { lang } = useLanguage();

  // Badge color based on stress class
  const badgeStyle = {
    0: { bg: "bg-green-100 text-green-800 border-green-200", bar: "bg-green-500", accent: "from-green-50 to-emerald-50", border: "border-green-100" },
    1: { bg: "bg-yellow-100 text-yellow-800 border-yellow-200", bar: "bg-yellow-500", accent: "from-yellow-50 to-amber-50", border: "border-yellow-100" },
    2: { bg: "bg-orange-100 text-orange-800 border-orange-200", bar: "bg-orange-500", accent: "from-orange-50 to-amber-50", border: "border-orange-100" },
    3: { bg: "bg-red-100 text-red-800 border-red-200", bar: "bg-red-500", accent: "from-red-50 to-rose-50", border: "border-red-100" },
  }[result.water_stress_class_id] || { bg: "bg-gray-100 text-gray-800 border-gray-200", bar: "bg-gray-500", accent: "from-gray-50 to-slate-50", border: "border-gray-100" };

  const stressLabel = lang === "fr" ? result.water_stress_level_fr : lang === "ar" ? result.water_stress_level_ar : result.water_stress_level;

  return (
    <div className={`w-full bg-gradient-to-br ${badgeStyle.accent} rounded-3xl border ${badgeStyle.border} shadow-sm overflow-hidden`}>
      {/* Image Header */}
      <div className="relative h-48 w-full bg-blue-900">
        <img src={originalImage} alt="Tree" className="absolute inset-0 w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <Droplets className="w-5 h-5 text-blue-300" />
            <span className="text-blue-200 text-xs font-medium">
              {lang === "fr" ? "Analyse du Stress Hydrique" : "تحليل الإجهاد المائي"}
            </span>
          </div>
          <div className={`inline-flex px-3 py-1 rounded-full border text-sm font-bold mb-1 ${badgeStyle.bg}`}>
            {stressLabel}
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/60 rounded-2xl p-4 border border-blue-100/50">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <TreePine className="w-4 h-4" />
              <span className="text-xs font-medium">{lang === "fr" ? "Irrigation détectée:" : "فئة الري:"}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{result.water_stress_class}</p>
          </div>
          <div className="bg-white/60 rounded-2xl p-4 border border-blue-100/50">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Droplets className="w-4 h-4" />
              <span className="text-xs font-medium">{lang === "fr" ? "Confiance:" : "نسبة التأكد:"}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{(result.water_stress_confidence * 100).toFixed(1)}%</p>
          </div>
        </div>

        {/* Stress bar */}
        <div>
          <div className="flex justify-between text-sm font-medium mb-2">
            <span className="text-gray-600">{lang === "fr" ? "Niveau de stress" : "مستوى الإجهاد"}</span>
            <span className="text-gray-900">{stressLabel}</span>
          </div>
          <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className={`h-full ${badgeStyle.bar} transition-all`} 
              style={{ width: `${((result.water_stress_class_id + 1) / 4) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 mt-1">
            <span>{lang === "fr" ? "Sain" : "سليم"}</span>
            <span>{lang === "fr" ? "Sévère" : "شديد"}</span>
          </div>
        </div>

        {/* Reset button */}
        <button 
          onClick={onReset}
          className="w-full bg-white hover:bg-gray-50 text-blue-900 border border-blue-200 font-bold py-3 rounded-2xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          {lang === "fr" ? "Analyser un autre arbre" : "حلّل شجرة أخرى"}
        </button>
      </div>
    </div>
  );
}
