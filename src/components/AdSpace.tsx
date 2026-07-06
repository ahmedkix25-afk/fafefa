import React, { useState, useEffect } from "react";
import { AdConfiguration, AdStats } from "../types";
import { HelpCircle, Code, Copy, Check, ExternalLink, Sparkles } from "lucide-react";

interface AdSpaceProps {
  type: "top-leaderboard" | "sidebar-square" | "native-feed" | "sticky-anchor";
  config: AdConfiguration;
  onAdTrigger?: (impressions: number, clicks: number, earning: number) => void;
}

export default function AdSpace({ type, config, onAdTrigger }: AdSpaceProps) {
  const [copied, setCopied] = useState(false);
  const [showCodeGuide, setShowCodeGuide] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  // قائمة إعلانات افتراضية ممتعة وجذابة تناسب المصممين والمستخدمين المهتمين بالصور
  const mockAds = {
    "top-leaderboard": {
      title: "استضافة فائقة السرعة لموقعك القادم - خصم 60% لليوم فقط!",
      desc: "استضافة سحابية متكاملة تدعم تطبيقات Node.js و React مع حماية مجانية وقاعدة بيانات سريعة. ابدأ الآن بـ $2.95 فقط.",
      actionText: "احجز استضافتك",
      category: "استضافة وتطوير",
      imageUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&auto=format&fit=crop&q=60",
    },
    "sidebar-square": {
      title: "أفضل كورس لتعلم الذكاء الاصطناعي وصناعة الصور",
      desc: "احترف استخدام Midjourney و Stable Diffusion لإنتاج صور خيالية بضغطة زر. شهادة معتمدة مع كوبون خصم خاص بالزوار.",
      actionText: "سجل الآن مجاناً",
      category: "تعليم وتدريب",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=60",
    },
    "native-feed": {
      title: "هل تبحث عن أدوات تصميم احترافية خالية من الحقوق؟",
      desc: "انضم لأكثر من 100 ألف مصمم وحمل آلاف الخطوط، الأيقونات، وقوالب الفيديو الجاهزة للاستخدام التجاري مجاناً بالكامل.",
      actionText: "تصفح الملفات المجانية",
      category: "أدوات المصممين",
      imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=60",
    },
    "sticky-anchor": {
      title: "حوّل صورك القديمة إلى لوحات زيتية بالذكاء الاصطناعي!",
      desc: "تطبيق مجاني للهواتف الذكية متوفر الآن.",
      actionText: "تنزيل التطبيق",
      category: "تطبيقات الهواتف",
      imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=300&auto=format&fit=crop&q=60",
    }
  };

  const activeAd = mockAds[type];

  // احتساب الظهور التلقائي للإعلان عند تحميل المكون
  useEffect(() => {
    if (!hasTriggered && onAdTrigger) {
      setHasTriggered(true);
      // ظهور إعلان جديد
      // ربح ظهور افتراضي = 0.005 دولار (CPM = $5)
      onAdTrigger(1, 0, 0.005 * config.adFrequencyMultiplier);
    }
  }, [hasTriggered, onAdTrigger, config.adFrequencyMultiplier]);

  const handleAdClick = () => {
    if (onAdTrigger) {
      // نقرة على الإعلان
      // ربح نقرة افتراضي = 0.25 دولار
      onAdTrigger(0, 1, 0.25 * config.adFrequencyMultiplier);
    }
  };

  // كود أدسينس المقترح للنسخ
  const adsenseCode = `<!-- كود إعلان أدسينس للمساحة: ${type} -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="${config.publisherId || "ca-pub-XXXXXXXXXXXXXXXX"}"
     data-ad-slot="${
       type === "top-leaderboard"
         ? config.topBannerSlot || "1234567890"
         : type === "sidebar-square"
         ? config.sidebarSlot || "0987654321"
         : config.nativeSlot || "1122334455"
     }"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`;

  const copyCode = () => {
    navigator.clipboard.writeText(adsenseCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full mb-6">
      <div className="relative border border-dashed border-slate-200 bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden p-4 shadow-sm">
        {/* علامة تبويب صغيرة توضح أنها مساحة إعلانية للربح ومصدرها */}
        <div className="flex justify-between items-center text-[10px] text-slate-400 mb-3 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
            <span className="font-medium">مساحة إعلانية نشطة للربح</span>
            {config.publisherId && (
              <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100 font-mono text-[9px]">
                {config.publisherId}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCodeGuide(!showCodeGuide)}
              className="hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer font-bold"
              title="كيفية استبدال هذا بالإعلان الحقيقي الخاص بك"
            >
              <Code size={11} />
              <span>احصل على كود الإعلان</span>
            </button>
            <span>•</span>
            <span>إعلان بواسطة جوجل</span>
          </div>
        </div>

        {/* عرض الإرشادات البرمجية لكيفية استبدال الإعلان الحقيقي */}
        {showCodeGuide && (
          <div className="mb-4 p-4 bg-slate-900 border border-slate-800 rounded-xl text-xs animate-fade-in text-slate-300">
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold text-blue-400">كود Google AdSense الخاص بك:</span>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-white px-2 py-1 rounded transition-colors cursor-pointer"
              >
                {copied ? <Check size={12} className="text-blue-400" /> : <Copy size={12} />}
                <span>{copied ? "تم النسخ" : "نسخ الكود"}</span>
              </button>
            </div>
            <pre className="p-2 bg-black/50 rounded overflow-x-auto font-mono text-[10px] text-slate-400 text-left direction-ltr">
              {adsenseCode}
            </pre>
            <p className="mt-2 text-[11px] text-slate-400 leading-relaxed text-right">
              💡 <strong className="text-slate-200">نصيحة الربح:</strong> انسخ هذا الكود وضعه في ملف الـ HTML الخاص بك عند رفع موقعك على الاستضافة الحقيقية وسيبدأ بعرض إعلانات حقيقية ويدر عليك أرباحاً حقيقية إلى حسابك البنكي مباشرة!
            </p>
          </div>
        )}

        {/* تصميم الإعلان الفعلي بناء على النوع المختار */}
        {type === "top-leaderboard" && (
          <a
            href="#mock-ad-link"
            onClick={handleAdClick}
            className="flex flex-col sm:flex-row items-center gap-4 bg-white hover:bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 transition-all shadow-sm group cursor-pointer"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 relative shadow-sm">
              <img
                src={activeAd.imageUrl}
                alt={activeAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-1 right-1 bg-slate-900/80 text-[8px] text-white px-1 rounded">رعاية</span>
            </div>
            <div className="flex-1 text-center sm:text-right min-w-0">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-100 font-bold">
                  {activeAd.category}
                </span>
                <span className="text-slate-400 text-[10px]">موصى به</span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">
                {activeAd.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-1 mt-1">
                {activeAd.desc}
              </p>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0">
              <span className="block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-blue-100">
                {activeAd.actionText}
              </span>
            </div>
          </a>
        )}

        {type === "sidebar-square" && (
          <a
            href="#mock-ad-link"
            onClick={handleAdClick}
            className="block bg-white hover:bg-slate-50/50 rounded-xl p-3.5 border border-slate-100 transition-all shadow-sm group cursor-pointer"
          >
            <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-100 relative shadow-sm mb-3">
              <img
                src={activeAd.imageUrl}
                alt={activeAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-[8px] text-white px-1.5 py-0.5 rounded">رعاية</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-100 font-bold">
                  {activeAd.category}
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-relaxed">
                {activeAd.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                {activeAd.desc}
              </p>
              <span className="block text-center bg-slate-900 group-hover:bg-blue-600 group-hover:text-white text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm">
                {activeAd.actionText}
              </span>
            </div>
          </a>
        )}

        {type === "native-feed" && (
          <a
            href="#mock-ad-link"
            onClick={handleAdClick}
            className="flex flex-col md:flex-row items-center gap-4 bg-white hover:bg-slate-50/50 rounded-2xl p-4 sm:p-5 border border-slate-100 transition-all shadow-sm group cursor-pointer"
          >
            <div className="w-full md:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 relative shadow-sm">
              <img
                src={activeAd.imageUrl}
                alt={activeAd.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-2 right-2 bg-slate-900/80 text-[8px] text-white px-1.5 py-0.5 rounded">إعلان ممول</span>
            </div>
            <div className="flex-1 text-right min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full border border-blue-100 font-bold">
                  {activeAd.category}
                </span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Sparkles size={10} className="text-blue-600 animate-pulse" />
                  عروض مميزة للزوار
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1 leading-snug">
                {activeAd.title}
              </h4>
              <p className="text-sm text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                {activeAd.desc}
              </p>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-xs text-slate-400 font-mono">adsbygoogle.js</span>
                <span className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors shadow-md shadow-blue-100">
                  {activeAd.actionText}
                </span>
              </div>
            </div>
          </a>
        )}

        {type === "sticky-anchor" && (
          <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-xs shadow-xl shadow-slate-200/50">
            <div className="flex items-center gap-2.5">
              <img
                src={activeAd.imageUrl}
                alt=""
                className="w-8 h-8 rounded-lg object-cover flex-shrink-0 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div>
                <h5 className="font-bold text-slate-800">{activeAd.title}</h5>
                <p className="text-[10px] text-slate-400">{activeAd.desc}</p>
              </div>
            </div>
            <a
              href="#mock-ad-link"
              onClick={handleAdClick}
              className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap cursor-pointer shadow-md shadow-blue-100"
            >
              {activeAd.actionText}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
