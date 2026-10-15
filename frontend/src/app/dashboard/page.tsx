"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Activity, Map as MapIcon, TrendingUp, AlertTriangle, BarChart2, Users, Globe, Lock, Filter } from "lucide-react";
import { RiskForecast } from "@/components/RiskForecast";
import { useLanguage } from "@/context/LanguageContext";
import { getDashboardStats, DashboardStats } from "@/lib/api";
import Link from "next/link";

const ChoroMap = dynamic(() => import("@/components/ChoroMap"), { ssr: false });

export default function DashboardPage() {
  const { lang, t } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [daysFilter, setDaysFilter] = useState(30);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isInspector, setIsInspector] = useState(false);

  useEffect(() => {
    // Auth check
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      setError("unauthorized");
      setLoading(false);
      return;
    }
    try {
      const user = JSON.parse(userStr);
      if (user.role !== "inspector") {
        setError("forbidden");
        setLoading(false);
        return;
      }
      setIsInspector(true);
    } catch {
      setError("unauthorized");
      setLoading(false);
      return;
    }
  }, []);

  useEffect(() => {
    if (!isInspector) return;
    
    setLoading(true);
    getDashboardStats(daysFilter)
      .then((data) => {
        if (data) setStats(data);
        else setError("fetch_error");
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("fetch_error");
        setLoading(false);
      });
  }, [daysFilter, isInspector]);

  useEffect(() => {
    if (!isInspector) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/events`);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "new_diagnosis") {
        setEvents((prev) => [data, ...prev].slice(0, 10));
      }
    };
    return () => ws.close();
  }, [isInspector]);

  if (loading && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/80">
        <div className="flex flex-col items-center gap-4 text-olive-600">
          <div className="w-10 h-10 border-4 border-olive-200 border-t-olive-600 rounded-full animate-spin" />
          <p className="font-semibold text-sm">
            {lang === "fr" ? "Chargement des données de surveillance..." : "جاري تحميل بيانات المراقبة..."}
          </p>
        </div>
      </div>
    );
  }

  if (error === "unauthorized" || error === "forbidden") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50/80 p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-red-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {lang === "fr" ? "Accès Restreint" : "وصول مقيد"}
          </h2>
          <p className="text-gray-500 mb-6">
            {lang === "fr" 
              ? "Ce tableau de bord est réservé aux inspecteurs du CRDA. Veuillez vous connecter avec un compte autorisé." 
              : "لوحة القيادة هذه مخصصة لمفتشي CRDA فقط. يرجى تسجيل الدخول بحساب مصرح له."}
          </p>
          <Link href="/login" className="inline-flex items-center justify-center w-full px-4 py-2.5 bg-olive-600 hover:bg-olive-700 text-white font-bold rounded-xl transition-colors">
            {lang === "fr" ? "Se connecter" : "تسجيل الدخول"}
          </Link>
        </div>
      </div>
    );
  }

  const kpiCards = [
    { label: lang === "fr" ? `Diagnostics (${daysFilter}j)` : `التشخيصات (${daysFilter} يوم)`, value: stats?.national_total || 0, icon: BarChart2, color: "text-olive-700", bg: "bg-olive-50", border: "border-olive-200" },
    { label: lang === "fr" ? "Alertes Sévères" : "تنبيهات خطيرة", value: stats?.active_alerts || 0, icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
    { label: lang === "fr" ? "Régions Touchées" : "المناطق المتضررة", value: stats?.regions_monitored || 0, icon: Globe, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
    { label: lang === "fr" ? "Agriculteurs Actifs" : "فلاحون نشطون", value: stats?.registered_farmers || 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
  ];

  return (
    <div className="min-h-screen bg-gray-50/80" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {lang === "fr" ? "Tableau de Bord de Surveillance Nationale" : "لوحة المراقبة الوطنية"}
            </h1>
            <p className="text-gray-500 text-sm mt-0.5">
              {lang === "fr" ? "Vue Inspecteur CRDA · Conforme INPDP · Données Anonymisées" : "عرض مفتش CRDA · متوافق مع INPDP · بيانات مجهولة"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Filter */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
              <Filter className="w-4 h-4 text-gray-400 mx-2" />
              {[7, 30, 90].map((days) => (
                <button
                  key={days}
                  onClick={() => setDaysFilter(days)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    daysFilter === days ? "bg-olive-100 text-olive-800" : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {days} {lang === "fr" ? "Jours" : "أيام"}
                </button>
              ))}
            </div>
            
            <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-200 rounded-xl px-4 py-2 text-sm font-semibold whitespace-nowrap shadow-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              {lang === "fr" ? "Direct" : "مباشر"}
            </div>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label} className={`bg-white rounded-2xl border ${border} p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}>
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${bg} mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* Main Grid: Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Map - takes 2/3 */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col min-h-[520px]">
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-gray-100">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
                <MapIcon className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 text-sm">
                  {lang === "fr" ? "Carte Épidémiologique" : "الخريطة الوبائية"}
                </h2>
                <p className="text-xs text-gray-400">
                  {lang === "fr" ? "Intensité par gouvernorat" : "الشدة حسب الولاية"}
                </p>
              </div>
            </div>
            <div className="flex-1 relative z-0 min-h-[400px]">
              <ChoroMap governorateStats={stats?.governorate_stats || []} />
            </div>
          </div>

          {/* Sidebar - Risk + Live Feed */}
          <div className="flex flex-col gap-6">

            {/* Risk Forecast */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-50">
                  <TrendingUp className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">
                    {lang === "fr" ? "Prévision des Risques (7 Jours)" : "توقعات المخاطر (7 أيام)"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {lang === "fr" ? "Modèle climatique" : "نموذج مناخي"}
                  </p>
                </div>
              </div>
              <RiskForecast />
            </div>

            {/* Live Feed */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-50">
                  <Activity className="w-4 h-4 text-red-500 animate-pulse" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900 text-sm">
                    {lang === "fr" ? "Flux Anonymisé en Direct" : "البث المباشر المجهول"}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {lang === "fr" ? "Événements en temps réel" : "أحداث في الوقت الفعلي"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 max-h-64 pr-1">
                {events.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Activity className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500 font-medium">
                      {lang === "fr" ? "En attente d'événements..." : "في انتظار الأحداث..."}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === "fr" ? "Les nouveaux diagnostics apparaîtront ici" : "ستظهر التشخيصات الجديدة هنا"}
                    </p>
                  </div>
                ) : (
                  events.map((ev, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 animate-in text-sm"
                    >
                      <div className={`flex-shrink-0 p-1.5 rounded-lg mt-0.5 ${ev.severity_level > 2 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"}`}>
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{ev.disease_class}</p>
                        <p className="text-xs text-gray-500">{ev.governorate} · {lang === "fr" ? "Niveau" : "المستوى"} {ev.severity_level}</p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {lang === "fr" ? "À l'instant" : "الآن"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Top Governorates Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-olive-50 flex items-center justify-center">
              <BarChart2 className="w-4 h-4 text-olive-600" />
            </div>
            <h2 className="font-semibold text-gray-900 text-sm">
              {lang === "fr" ? "Statistiques par Gouvernorat" : "إحصائيات حسب الولاية"}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className={`text-${lang === "ar" ? "right" : "left"} px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide`}>
                    {lang === "fr" ? "Gouvernorat" : "الولاية"}
                  </th>
                  <th className={`text-${lang === "ar" ? "right" : "left"} px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide`}>
                    {lang === "fr" ? "Cas" : "الحالات"}
                  </th>
                  <th className={`text-${lang === "ar" ? "right" : "left"} px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide`}>
                    {lang === "fr" ? "Maladie Dominante" : "المرض السائد"}
                  </th>
                  <th className={`text-${lang === "ar" ? "right" : "left"} px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide`}>
                    {lang === "fr" ? "Risque Moyen" : "متوسط الخطر"}
                  </th>
                  <th className={`text-${lang === "ar" ? "right" : "left"} px-5 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wide`}>
                    {lang === "fr" ? "Intensité Épidémiologique" : "الشدة الوبائية"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats?.governorate_stats.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                      {lang === "fr" ? "Aucune donnée disponible pour cette période." : "لا توجد بيانات متاحة لهذه الفترة."}
                    </td>
                  </tr>
                )}
                {stats?.governorate_stats.map((row, i) => (
                  <tr key={row.governorate} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === stats.governorate_stats.length - 1 ? "border-0" : ""}`}>
                    <td className="px-5 py-3.5 font-semibold text-gray-800">{row.governorate}</td>
                    <td className="px-5 py-3.5 text-gray-600">{row.total_events.toLocaleString()}</td>
                    <td className="px-5 py-3.5">
                      <span className="bg-olive-50 text-olive-800 text-xs font-medium px-2.5 py-1 rounded-full border border-olive-100">{row.dominant_disease}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`font-bold ${row.avg_risk_score > 0.6 ? "text-red-600" : row.avg_risk_score > 0.35 ? "text-orange-500" : "text-green-600"}`}>
                        {(row.avg_risk_score * 100).toFixed(0)}%
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-20 bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${row.epidemiological_intensity > 0.6 ? "bg-red-500" : row.epidemiological_intensity > 0.35 ? "bg-orange-400" : "bg-green-500"}`}
                            style={{ width: `${row.epidemiological_intensity * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">{(row.epidemiological_intensity * 100).toFixed(0)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
