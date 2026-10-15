"use client";

import Link from "next/link";
import {
  Leaf, Camera, LayoutDashboard, MessageCircle, Cpu,
  ChevronDown, CheckCircle, Mail, Phone, MapPin, Send, BookOpen, ShoppingBag,
  TrendingUp, AlertTriangle, Zap, ArrowLeft
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// ── Section: Hero ─────────────────────────────────────────────────────────────
function HeroSection() {
  const { t, lang } = useLanguage();
  return (
    <section className="relative gradient-hero min-h-[92vh] flex flex-col items-center justify-center px-4 text-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-olive-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-olive-300/20 blur-3xl" />
      </div>

      <div className="relative max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-white border border-olive-200 text-olive-800 text-xs font-bold px-4 py-2 rounded-full mb-8 shadow-sm">
          <Leaf className="w-3.5 h-3.5 text-olive-600" />
          {t("hero.badge")}
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-olive-900 mb-6 leading-tight">
          {t("hero.title_1")} <span className="text-olive-600">{t("hero.title_2")}</span>
          <br />
          <span className="text-3xl sm:text-4xl font-bold text-gray-600 mt-2 block">{t("hero.subtitle_1")}</span>
        </h1>

        <p className="text-olive-700 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("hero.description")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <Link
            href="/diagnose"
            className="flex items-center gap-3 bg-olive-600 text-white font-bold text-base px-8 py-4 rounded-2xl shadow-xl shadow-olive-600/30 hover:bg-olive-700 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <Camera className="w-5 h-5" />
            {t("hero.diagnose_btn")}
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-3 bg-white text-olive-800 font-bold text-base px-8 py-4 rounded-2xl border border-olive-200 shadow-md hover:bg-olive-50 hover:border-olive-300 transition-all duration-200"
          >
            <LayoutDashboard className="w-5 h-5" />
            {t("hero.dashboard_btn")}
          </Link>
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          {[t("hero.tag_1"), t("hero.tag_2"), t("hero.tag_3"), t("hero.tag_4")].map((b) => (
            <div key={b} className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-olive-500" />
              <span className="font-medium">{b}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-olive-400 animate-bounce">
        <ChevronDown className="w-5 h-5" />
      </div>
    </section>
  );
}

// ── Section: Stats ─────────────────────────────────────────────────────────────
function StatsSection() {
  const { t } = useLanguage();
  const stats = [
    { value: "94%", label: t("stats.accuracy"), icon: TrendingUp },
    { value: "6", label: t("stats.diseases"), icon: AlertTriangle },
    { value: "24", label: t("stats.regions"), icon: MapPin },
    { value: "<5s", label: t("stats.time"), icon: Zap },
  ];
  return (
    <section className="bg-olive-700 py-14 px-4">
      <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {stats.map(({ value, label, icon: Icon }) => (
          <div key={label}>
            <Icon className="w-6 h-6 text-olive-300 mx-auto mb-2" />
            <p className="text-3xl font-extrabold text-white">{value}</p>
            <p className="text-olive-200 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Section: About ─────────────────────────────────────────────────────────────
function AboutSection() {
  const { t, lang } = useLanguage();
  return (
    <section id="about" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="bg-olive-50 rounded-3xl p-10 border border-olive-100 text-center">
            <div className="text-8xl mb-4">🫒</div>
            <h3 className="text-xl font-bold text-olive-900 mb-2">
              {lang === "fr" ? "Tunisie — 3ème mondial" : "تونس — المرتبة الثالثة عالمياً"}
            </h3>
            <p className="text-olive-600 text-sm">
              {lang === "fr" ? "En production d'huile d'olive. Protégeons notre patrimoine." : "في إنتاج زيت الزيتون. نحمي هذا الإرث الوطني."}
            </p>
          </div>
          <div className="absolute -bottom-4 -right-4 bg-olive-600 text-white rounded-2xl p-4 shadow-lg shadow-olive-600/30">
            <p className="text-2xl font-extrabold">15K+</p>
            <p className="text-olive-200 text-xs">{lang === "fr" ? "Agriculteurs" : "مزارع شريك"}</p>
          </div>
        </div>

        <div>
          <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-olive-200">
            <Leaf className="w-3.5 h-3.5" />
            {t("about.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-olive-900 mb-4 leading-snug">
            {t("about.title")}
          </h2>
          <p className="text-gray-600 leading-relaxed mb-4">{t("about.desc_1")}</p>
          <p className="text-gray-600 leading-relaxed mb-6">{t("about.desc_2")}</p>
          <div className="flex flex-col gap-3">
            {[t("about.feature_1"), t("about.feature_2"), t("about.feature_3")].map((f) => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-olive-500 flex-shrink-0" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── Section: Services ──────────────────────────────────────────────────────────
function ServicesSection() {
  const { t } = useLanguage();
  const services = [
    { icon: Camera, title: t("services.s1_title"), desc: t("services.s1_desc"), tag: "AI · YOLOv8", href: "/diagnose", color: "olive" },
    { icon: LayoutDashboard, title: t("services.s2_title"), desc: t("services.s2_desc"), tag: "CRDA · Real-time", href: "/dashboard", color: "blue" },
    { icon: MessageCircle, title: t("services.s3_title"), desc: t("services.s3_desc"), tag: "Mistral AI · RAG", href: "#chat", color: "emerald" },
    { icon: Cpu, title: t("services.s4_title"), desc: t("services.s4_desc"), tag: "REST API · FastAPI", href: "#", color: "purple" },
  ];
  const colorMap: Record<string, string> = {
    olive: "bg-olive-100 text-olive-700",
    blue: "bg-blue-100 text-blue-700",
    emerald: "bg-emerald-100 text-emerald-700",
    purple: "bg-purple-100 text-purple-700",
  };

  return (
    <section id="services" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-olive-200">
            <Zap className="w-3.5 h-3.5" />
            {t("services.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-olive-900 mb-3">{t("services.title")}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{t("services.subtitle")}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ icon: Icon, title, desc, tag, href, color }) => (
            <div key={title} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col p-6">
              <div className={`flex items-center justify-center w-12 h-12 rounded-2xl mb-4 ${colorMap[color]}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-400 mb-2">{tag}</span>
              <h3 className="font-bold text-gray-900 mb-2 text-sm leading-snug">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed flex-1">{desc}</p>
              <Link href={href} className="mt-4 flex items-center gap-1 text-olive-600 font-bold text-xs hover:gap-2 transition-all">
                <ArrowLeft className="w-3.5 h-3.5 rotate-180 rtl:rotate-0" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Products ──────────────────────────────────────────────────────────
function ProductsSection() {
  const { t, lang } = useLanguage();
  const products = [
    { emoji: "📱", name: t("products.p1_title"), desc: t("products.p1_desc"), badge: lang === "fr" ? "Bientôt" : "قريباً", color: "bg-amber-50 border-amber-200" },
    { emoji: "🗺️", name: t("products.p2_title"), desc: t("products.p2_desc"), badge: lang === "fr" ? "Pro" : "مؤسسي", color: "bg-blue-50 border-blue-200" },
    { emoji: "🤖", name: t("products.p3_title"), desc: t("products.p3_desc"), badge: "Beta", color: "bg-purple-50 border-purple-200" },
    { emoji: "📊", name: t("products.p4_title"), desc: t("products.p4_desc"), badge: lang === "fr" ? "Bientôt" : "قريباً", color: "bg-green-50 border-green-200" },
  ];
  return (
    <section id="products" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-olive-200">
            <ShoppingBag className="w-3.5 h-3.5" />
            {t("products.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-olive-900 mb-3">{t("products.title")}</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          {products.map(({ emoji, name, desc, badge, color }) => (
            <div key={name} className={`rounded-2xl border p-6 flex items-start gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all ${color}`}>
              <div className="text-4xl">{emoji}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900">{name}</h3>
                  <span className="text-[11px] font-bold bg-white px-2 py-0.5 rounded-full border border-gray-200 text-gray-500">{badge}</span>
                </div>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Blog ──────────────────────────────────────────────────────────────
function BlogSection() {
  const { t, lang } = useLanguage();
  const posts = [
    { date: "2026", category: lang === "fr" ? "Maladies" : "أمراض الزيتون", title: t("blog.b1_title"), emoji: "🍃" },
    { date: "2026", category: lang === "fr" ? "IA & Tech" : "الذكاء الاصطناعي", title: t("blog.b2_title"), emoji: "🤖" },
    { date: "2026", category: lang === "fr" ? "Conseils" : "نصائح زراعية", title: t("blog.b3_title"), emoji: "🌧️" },
  ];
  return (
    <section id="blog" className="py-20 px-4 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-olive-200">
            <BookOpen className="w-3.5 h-3.5" />
            {t("blog.badge")}
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-olive-900 mb-3">{t("blog.title")}</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {posts.map(({ date, category, title, emoji }) => (
            <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all overflow-hidden cursor-pointer group">
              <div className="h-36 bg-gradient-to-br from-olive-50 to-olive-100 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform">
                {emoji}
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold text-olive-600 bg-olive-50 px-2 py-0.5 rounded-full">{category}</span>
                  <span className="text-xs text-gray-400">{date}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Section: Contact ───────────────────────────────────────────────────────────
function ContactSection() {
  const { t, lang } = useLanguage();
  return (
    <section id="contact" className="py-20 px-4 bg-white">
      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
        <div>
          <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-olive-200">
            <Mail className="w-3.5 h-3.5" />
            {t("contact.badge")}
          </div>
          <h2 className="text-3xl font-extrabold text-olive-900 mb-4">{t("contact.title")}</h2>
          <div className="space-y-4 mt-6">
            {[
              { icon: Mail, label: t("contact.email"), value: "contact@olive-ai.tn" },
              { icon: Phone, label: lang === "fr" ? "Téléphone" : "الهاتف", value: "+216 71 XXX XXX" },
              { icon: MapPin, label: lang === "fr" ? "Localisation" : "الموقع", value: "Tunisie — CRDA" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-olive-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-olive-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{label}</p>
                  <p className="font-semibold text-gray-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-3xl border border-gray-100 p-8">
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("contact.name")}</label>
                <input type="text" placeholder="" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("contact.email")}</label>
                <input type="email" placeholder="example@email.com" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("contact.subject")}</label>
              <input type="text" placeholder="" className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive-400" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">{t("contact.message")}</label>
              <textarea rows={4} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-olive-400 resize-none" />
            </div>
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-olive-600 text-white font-bold py-3 rounded-xl hover:bg-olive-700 transition-colors shadow-md">
              <Send className="w-4 h-4" />
              {t("contact.send")}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// ── Section: Footer ────────────────────────────────────────────────────────────
function Footer() {
  const { t, lang } = useLanguage();
  return (
    <footer className="bg-olive-900 text-olive-200 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-8 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-olive-600 flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">{t("nav.title")}</span>
            </div>
            <p className="text-xs leading-relaxed text-olive-400">{t("hero.description")}</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">{lang === "fr" ? "Liens Rapides" : "روابط سريعة"}</h4>
            <ul className="space-y-2 text-xs">
              {[["#about", t("nav.about")], ["#services", t("nav.services")], ["#products", t("nav.products")], ["#blog", t("nav.blog")], ["#contact", t("nav.contact")]].map(([href, label]) => (
                <li key={href}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">{lang === "fr" ? "Outils" : "الأدوات"}</h4>
            <ul className="space-y-2 text-xs">
              {[[t("nav.diagnose_btn") || "Diagnostic", "/diagnose"], [t("nav.dashboard"), "/dashboard"], [t("nav.assistant"), "#chat"]].map(([label, href]) => (
                <li key={label}><a href={href} className="hover:text-white transition-colors">{label}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-olive-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-olive-500">
          <p>© 2026 Smart Olive Assistant</p>
          <p>PFA Project · CRDA Tunisie · INPDP Compliant</p>
        </div>
      </div>
    </footer>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsSection />
      <AboutSection />
      <ServicesSection />
      <ProductsSection />
      <BlogSection />
      <ContactSection />
      <Footer />
    </>
  );
}
