"use client";

import { useState } from "react";
import { Leaf, Eye, EyeOff, LogIn, UserPlus, Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginPage() {
  const { lang, t } = useLanguage();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", name: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const body = new URLSearchParams({
          username: form.email,
          password: form.password,
        });
        const res = await fetch("http://localhost:8000/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || (lang === "fr" ? "Email ou mot de passe incorrect" : "بريد إلكتروني أو كلمة مرور خاطئة"));
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify({ full_name: data.full_name, role: data.role }));
        window.location.href = "/diagnose";

      } else {
        if (!form.name.trim()) throw new Error(lang === "fr" ? "Nom complet requis" : "الاسم الكامل مطلوب");
        const res = await fetch("http://localhost:8000/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
            full_name: form.name,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || (lang === "fr" ? "Erreur lors de la création du compte" : "حدث خطأ أثناء إنشاء الحساب"));
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("user", JSON.stringify({ full_name: data.full_name, role: data.role }));
        window.location.href = "/diagnose";
      }
    } catch (err: any) {
      setError(err.message || (lang === "fr" ? "Impossible de contacter le serveur. Vérifiez le backend." : "تعذّر الاتصال بالخادم. تأكد من تشغيل backend."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-olive-900/10 border border-olive-100 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-br from-olive-600 to-olive-800 px-8 py-8 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-1">{t("nav.title")}</h1>
            <p className="text-olive-200 text-sm">
              {mode === "login"
                ? (lang === "fr" ? "Bienvenue de nouveau !" : "أهلاً بك مجدداً!")
                : (lang === "fr" ? "Créez votre compte gratuitement" : "أنشئ حسابك مجاناً")}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => { setMode("login"); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${
                mode === "login"
                  ? "text-olive-700 border-b-2 border-olive-600 bg-olive-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <LogIn className="w-4 h-4" />
              {t("nav.login")}
            </button>
            <button
              onClick={() => { setMode("register"); setError(null); }}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${
                mode === "register"
                  ? "text-olive-700 border-b-2 border-olive-600 bg-olive-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <UserPlus className="w-4 h-4" />
              {lang === "fr" ? "Créer un compte" : "حساب جديد"}
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5">
                  {lang === "fr" ? "Nom complet" : "الاسم الكامل"}
                </label>
                <input
                  type="text"
                  required
                  placeholder={lang === "fr" ? "Jean Dupont" : "محمد بن علي"}
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-100 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">
                {lang === "fr" ? "Adresse Email" : "البريد الإلكتروني"}
              </label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                <input
                  type="email"
                  required
                  placeholder="example@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-100 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5">
                {lang === "fr" ? "Mot de passe" : "كلمة المرور"}
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rtl:right-3 rtl:left-auto ltr:left-3 ltr:right-auto" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-olive-400 focus:ring-2 focus:ring-olive-100 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rtl:left-3 rtl:right-auto ltr:right-3 ltr:left-auto"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-olive-600 hover:bg-olive-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-olive-600/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === "login" ? (
                <><LogIn className="w-4 h-4" /> {t("nav.login")}</>
              ) : (
                <><UserPlus className="w-4 h-4" /> {lang === "fr" ? "Créer mon compte" : "إنشاء الحساب"}</>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-2">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">{lang === "fr" ? "ou" : "أو"}</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Guest access */}
            <Link
              href="/diagnose"
              className="w-full flex items-center justify-center gap-2 border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              {lang === "fr" ? "Continuer sans compte" : "تجربة بدون حساب"}
            </Link>
          </form>

          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-400">
              {lang === "fr"
                ? "En vous connectant, vous acceptez notre politique de confidentialité INPDP"
                : "بتسجيل دخولك، أنت توافق على سياسة الخصوصية وفقاً لمعايير INPDP"}
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-olive-700 hover:text-olive-900 font-medium transition-colors">
            {lang === "fr" ? "← Retour à la page d'accueil" : "← العودة إلى الصفحة الرئيسية"}
          </Link>
        </div>
      </div>
    </div>
  );
}
