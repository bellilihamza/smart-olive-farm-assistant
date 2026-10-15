"use client";

import { useLanguage } from "@/context/LanguageContext";
import { Bell, AlertCircle } from "lucide-react";

export function AlertsWidget() {
  const { t } = useLanguage();

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
          <Bell className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{t("farmer_tools.alerts")}</h3>
          <p className="text-xs text-gray-500">{t("farmer_tools.alerts_desc")}</p>
        </div>
      </div>

      <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <p className="text-sm font-medium text-red-800 leading-snug">
          {t("farmer_tools.alert_1")}
        </p>
      </div>
    </div>
  );
}
