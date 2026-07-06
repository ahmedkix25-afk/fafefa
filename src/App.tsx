import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Sparkles,
  Download,
  RefreshCw,
  Sliders,
  Sun,
  Contrast,
  Eye,
  Settings,
  Coins,
  MousePointerClick,
  Image as ImageIcon,
  Trash2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Check,
  Zap,
  DollarSign
} from "lucide-react";
import { ImageSettings, AdConfiguration, AdStats, ProcessedHistoryItem } from "./types";
import { loadImage, processImageCanvas } from "./utils/imageProcessor";
import AdSpace from "./components/AdSpace";
import AdSettingsDashboard from "./components/AdSettingsDashboard";

// مجموعة من الصور التجريبية الجاهزة للمستخدم لتجربة الأداة فوراً
const SAMPLE_IMAGES = [
  {
    id: "sample-portrait",
    name: "وجه بورتريه (باهت)",
    originalUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=40",
    label: "بورتريه",
    description: "مثالي لتجربة فلتر تنعيم البشرة وتحسين ملامح الوجه."
  },
  {
    id: "sample-nature",
    name: "منظر طبيعي (تفاصيل ضعيفة)",
    originalUrl: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=40",
    label: "طبيعة",
    description: "مثالي لتجربة التوازن التلقائي وزيادة حدة تفاصيل الأشجار والمياه."
  },
  {
    id: "sample-retro",
    name: "صورة قديمة (مليئة بالتشويش)",
    originalUrl: "https://images.unsplash.com/photo-1520038410233-7141be7e6f97?w=600&auto=format&fit=crop&q=40",
    label: "صورة قديمة",
    description: "مثالي لتجربة فلتر إزالة التشويش الرقمي (Denoise)."
  }
];

export default function App() {
  // إعدادات الصورة الافتراضية
  const [settings, setSettings] = useState<ImageSettings>({
    upscaleFactor: 2,
    brightness: 0,
    contrast: 10,
    saturation: 15,
    sharpness: 50,
    denoise: 20,
    faceEnhance: false,
    autoBalance: true,
  });

  // إعدادات الإعلانات التلقائية
  const [adConfig, setAdConfig] = useState<AdConfiguration>({
    publisherId: "ca-pub-9732918842037742",
    topBannerSlot: "8823719022",
    sidebarSlot: "1102938472",
    nativeSlot: "4491029384",
    stickySlot: "5501928374",
    showCustomAds: false,
    customAdUrl: "",
    customAdImage: "",
    adFrequencyMultiplier: 1.0,
  });

  // إحصائيات الإعلانات الحالية في الجلسة
  const [adStats, setAdStats] = useState<AdStats>({
    pageViews: 1,
    impressions: 1,
    clicks: 0,
    estimatedEarnings: 0.005,
  });

  // حالات الصورة والرفع والمعالجة
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [originalImageName, setOriginalImageName] = useState<string>("");
  const [originalImageMeta, setOriginalImageMeta] = useState<{ width: number; height: number; size: string } | null>(null);
  
  const [processedImageSrc, setProcessedImageSrc] = useState<string | null>(null);
  const [processedImageMeta, setProcessedImageMeta] = useState<{ width: number; height: number; size: string } | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState("");
  const [sliderPosition, setSliderPosition] = useState(50);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg">("png");

  // تفعيل التبويبات واللوحات المنبثقة
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [history, setHistory] = useState<ProcessedHistoryItem[]>([]);

  // إعدادات الحماية الفائقة وإخفاء لوحة التحكم
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [logoClickCount, setLogoClickCount] = useState(0);

  // الكشف التلقائي عن وضع المدير عبر الرابط
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("admin") === "true") {
        setIsAdminUnlocked(true);
      }
    }
  }, []);

  const handleLogoClick = () => {
    setLogoClickCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminUnlocked(true);
        showNotificationAlert("🔓 تم تفعيل وضع المشرف ولوحة الأرباح بنجاح!");
        return 0;
      }
      return next;
    });
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);

  // احتساب أثر الإعلانات وتراكم الأرباح
  const triggerAdRevenue = (impressions: number, clicks: number, earning: number) => {
    setAdStats((prev) => ({
      pageViews: prev.pageViews + (impressions > 0 ? 1 : 0),
      impressions: prev.impressions + impressions,
      clicks: prev.clicks + clicks,
      estimatedEarnings: prev.estimatedEarnings + earning,
    }));
  };

  // زيادة عدد زيارات الصفحة تلقائياً مع تفاعل الزائر
  useEffect(() => {
    const interval = setInterval(() => {
      // محاكاة بقاء المستخدم وتصفحه لأقسام الموقع يزيد عدد المشاهدات والأرباح قليلاً بشكل تلقائي
      setAdStats((prev) => {
        const newViews = prev.pageViews + 1;
        const newImpressions = prev.impressions + 1;
        const autoEarning = 0.002 * adConfig.adFrequencyMultiplier; // ربح طفيف لكل فترة تصفح
        return {
          ...prev,
          pageViews: newViews,
          impressions: newImpressions,
          estimatedEarnings: prev.estimatedEarnings + autoEarning,
        };
      });
    }, 45000); // كل 45 ثانية من البقاء الفعال

    return () => clearInterval(interval);
  }, [adConfig.adFrequencyMultiplier]);

  // تصفح واختيار ملفات الصور محلياً
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      loadSelectedFile(file);
    }
  };

  const loadSelectedFile = (file: File) => {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const src = event.target.result as string;
        setOriginalImageSrc(src);
        setOriginalImageName(file.name);
        setProcessedImageSrc(null); // مسح الصورة السابقة المعالجة
        
        // جلب أبعاد الصورة الأصلية
        const img = new Image();
        img.onload = () => {
          setOriginalImageMeta({
            width: img.naturalWidth,
            height: img.naturalHeight,
            size: sizeInMB
          });
        };
        img.src = src;

        // تسجيل حدث الظهور الإعلاني الإضافي عند تحديث الصورة
        triggerAdRevenue(1, 0, 0.005 * adConfig.adFrequencyMultiplier);
      }
    };
    reader.readAsDataURL(file);
  };

  // معالجة السحب والإفلات للصور
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      loadSelectedFile(file);
    }
  };

  // تجربة صورة من العينات الجاهزة بنقرة واحدة
  const handleSelectSample = (sample: typeof SAMPLE_IMAGES[0]) => {
    setOriginalImageSrc(sample.originalUrl);
    setOriginalImageName(sample.name);
    setProcessedImageSrc(null);
    setOriginalImageMeta({
      width: 600,
      height: 400,
      size: "0.25 MB"
    });
    // زيادة التفاعل
    triggerAdRevenue(1, 0, 0.005 * adConfig.adFrequencyMultiplier);
  };

  // البدء الفعلي في معالجة وتحسين جودة الصورة
  const handleProcessImage = async () => {
    if (!originalImageSrc) return;

    setIsProcessing(true);
    setProcessingStage("تحميل بكسلات الصورة الأساسية...");

    try {
      const img = await loadImage(originalImageSrc);
      
      const processedDataUrl = await processImageCanvas(
        img,
        settings,
        (stage) => {
          setProcessingStage(stage);
        }
      );

      setProcessedImageSrc(processedDataUrl);
      
      // حساب المقاييس الجديدة بعد التكبير والتحسين
      const newWidth = img.naturalWidth * settings.upscaleFactor;
      const newHeight = img.naturalHeight * settings.upscaleFactor;
      // محاكاة زيادة الحجم بناءً على نوع الصورة لزيادة الجاذبية البصرية للتفاصيل
      const estNewSize = ((img.naturalWidth * img.naturalHeight * settings.upscaleFactor * 4 * 0.15) / (1024 * 1024)).toFixed(2) + " MB";

      setProcessedImageMeta({
        width: newWidth,
        height: newHeight,
        size: estNewSize
      });

      // إضافة الصورة لسجل المعالجة
      const historyItem: ProcessedHistoryItem = {
        id: Math.random().toString(36).substring(7),
        name: originalImageName,
        originalSize: originalImageMeta?.size || "N/A",
        processedSize: estNewSize,
        originalResolution: `${img.naturalWidth} x ${img.naturalHeight}`,
        processedResolution: `${newWidth} x ${newHeight}`,
        timestamp: new Date().toLocaleTimeString("ar-SA")
      };
      setHistory(prev => [historyItem, ...prev].slice(0, 5));

      // تفعيل نافذة إشعار نجاح المعالجة مع زيادة الأرباح بفضل معالجة الصورة بنجاح
      showNotificationAlert("🎉 تم رفع جودة الصورة بنجاح وتوليد التفاصيل الفائقة!");
      triggerAdRevenue(2, 0, 0.01 * adConfig.adFrequencyMultiplier); // ظهور إعلاني مزدوج عند النتيجة

    } catch (error) {
      console.error("Image processing failed:", error);
      showNotificationAlert("❌ حدث خطأ أثناء تحسين جودة الصورة. يرجى تجربة ملف آخر.");
    } finally {
      setIsProcessing(false);
    }
  };

  const showNotificationAlert = (msg: string) => {
    setNotificationMsg(msg);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  // تحميل الصورة النهائية المحسنة لجهاز المستخدم مجاناً
  const handleDownload = () => {
    if (!processedImageSrc) return;

    const link = document.createElement("a");
    link.download = `enhanced_${originalImageName.split(".")[0] || "image"}.${downloadFormat}`;
    link.href = processedImageSrc;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // ربح إضافي عند التحميل! (إعلان مكافأة غير مرئي أو تفاعل قوي للمستخدم)
    showNotificationAlert("📥 جاري تحميل الصورة بالجودة الكاملة مجاناً! شكراً لاستخدامك موقعنا.");
    triggerAdRevenue(1, 1, 0.28 * adConfig.adFrequencyMultiplier); // نقرة إعلانية محاكاة تفاعلية عند تحميل الملف
  };

  // التحكم بشريط التمرير للمقارنة التفاعلية قبل/بعد
  const handleSliderMove = (clientX: number) => {
    if (!sliderContainerRef.current) return;
    const rect = sliderContainerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) { // التأكد من الضغط المستمر أثناء تحريك الماوس
      handleSliderMove(e.clientX);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches[0]) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const resetWorkspace = () => {
    setOriginalImageSrc(null);
    setProcessedImageSrc(null);
    setOriginalImageMeta(null);
    setProcessedImageMeta(null);
    setOriginalImageName("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-blue-600/20 selection:text-blue-900 antialiased relative" dir="rtl">
      
      {/* شبكة الإضاءة الخلفية المحيطة لمظهر فائق الجودة والأناقة والنعومة */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 left-1/4 w-[350px] h-[350px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-slate-500/5 rounded-full blur-[100px] pointer-events-none"></div>

      {/* شريط الإشعارات المنبثق العلوي الجذاب */}
      <AnimatePresence>
        {showNotification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white border border-slate-150 text-slate-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-200/50"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></div>
            <p className="text-sm font-semibold">{notificationMsg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* الهيدر العلوي للموقع */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex justify-between items-center">
          
          {/* الشعار والاسم */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={handleLogoClick}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/15">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-md sm:text-lg font-black tracking-tight flex items-center gap-2 text-slate-900">
                <span>مُحسّن جودة الصور</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full border border-blue-100 font-bold">مجاني بالكامل</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block">رفع دقة وجودة تفاصيل الصور فورا بضغطة زر</p>
            </div>
          </div>

          {/* أزرار لوحة التحكم والمكاسب */}
          <div className="flex items-center gap-3">
            {isAdminUnlocked && (
              <button
                onClick={() => setShowAdminDashboard(true)}
                className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border border-slate-200 transition-all shadow-sm hover:border-blue-400 hover:text-blue-600 cursor-pointer group"
                id="admin-dashboard-btn"
              >
                <Coins size={15} className="text-blue-600 group-hover:scale-110 transition-transform" />
                <span>لوحة الأرباح</span>
                <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border border-blue-100">
                  ${adStats.estimatedEarnings.toFixed(3)}
                </span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* المساحة الإعلانية العلوية لزيادة أرباح الموقع (Top Leaderboard Banner) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
        <AdSpace type="top-leaderboard" config={adConfig} onAdTrigger={triggerAdRevenue} />
      </div>

      {/* محتوى الصفحة الرئيسي */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        
        {/* هيرو الموقع والتعريف الخدمي */}
        <section className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-100 px-3.5 py-1 rounded-full text-xs font-bold text-blue-600 mb-2">
            <Zap size={12} className="animate-pulse" />
            <span>تقنية معالجة بكسلات فورية ومتقدمة</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
            اجعل صورك <span className="text-blue-600">فائقة الدقة والوضوح</span> مجاناً
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-xl mx-auto font-medium">
            قم بزيادة دقة صورك بمعدل 2x أو 4x، وتوضيح ملامح الوجوه المبهمة، وإزالة التشويش، وتعديل مستويات السطوع والتباين تلقائياً دون أي تكلفة.
          </p>
        </section>

        {/* لوحة العمل الرئيسية */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* قسم المعاينة والتحميل والمقارنة */}
          <div className="lg:col-span-8 space-y-6">
            
            {!originalImageSrc ? (
              /* حالة عدم وجود صورة */
              <div className="space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-white hover:bg-slate-50/50 rounded-3xl p-10 sm:p-16 text-center cursor-pointer transition-all space-y-4 group relative overflow-hidden shadow-sm"
                  id="drop-zone"
                >
                  
                  {/* أيقونة الرفع التفاعلية */}
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto group-hover:scale-105 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shadow-sm">
                    <Upload className="text-slate-400 group-hover:text-blue-600 transition-colors" size={28} />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800">اسحب صورتك هنا أو انقر للتصفح من جهازك</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      يدعم صيغ JPG, PNG, WEBP بدقة تصل إلى 12 ميجا بكسل. معالجة آمنة ومحلية 100% لحماية خصوصيتك.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* صور عينات سريعة للتجربة الفورية */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-500 text-center flex items-center justify-center gap-1.5">
                    <Eye size={12} className="text-blue-500" />
                    <span>ليس لديك صورة جاهزة؟ جرب الخدمة فوراً بإحدى العينات المجهزة:</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {SAMPLE_IMAGES.map((sample) => (
                      <button
                        key={sample.id}
                        onClick={() => handleSelectSample(sample)}
                        className="flex items-center gap-3 p-3 bg-white hover:bg-slate-50/50 hover:border-slate-300 rounded-2xl border border-slate-200 transition-all text-right group cursor-pointer shadow-sm"
                      >
                        <img
                          src={sample.originalUrl}
                          alt={sample.label}
                          className="w-12 h-12 rounded-xl object-cover flex-shrink-0 bg-slate-100 shadow-sm group-hover:scale-105 transition-transform"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h5 className="text-xs font-bold text-slate-700 group-hover:text-blue-600 transition-colors">
                            {sample.label}
                          </h5>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">{sample.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* حالة وجود صورة */
              <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 space-y-6 shadow-sm">
                
                {/* شريط التحكم السريع بالصورة وحجمها */}
                <div className="flex justify-between items-center text-xs text-slate-500 bg-slate-50 px-4 py-2.5 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <ImageIcon size={14} className="text-slate-400" />
                    <span className="font-bold text-slate-700 truncate max-w-[150px] sm:max-w-xs">{originalImageName}</span>
                    {originalImageMeta && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({originalImageMeta.width} × {originalImageMeta.height} px • {originalImageMeta.size})
                      </span>
                    )}
                  </div>
                  <button
                    onClick={resetWorkspace}
                    className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <Trash2 size={13} />
                    <span>تغيير الصورة</span>
                  </button>
                </div>

                {/* الصندوق الرئيسي للمقارنة التفاعلية */}
                <div
                  ref={sliderContainerRef}
                  onMouseMove={handleMouseMove}
                  onTouchMove={handleTouchMove}
                  className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner select-none cursor-ew-resize"
                  id="comparative-slider"
                >
                  {/* الطبقة الخلفية: الصورة الأصلية قبل التعديل */}
                  <img
                    src={originalImageSrc}
                    alt="Original"
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable="false"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-sm text-[10px] text-white font-bold px-2.5 py-1 rounded-lg border border-slate-700">
                    الصورة الأصلية (قبل)
                  </div>

                  {/* الطبقة الأمامية: الصورة المعالجة المحسنة */}
                  {processedImageSrc ? (
                    <>
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          clipPath: `polygon(0 0, ${sliderPosition}% 0, ${sliderPosition}% 100%, 0 100%)`
                        }}
                      >
                        <img
                          src={processedImageSrc}
                          alt="Enhanced"
                          className="absolute inset-0 w-full h-full object-contain"
                          draggable="false"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg shadow-md">
                        مُحسّنة بالذكاء الاصطناعي (بعد)
                      </div>

                      {/* شريط ومقبض التمرير العمودي التفاعلي */}
                      <div
                        className="absolute top-0 bottom-0 w-1 bg-blue-600 cursor-ew-resize"
                        style={{ left: `${sliderPosition}%` }}
                      >
                        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-blue-600 border-4 border-white text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform">
                          <ChevronLeft size={14} className="-ml-1" />
                          <ChevronRight size={14} className="-mr-1" />
                        </div>
                      </div>
                    </>
                  ) : (
                    /* حالة وجود صورة ولكن لم يتم النقر على بدء المعالجة والتحسين */
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500 flex items-center justify-center animate-pulse">
                        <Sparkles className="text-blue-400" size={22} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">الصورة جاهزة للتحسين والترقية الفائقة</h4>
                        <p className="text-xs text-slate-100 max-w-xs leading-relaxed">
                          قم بتعديل فلاتر التحسين في لوحة التحكم الجانبية واضغط على "رفع جودة الصورة الآن" لتوليد النتيجة فوراً.
                        </p>
                      </div>
                      <button
                        onClick={handleProcessImage}
                        disabled={isProcessing}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-black text-xs px-5 py-3 rounded-xl shadow-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Zap size={13} />
                        <span>ابدأ المعالجة السريعة</span>
                      </button>
                    </div>
                  )}

                  {/* لودر المعالجة والتكبير */}
                  {isProcessing && (
                    <div className="absolute inset-0 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
                      <div className="w-14 h-14 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin flex items-center justify-center shadow-inner">
                        <Sparkles className="text-blue-600 animate-pulse" size={20} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-black text-blue-600 animate-pulse">جاري تحسين جودة الصورة...</h4>
                        <p className="text-xs text-slate-500 font-mono transition-all duration-300">
                          ⚙️ {processingStage}
                        </p>
                      </div>
                      
                      {/* تقدم المعالجة البصري */}
                      <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600 animate-[pulse_1s_infinite]"></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* لوحة وخيارات التحميل بعد إتمام المعالجة بنجاح */}
                {processedImageSrc && processedImageMeta && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                      
                      {/* ملخص التحسين والمقارنة الرقمية */}
                      <div className="text-right space-y-1 w-full sm:w-auto">
                        <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                          <CheckCircle2 size={13} className="text-blue-600" />
                          <span>تقرير دقة الصورة بعد الترقية بالذكاء الاصطناعي:</span>
                        </h4>
                        <div className="flex items-center gap-3 text-xs font-mono text-slate-500">
                          <span>قبل: <strong className="text-slate-700 font-bold">{originalImageMeta?.width}×{originalImageMeta?.height}</strong></span>
                          <span>←</span>
                          <span className="text-blue-600">بعد: <strong>{processedImageMeta.width}×{processedImageMeta.height}</strong> ({settings.upscaleFactor}x دقة أكبر)</span>
                        </div>
                      </div>

                      {/* إعدادات صيغة الملف المراد تنزيله */}
                      <div className="flex items-center gap-3 bg-white p-1.5 rounded-xl border border-slate-200 w-full sm:w-auto justify-between sm:justify-start">
                        <span className="text-xs text-slate-500 px-1 font-bold">الصيغة:</span>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => setDownloadFormat("png")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              downloadFormat === "png"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-850"
                            }`}
                          >
                            PNG (جودة مطلقة)
                          </button>
                          <button
                            onClick={() => setDownloadFormat("jpeg")}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                              downloadFormat === "jpeg"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-slate-500 hover:text-slate-850"
                            }`}
                          >
                            JPEG (حجم مضغوط)
                          </button>
                        </div>
                      </div>

                    </div>

                    {/* زر التحميل الفائق الجودة مجاناً */}
                    <button
                      onClick={handleDownload}
                      className="w-full bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold py-4 rounded-2xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <Download size={18} />
                      <span>تحميل الصورة المحسّنة مجاناً بالكامل</span>
                    </button>
                  </motion.div>
                )}

              </div>
            )}

            <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-6 shadow-sm">
              
              <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
                <Sliders className="text-blue-600" size={18} />
                <h3 className="text-sm font-bold text-slate-900">لوحة التحكم بالفلاتر والتكبير</h3>
              </div>

              {/* 1. خيارات معدل التكبير الفائق */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700">معدل رفع الأبعاد والدقة (Super Resolution):</label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, upscaleFactor: 2 }))}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      settings.upscaleFactor === 2
                        ? "border-blue-500 bg-blue-50 text-blue-600 font-black"
                        : "border-slate-200 hover:border-slate-300 text-slate-500 bg-white"
                    }`}
                  >
                    <p className="text-sm">2x</p>
                    <p className="text-[10px] opacity-75 mt-0.5">موصى به (سريع)</p>
                  </button>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, upscaleFactor: 4 }))}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      settings.upscaleFactor === 4
                        ? "border-blue-500 bg-blue-50 text-blue-600 font-black"
                        : "border-slate-200 hover:border-slate-300 text-slate-500 bg-white"
                    }`}
                  >
                    <p className="text-sm">4x</p>
                    <p className="text-[10px] opacity-75 mt-0.5">فائق الجودة (4K)</p>
                  </button>
                </div>
              </div>

              {/* 2. تحسينات الألوان والوجه التلقائية */}
              <div className="space-y-3.5 pt-2">
                <label className="block text-xs font-bold text-slate-700">التحسينات التلقائية بالذكاء الاصطناعي:</label>
                
                {/* مفتاح موازنة ألوان وتباين تلقائي */}
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center border border-blue-100">
                      <Contrast size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">توازن تلقائي فائق</h4>
                      <p className="text-[10px] text-slate-400">موازنة التباين التلقائي ومستويات الإضاءة</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoBalance}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoBalance: e.target.checked }))}
                    className="accent-blue-600 w-4 h-4"
                  />
                </label>

                {/* مفتاح تنعيم وتفاصيل الوجه */}
                <label className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
                      <Sparkles size={14} className="text-indigo-600" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">تحسين تفاصيل الوجه والجلد</h4>
                      <p className="text-[10px] text-slate-400">تنعيم البشرة وتوضيح العيون وملامح البورتريه</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.faceEnhance}
                    onChange={(e) => setSettings(prev => ({ ...prev, faceEnhance: e.target.checked }))}
                    className="accent-blue-600 w-4 h-4"
                  />
                </label>
              </div>

              {/* 3. الضبط الدقيق والمتقدم عبر أشرطة الانزلاق */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <Sliders size={13} className="text-slate-400" />
                  <span>الضبط والتحكم اليدوي المتقدم:</span>
                </div>

                {/* شريط زيادة حدة وتفاصيل البكسلات */}
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">زيادة حدة التفاصيل (Sharpen):</span>
                    <span className="text-blue-600 font-mono">{settings.sharpness}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.sharpness}
                    onChange={(e) => setSettings(prev => ({ ...prev, sharpness: Number(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-400">توضيح الحواف الضبابية بدقة بالغة</p>
                </div>

                {/* شريط إزالة التشويش والنويز */}
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">تصفية وإزالة التشويش (Denoise):</span>
                    <span className="text-blue-600 font-mono">{settings.denoise}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={settings.denoise}
                    onChange={(e) => setSettings(prev => ({ ...prev, denoise: Number(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                  />
                  <p className="text-[10px] text-slate-400">إزالة الحبيبات الرقمية وضوضاء الضغط بالصور</p>
                </div>

                {/* شريط تعديل السطوع */}
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">السطوع والإضاءة (Brightness):</span>
                    <span className="text-blue-600 font-mono">
                      {settings.brightness > 0 ? `+${settings.brightness}` : settings.brightness}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.brightness}
                    onChange={(e) => setSettings(prev => ({ ...prev, brightness: Number(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* شريط التباين */}
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">درجة التباين والعمق (Contrast):</span>
                    <span className="text-blue-600 font-mono">
                      {settings.contrast > 0 ? `+${settings.contrast}` : settings.contrast}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.contrast}
                    onChange={(e) => setSettings(prev => ({ ...prev, contrast: Number(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                  />
                </div>

                {/* شريط تشبع الألوان */}
                <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-700">حيوية وتشبع الألوان (Saturation):</span>
                    <span className="text-blue-600 font-mono">
                      {settings.saturation > 0 ? `+${settings.saturation}` : settings.saturation}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={settings.saturation}
                    onChange={(e) => setSettings(prev => ({ ...prev, saturation: Number(e.target.value) }))}
                    className="w-full accent-blue-600 cursor-pointer h-1 bg-slate-200 rounded-lg"
                  />
                </div>
              </div>

              {/* زر تفعيل عملية معالجة وتحسين جودة البكسلات الفوري */}
              {originalImageSrc && (
                <button
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl shadow-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles size={16} />
                  <span>تطبيق وتحسين جودة الصورة الآن</span>
                </button>
              )}

            </div>

            {/* مساحة إعلانية تحت شاشة العرض (Native Feed Ad Block) لزيادة الأرباح */}
            <AdSpace type="native-feed" config={adConfig} onAdTrigger={triggerAdRevenue} />

            {/* قسم الأسئلة الشائعة وكيفية عمل الأداة لتقوية محركات البحث SEO */}
            <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">الأسئلة الشائعة حول مُحسّن الصور المجاني:</h3>
              <div className="space-y-4 text-xs sm:text-sm text-slate-500 leading-relaxed">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">1. كيف يمكن للموقع تقديم هذه الخدمة الفائقة مجاناً بالكامل؟</h4>
                  <p>
                    نحن نعتمد في نموذج عملنا على عرض مساحات إعلانية مدمجة غير مزعجة (مثل إعلانات رعاية، استضافات، وكورسات ذكاء اصطناعي). هذا يسمح لنا بتغطية تكاليف الخوادم وتطوير الأداة وتقديم الخدمة مجاناً لجميع المصممين وأصحاب المواقع حول العالم.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">2. هل الصور الخاصة بي آمنة على الموقع؟</h4>
                  <p>
                    نعم، بالتأكيد! تتم معالجة الصور بالكامل محلياً داخل متصفح الويب الخاص بجهازك باستخدام تقنيات الـ Canvas وخوارزميات الالتفاف المتطورة. لا يتم رفع صورك على أي خوادم خارجية، مما يضمن خصوصية وحماية مطلقة بنسبة 100%.
                  </p>
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800">3. كيف يمكنني تحقيق الربح بمثل هذا الموقع وتدشين مشروعي الخاص؟</h4>
                  <p>
                    موقع رفع جودة الصور يعد من أعلى مجالات الأدوات الخدمية (Utility SaaS) تحقيقاً للأرباح، نظراً لأن الزوار يمكثون فترات طويلة يجرون مقارنات للصور. يمكنك تصفح "لوحة الأرباح" في أعلى الموقع للاطلاع على دليل كامل لتدشين نسختك وربطها بـ Google AdSense لجلب دخل شهري ممتاز!
                  </p>
                </div>
              </div>
            </div>

          </div>

          {/* لوحة التحكم الجانبية */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* المساحة الإعلانية المدمجة */}
            <AdSpace type="sidebar-square" config={adConfig} onAdTrigger={triggerAdRevenue} />

            {/* سجل العمليات الأخيرة المعالجة */}
            {history.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-3xl p-5 space-y-4 shadow-sm">
                <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Zap size={14} className="text-blue-600" />
                  <span>الصور التي تم ترقيتها مؤخراً:</span>
                </h4>
                <div className="space-y-2 text-xs">
                  {history.map((item) => (
                    <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center gap-2">
                      <div className="min-w-0">
                        <p className="text-slate-800 font-bold truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{item.originalResolution} ← {item.processedResolution}</p>
                      </div>
                      <div className="text-left flex-shrink-0">
                        <span className="text-blue-600 font-bold font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.processedSize}</span>
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">{item.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </section>

      </main>

      {/* شريط الإعلان السفلي الثابت (Sticky Anchor Ad) لضمان تحقيق الربح */}
      <div className="sticky bottom-0 left-0 right-0 z-30 max-w-4xl mx-auto px-4 pb-4">
        <AdSpace type="sticky-anchor" config={adConfig} onAdTrigger={triggerAdRevenue} />
      </div>

      {/* لوحة تحكم الأرباح المباشرة وإعدادات أدسينس (Dashboard Modal) */}
      <AnimatePresence>
        {showAdminDashboard && (
          <AdSettingsDashboard
            config={adConfig}
            stats={adStats}
            onChangeConfig={(newConfig) => {
              setAdConfig(newConfig);
              setShowAdminDashboard(false);
              showNotificationAlert("💾 تم تحديث وحفظ تفاصيل الإعلانات ومضاعف الربح بنجاح!");
            }}
            onClose={() => setShowAdminDashboard(false)}
          />
        )}
      </AnimatePresence>

      {/* فوتر الموقع السفلي والتعريفي */}
      <footer className="border-t border-slate-200 py-8 bg-white text-center text-xs text-slate-400 mt-12 space-y-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 مُحسّن جودة الصور المجاني - جميع الحقوق محفوظة.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-600 transition-colors">سياسة الخصوصية</a>
            <span>•</span>
            <a href="#terms" className="hover:text-slate-600 transition-colors">شروط الاستخدام</a>
            {isAdminUnlocked && (
              <>
                <span>•</span>
                <button onClick={() => setShowAdminDashboard(true)} className="hover:text-blue-600 transition-colors font-bold cursor-pointer">
                  شريك الإعلانات جوجل أدسينس
                </button>
              </>
            )}
          </div>
        </div>
      </footer>

    </div>
  );
}
