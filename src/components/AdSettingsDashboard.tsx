import React, { useState } from "react";
import { AdConfiguration, AdStats } from "../types";
import {
  TrendingUp,
  Coins,
  MousePointerClick,
  Globe,
  Settings,
  X,
  HelpCircle,
  Copy,
  Check,
  CheckCircle2,
  Sliders,
  DollarSign,
  Briefcase
} from "lucide-react";

interface AdSettingsDashboardProps {
  config: AdConfiguration;
  stats: AdStats;
  onChangeConfig: (newConfig: AdConfiguration) => void;
  onClose: () => void;
}

export default function AdSettingsDashboard({
  config,
  stats,
  onChangeConfig,
  onClose
}: AdSettingsDashboardProps) {
  const [publisherId, setPublisherId] = useState(config.publisherId);
  const [showCustomAds, setShowCustomAds] = useState(config.showCustomAds);
  const [multiplier, setMultiplier] = useState(config.adFrequencyMultiplier);
  const [activeTab, setActiveTab] = useState<"stats" | "config" | "guide">("stats");
  const [copiedAdsTxt, setCopiedAdsTxt] = useState(false);

  const handleSave = () => {
    onChangeConfig({
      ...config,
      publisherId,
      showCustomAds,
      adFrequencyMultiplier: multiplier,
    });
  };

  // احتساب نسبة النقر إلى الظهور CTR
  const ctr = stats.impressions > 0 ? (stats.clicks / stats.impressions) * 100 : 0;

  const copyAdsTxt = () => {
    const txt = `google.com, ${publisherId || "pub-0000000000000000"}, DIRECT, f08c47fec0942fa0`;
    navigator.clipboard.writeText(txt);
    setCopiedAdsTxt(true);
    setTimeout(() => setCopiedAdsTxt(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in text-right" dir="rtl">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl">
        
        {/* هيدر لوحة التحكم */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center">
              <Briefcase className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-950">لوحة التحكم بالأرباح والإعلانات</h3>
              <p className="text-xs text-slate-500">تابع أرباح موقعك وقم بإعداد شفرات إعلانات جوجل أدسينس</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* شريط التنقل الداخلي */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/20">
          <button
            onClick={() => setActiveTab("stats")}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "stats"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingUp size={16} />
              إحصائيات الأرباح المباشرة
            </span>
          </button>
          <button
            onClick={() => setActiveTab("config")}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "config"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <Settings size={16} />
              إعدادات حساب الناشر
            </span>
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            className={`py-3.5 px-4 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === "guide"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={16} />
              دليل الربح للمبتدئين
            </span>
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* تبويب الإحصائيات */}
          {activeTab === "stats" && (
            <div className="space-y-6">
              
              {/* شبكة معلومات الأرباح والزيارات */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">زيارات الموقع</span>
                    <Globe size={16} className="text-blue-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 font-mono">{stats.pageViews}</p>
                  <p className="text-[10px] text-slate-400">زيارات حقيقية للموقع</p>
                </div>
                
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">مرات الظهور للإعلانات</span>
                    <Coins size={16} className="text-purple-500" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 font-mono">{stats.impressions}</p>
                  <p className="text-[10px] text-slate-400">معدل CPM الافتراضي</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">النقرات الفعالة</span>
                    <MousePointerClick size={16} className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-slate-900 font-mono">{stats.clicks}</p>
                  <p className="text-[10px] text-slate-400">معدل CTR: {ctr.toFixed(1)}%</p>
                </div>

                <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-2xl space-y-2 relative overflow-hidden group shadow-sm shadow-blue-50">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-blue-700 font-black">الأرباح المقدرة</span>
                    <DollarSign size={16} className="text-blue-600" />
                  </div>
                  <p className="text-2xl font-black text-blue-700 font-mono">
                    ${stats.estimatedEarnings.toFixed(3)}
                  </p>
                  <p className="text-[10px] text-blue-500 font-bold">تحديث فوري وتراكمي</p>
                </div>
              </div>

              {/* تفاصيل الاحتساب المحاكية */}
              <div className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl">
                <h4 className="text-sm font-bold text-slate-800 mb-3">آلية تجميع الأرباح المباشرة في الجلسة الحالية:</h4>
                <div className="space-y-2 text-xs text-slate-500">
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="font-medium">الربح لكل 1000 ظهور (CPM الافتراضي)</span>
                    <span className="text-slate-800 font-bold font-mono">${(5.00 * multiplier).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-100">
                    <span className="font-medium">الربح الفعلي لكل نقرة (CPC الافتراضي)</span>
                    <span className="text-slate-800 font-bold font-mono">${(0.25 * multiplier).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-medium">الربح من رفع جودة الصور مجاناً</span>
                    <span className="text-blue-600 font-bold">مضمون 100% لأن الزائر يقضي وقتاً طويلاً لرؤية النتيجة ومقارنتها</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border border-slate-200 bg-slate-50 rounded-2xl flex items-center gap-3">
                <TrendingUp size={24} className="text-blue-600 flex-shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  📈 <strong className="text-slate-800">فرصة نمو ممتازة:</strong> تصفح المستخدم للصور، ومقارنتها عبر الشريط التفاعلي (شريط قبل/بعد) يزيد بشكل هائل من مدة بقاء الزائر في موقعك، وهو ما تفضله خوارزميات جوجل أدسينس لرفع قيمة أرباحك الإعلانية بشكل دراماتيكي!
                </p>
              </div>

            </div>
          )}

          {/* تبويب الإعدادات */}
          {activeTab === "config" && (
            <div className="space-y-6">
              
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800">تكوين حسابك الإعلاني في أدسينس (AdSense):</h4>
                
                <div className="space-y-2">
                  <label className="block text-xs text-slate-600 font-bold">رقم معرف الناشر (Publisher ID):</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={publisherId}
                      onChange={(e) => setPublisherId(e.target.value)}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-sm font-mono text-left focus:outline-none transition-all text-slate-800"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    تجد هذا المعرف داخل حسابك في Google AdSense في قسم الحساب - معلومات الحساب.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs text-slate-600 font-bold">مضاعف الربح الافتراضي للموقع:</label>
                    <select
                      value={multiplier}
                      onChange={(e) => setMultiplier(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:border-blue-600 focus:bg-white rounded-xl text-sm focus:outline-none transition-all text-slate-700"
                    >
                      <option value={1}>1x (معدل عادي - دول عربية)</option>
                      <option value={1.5}>1.5x (معدل متوسط - دول الخليج)</option>
                      <option value={2.5}>2.5x (معدل مرتفع - أمريكا وأوروبا)</option>
                    </select>
                    <p className="text-[10px] text-slate-400">
                      يختلف العائد لكل نقرة (CPC) تلقائياً بحسب مصدر الزيارات الجغرافية للموقع.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs text-slate-600 font-bold">نوع الإعلانات النشطة بالموقع:</label>
                    <div className="flex items-center gap-6 py-3">
                      <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                        <input
                          type="radio"
                          checked={!showCustomAds}
                          onChange={() => setShowCustomAds(false)}
                          className="accent-blue-600 w-4 h-4"
                        />
                        إعلانات جوجل التلقائية
                      </label>
                      <label className="flex items-center gap-2 text-xs text-slate-700 font-medium cursor-pointer">
                        <input
                          type="radio"
                          checked={showCustomAds}
                          onChange={() => setShowCustomAds(true)}
                          className="accent-blue-600 w-4 h-4"
                        />
                        إعلانات ورعاية مباشرة
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* ملف Ads.txt المطلوب لإثبات ملكية الدومين */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-800">إعداد ملف <code className="text-blue-600">ads.txt</code> المطلوب:</span>
                  <button
                    onClick={copyAdsTxt}
                    className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white text-[11px] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {copiedAdsTxt ? <Check size={12} className="text-blue-400" /> : <Copy size={12} />}
                    <span>{copiedAdsTxt ? "تم نسخ السطر" : "نسخ السطر"}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  يتوجب عليك حفظ سطر النص التالي في ملف باسم <code className="bg-slate-100 px-1 rounded text-slate-800 font-bold">ads.txt</code> ورفعه في المجلد الرئيسي لموقعك الحقيقي ليتم تفعيل الأرباح والموافقة على الدومين:
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[10px] text-slate-300 text-left" dir="ltr">
                  google.com, {publisherId || "pub-0000000000000000"}, DIRECT, f08c47fec0942fa0
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    handleSave();
                    alert("تم حفظ الإعدادات الافتراضية بنجاح بنظام المحاكاة!");
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer shadow-lg shadow-blue-100"
                >
                  حفظ التعديلات وتفعيل الأرباح
                </button>
              </div>

            </div>
          )}

          {/* تبويب دليل الربح للمبتدئين */}
          {activeTab === "guide" && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-800">خارطة الطريق لتحقيق أكثر من 500$ شهرياً من هذا الموقع:</h4>
              
              <div className="space-y-3">
                <div className="flex gap-3 items-start p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">سجل في شبكة إعلانية معتمدة</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      أفضل خيار هو <strong className="text-slate-800">Google AdSense</strong>. كبديل أسهل وسريع للموافقة، يمكنك البدء فوراً مع <strong className="text-slate-800">Adsterra</strong> أو <strong className="text-slate-800">Ezoic</strong> حيث لا يتطلبون شروطاً معقدة لزيارة موقعك.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">انشر موقعك على استضافة مجانية أو رخيصة</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      قم بحجز نطاق (Domain Name) مميز وسهل التذكر (مثل upscaler-free.com) ثم ارفع الموقع على استضافة مثل <strong className="text-slate-800">Netlify</strong> أو <strong className="text-slate-800">Vercel</strong> مجاناً مع ربط الدومين الخاص بك.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">جلب الزوار مجاناً (SEO وتيك توك)</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      اصنع فيديوهات قصيرة على تيك توك و يوتيوب شورتس توضح فيها مقارنة بين صور قبل رفع جودتها وبعد (استخدم أسلوب "كيف ترفع جودة أي صورة بضغطة زر مجاناً"). هذا يجلب آلاف الزيارات اليومية دون دفع أي قرش في الإعلانات الممولة!
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-xs font-bold text-blue-600 flex-shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-800">زيادة عمق أرباحك بالخدمات المدفوعة (Pro)</h5>
                    <p className="text-[11px] text-slate-500 leading-relaxed mt-1">
                      يمكنك لاحقاً وضع خطة باشتراك رمزي (مثلاً $3 شهرياً) تتيح للمستخدمين رفع جودة 100 صورة دفعة واحدة دون إعلانات وبسرعة مضاعفة. هذا يخلق مصدر ربح إضافي مباشر مع الأرباح الإعلانية!
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50 border border-blue-100 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 size={16} className="text-blue-600 flex-shrink-0" />
                <span className="text-blue-700 font-bold">موقعك جاهز فنياً، وقابل للتصدير والعمل الفوري كأداة حقيقية تدر الدخل المستمر!</span>
              </div>
            </div>
          )}

        </div>

        {/* فوتر اللوحة */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-400 flex justify-between items-center">
          <span>نظام محاكاة الإيرادات والإعلانات 1.0.0</span>
          <span>برعاية جوجل أدسينس لشركاء الويب</span>
        </div>

      </div>
    </div>
  );
}
