import { Camera, LayoutDashboard, MessageCircle, Cpu, Zap, Shield, ArrowLeft } from "lucide-react";
import Link from "next/link";

const services = [
  {
    icon: Camera,
    title: "تشخيص أمراض الزيتون",
    badge: "AI Core",
    desc: "ارفع صورة لورقة زيتون مريضة وستتلقى تشخيصاً دقيقاً في ثوانٍ باستخدام YOLOv8 وU-Net وResNet-50.",
    features: ["كشف 6 أنواع من الأمراض", "تحديد شدة الإصابة", "خريطة حرارية (Grad-CAM)", "خطة علاج فورية"],
    href: "/",
    color: "olive",
  },
  {
    icon: LayoutDashboard,
    title: "لوحة المراقبة الوطنية",
    badge: "CRDA",
    desc: "لمفتشي CRDA: خريطة وبائية لتونس بأكملها، تتبع بؤر المرض في الوقت الفعلي عبر 24 ولاية.",
    features: ["خريطة وبائية تفاعلية", "توقعات مناخية 7 أيام", "بث مباشر للحالات", "إحصائيات وطنية"],
    href: "/dashboard",
    color: "blue",
  },
  {
    icon: MessageCircle,
    title: "المساعد الزراعي الذكي",
    badge: "RAG · Mistral AI",
    desc: "اسأل مساعدنا الذكي عن أي سؤال زراعي. مدعوم بـ Mistral AI وقاعدة معرفة متخصصة في الزيتون.",
    features: ["فهم اللهجة التونسية", "بروتوكولات علاجية", "نصائح وقائية", "تاريخ المحادثات"],
    href: "#chat",
    color: "emerald",
  },
  {
    icon: Cpu,
    title: "نماذج الذكاء الاصطناعي",
    badge: "PyTorch",
    desc: "نوفر واجهة API مفتوحة للمؤسسات البحثية للتكامل مع نماذجنا المدرّبة على بيانات تونسية محلية.",
    features: ["YOLOv8 detection", "U-Net segmentation", "LSTM risk forecast", "REST API / WebSocket"],
    href: "#",
    color: "purple",
  },
];

const colorMap: Record<string, string> = {
  olive:   "bg-olive-50 border-olive-200 text-olive-700",
  blue:    "bg-blue-50 border-blue-200 text-blue-700",
  emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
  purple:  "bg-purple-50 border-purple-200 text-purple-700",
};
const iconBgMap: Record<string, string> = {
  olive:   "bg-olive-100 text-olive-700",
  blue:    "bg-blue-100 text-blue-700",
  emerald: "bg-emerald-100 text-emerald-700",
  purple:  "bg-purple-100 text-purple-700",
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="gradient-hero py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-olive-200/60">
            <Zap className="w-3.5 h-3.5" />
            <span>خدماتنا</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-olive-900 mb-4 leading-tight">
            حلول ذكية
            <span className="block text-olive-600">لزراعة الزيتون</span>
          </h1>
          <p className="text-olive-700 text-lg max-w-xl mx-auto">
            من التشخيص الفوري إلى المراقبة الوطنية، نقدم منظومة متكاملة لحماية مزارع الزيتون التونسية.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {services.map(({ icon: Icon, title, badge, desc, features, href, color }) => (
            <div key={title} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col">
              <div className="p-7 flex-1">
                <div className="flex items-start justify-between mb-5">
                  <div className={`flex items-center justify-center w-14 h-14 rounded-2xl ${iconBgMap[color]}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${colorMap[color]}`}>{badge}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{desc}</p>
                <ul className="space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-olive-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="px-7 pb-7">
                <Link
                  href={href}
                  className="flex items-center justify-between w-full bg-gray-50 hover:bg-olive-50 border border-gray-200 hover:border-olive-200 text-gray-700 hover:text-olive-800 font-semibold text-sm px-5 py-3 rounded-xl transition-all duration-200 group-hover:gap-3"
                >
                  <span>استكشف الخدمة</span>
                  <ArrowLeft className="w-4 h-4 rotate-180 rtl:rotate-0" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Banner */}
      <section className="bg-olive-700 py-12 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-right">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">جاهز لحماية مزرعتك؟</h3>
            <p className="text-olive-200">ابدأ مجاناً — لا تحتاج حساباً لتشخيص أول صورة</p>
          </div>
          <div className="flex gap-3">
            <Link href="/" className="bg-white text-olive-800 font-bold px-6 py-3 rounded-xl hover:bg-olive-50 transition-colors shadow-md whitespace-nowrap">
              ابدأ الآن
            </Link>
            <Link href="/contact" className="border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors whitespace-nowrap">
              تواصل معنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
