"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf, MessageCircle, Menu, X, LogIn, LogOut, User as UserIcon, Globe
} from "lucide-react";
import { useState, useEffect } from "react";
import { ChatWidget } from "./ChatWidget";
import { useLanguage } from "@/context/LanguageContext";

export function Navbar() {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<{ full_name: string; role: string } | null>(null);

  const navLinks = [
    { href: "/", label: t("nav.home") },
    { href: "/diagnose", label: t("diagnose.title") },
    { href: "/dashboard", label: t("nav.dashboard") },
  ];

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser({ full_name: "مستخدم", role: "farmer" });
      }
    } else if (token) {
      setUser({ full_name: "مستخدم", role: "farmer" });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#") && pathname === "/") {
      e.preventDefault();
      const el = document.querySelector(href);
      el?.scrollIntoView({ behavior: "smooth" });
    }
    setMobileOpen(false);
  };

  const toggleLanguage = () => {
    setLang(lang === "ar" ? "fr" : "ar");
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        <div className="border-b border-olive-200/50 bg-white/95 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-olive-500 to-olive-700 text-white shadow-lg shadow-olive-600/30 group-hover:scale-105 transition-transform">
                <Leaf className="h-5 w-5" />
              </div>
              <div className="hidden sm:block">
                <p className="font-bold text-olive-900 leading-tight text-base">{t("nav.title")}</p>
                <p className="text-[11px] text-olive-600 font-medium">{t("nav.subtitle")}</p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    pathname === href
                      ? "bg-olive-50 text-olive-800"
                      : "text-gray-600 hover:bg-olive-50 hover:text-olive-800"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Language Switcher */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-olive-50 text-xs font-bold text-gray-700 transition-all"
                title="تغيير اللغة / Changer de langue"
              >
                <Globe className="h-3.5 w-3.5 text-olive-600" />
                <span>{lang === "ar" ? "🇫🇷 FR" : "🇹🇳 AR"}</span>
              </button>

              {/* Chat Button */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold bg-olive-50 text-olive-700 border border-olive-200 hover:bg-olive-100 transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="hidden md:inline">{t("nav.assistant")}</span>
              </button>

              {user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-olive-50 border border-olive-200 text-olive-900 font-semibold text-sm">
                    <UserIcon className="h-4 w-4 text-olive-600" />
                    <span>{user.full_name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    title={t("nav.logout")}
                    className="p-2 rounded-xl text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-olive-600 to-olive-700 text-white shadow-md shadow-olive-600/25 hover:shadow-olive-600/40 hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{t("nav.login")}</span>
                </Link>
              )}

              <button
                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-olive-50"
                onClick={() => setMobileOpen((v) => !v)}
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileOpen && (
            <div className="lg:hidden border-t border-olive-100 bg-white px-4 pb-4 pt-2 space-y-1 animate-in">
              {navLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    pathname === href
                      ? "bg-olive-50 text-olive-800"
                      : "text-gray-700 hover:bg-olive-50"
                  }`}
                >
                  {label}
                </Link>
              ))}

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-bold text-gray-700"
                >
                  <Globe className="h-3.5 w-3.5 text-olive-600" />
                  <span>{lang === "ar" ? "🇫🇷 Français" : "🇹🇳 العربية"}</span>
                </button>

                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-xs text-red-600 font-bold px-3 py-1.5 rounded-lg bg-red-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("nav.logout")}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-olive-600 text-white"
                  >
                    <LogIn className="h-4 w-4" />
                    {t("nav.login")}
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Floating Chat Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-6 left-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-olive-500 to-olive-700 text-white shadow-xl shadow-olive-600/40 hover:scale-110 active:scale-95 transition-all duration-200"
        title={t("nav.assistant")}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-400 ring-2 ring-white text-[9px] font-bold animate-pulse">AI</span>
      </button>

      <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </>
  );
}
