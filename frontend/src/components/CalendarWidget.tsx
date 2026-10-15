"use client";

import { useLanguage } from "@/context/LanguageContext";
import { CalendarDays, CheckCircle2 } from "lucide-react";

export function CalendarWidget() {
  const { t, lang } = useLanguage();
  
  const tasks = [
    t("farmer_tools.task_1"),
    t("farmer_tools.task_2"),
    t("farmer_tools.task_3"),
  ];

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-olive-50 text-olive-600 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{t("farmer_tools.calendar")}</h3>
          <p className="text-xs text-gray-500">{t("farmer_tools.calendar_desc")}</p>
        </div>
      </div>

      <div className="space-y-3">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-colors cursor-pointer group">
            <CheckCircle2 className="w-5 h-5 text-gray-300 group-hover:text-olive-500 transition-colors flex-shrink-0" />
            <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{task}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
