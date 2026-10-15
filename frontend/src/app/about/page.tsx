import { Leaf, Shield, Award, Users, TreePine, Globe } from "lucide-react";
import Link from "next/link";

const stats = [
  { value: "15,000+", label: "مزارع شريك" },
  { value: "6", label: "أنواع أمراض مكتشفة" },
  { value: "94%", label: "دقة التشخيص" },
  { value: "24", label: "ولاية مغطاة" },
];

const values = [
  { icon: Shield, title: "الأمان والخصوصية", desc: "نحن ملتزمون بحماية بيانات الفلاحين وفقاً لمعايير INPDP. جميع البيانات مجهولة الهوية." },
  { icon: Award, title: "دقة علمية", desc: "نماذجنا مدرّبة على آلاف الصور المُصنّفة من خبراء زراعيين تونسيين." },
  { icon: Users, title: "خدمة الفلاح التونسي", desc: "صُمّمت الواجهة باللهجة التونسية لتكون في متناول جميع الفلاحين." },
  { icon: Globe, title: "مراقبة وطنية", desc: "نوفر لمفتشي CRDA لوحة مراقبة وطنية لتتبع تفشي الأمراض في الوقت الفعلي." },
];

const team = [
  { name: "أ. محمد بن سالم", role: "خبير أمراض الزيتون", emoji: "🌿" },
  { name: "د. فاطمة الزهراء", role: "مهندسة ذكاء اصطناعي", emoji: "🤖" },
  { name: "م. يوسف التليلي", role: "مطوّر backend & AI", emoji: "💻" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="gradient-hero py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-olive-100 text-olive-800 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 border border-olive-200/60">
            <Leaf className="w-3.5 h-3.5" />
            <span>من نحن</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-olive-900 mb-4 leading-tight">
            مشروع خبير الزيتونة
          </h1>
          <p className="text-olive-700 text-lg leading-relaxed">
            منصة ذكاء اصطناعي تونسية لمساعدة الفلاحين على تشخيص أمراض الزيتون وحماية محاصيلهم.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-olive-700 py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-white">{value}</p>
              <p className="text-olive-200 text-sm mt-1 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-3xl font-bold text-olive-900 mb-4">مهمتنا</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            تونس تحتل المرتبة الثالثة عالمياً في إنتاج زيت الزيتون. لكن أمراض الزيتون تكلّف الفلاحين ملايين الدنانير سنوياً بسبب التشخيص المتأخر.
          </p>
          <p className="text-gray-600 leading-relaxed">
            مشروعنا يستخدم تقنيات أحدث في الذكاء الاصطناعي — YOLOv8، U-Net، ResNet-50، LSTM — لتشخيص الأمراض فورياً من صورة بسيطة بالهاتف، ثم يقدم خطة علاج تلقائية بمساعدة Mistral AI.
          </p>
        </div>
        <div className="bg-olive-50 rounded-3xl p-8 border border-olive-100">
          <TreePine className="w-16 h-16 text-olive-600 mb-4" />
          <h3 className="text-xl font-bold text-olive-900 mb-2">إنجاز أكاديمي وطني</h3>
          <p className="text-olive-700 text-sm leading-relaxed">
            هذا المشروع هو مشروع نهاية الدراسة (PFA) مُطوَّر بالشراكة مع CRDA تونس، يجمع بين البحث العلمي والتطبيق الميداني الفعلي.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-olive-900 text-center mb-10">قيمنا</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-olive-100 mb-4">
                  <Icon className="w-6 h-6 text-olive-700" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold text-olive-900 mb-10">فريق المشروع</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {team.map(({ name, role, emoji }) => (
            <div key={name} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 w-52 hover:shadow-md hover:-translate-y-1 transition-all">
              <div className="text-4xl mb-3">{emoji}</div>
              <p className="font-bold text-gray-900">{name}</p>
              <p className="text-olive-600 text-xs mt-1 font-medium">{role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-olive-700 py-14 px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-3">جاهز لتجربة التشخيص الذكي؟</h2>
        <p className="text-olive-200 mb-6">صوّر ورقة زيتون وستحصل على تشخيص دقيق في ثوانٍ</p>
        <Link href="/" className="inline-flex items-center gap-2 bg-white text-olive-800 font-bold px-8 py-3 rounded-xl hover:bg-olive-50 transition-colors shadow-md">
          <Leaf className="w-5 h-5" />
          ابدأ التشخيص
        </Link>
      </section>
    </div>
  );
}
