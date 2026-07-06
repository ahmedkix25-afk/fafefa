import { ImageSettings } from "../types";

/**
 * دالة لتعديل أبعاد الصورة باستخدام Canvas بجودة عالية (Bicubic approximation)
 */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * معالج الصور الرئيسي لتطبيق المرشحات وتحسين جودة البكسلات بالتفصيل
 */
export function processImageCanvas(
  img: HTMLImageElement,
  settings: ImageSettings,
  onProgress: (stage: string) => void
): Promise<string> {
  return new Promise((resolve) => {
    setTimeout(() => {
      onProgress("تهيئة مساحة العمل وبناء الأبعاد الجديدة...");
      
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const scale = settings.upscaleFactor;
      
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(img.src);
        return;
      }
      
      // رسم الصورة بالتكبير المطلوب مع تفعيل تنعيم الصور عالي الجودة من المتصفح
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // الحصول على بكسلات الصورة للبدء بالمعالجة المتقدمة
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const len = data.length;
      
      // 1. التوازن التلقائي للألوان والتباين (Histogram Stretching)
      if (settings.autoBalance) {
        onProgress("تحسين توزيع الإضاءة وموازنة الألوان تلقائياً...");
        applyAutoBalance(data, len);
      }
      
      // 2. تعديل السطوع والتباين والتشبع يدوياً
      if (settings.brightness !== 0 || settings.contrast !== 0 || settings.saturation !== 0) {
        onProgress("ضبط مستويات السطوع والتباين وعمق الألوان...");
        applyBasicAdjustments(
          data,
          len,
          settings.brightness,
          settings.contrast,
          settings.saturation
        );
      }
      
      // وضع البيانات المعدلة مرة أخرى لتطبيق الفلاتر المكانية (الحدة وإزالة التشويش)
      ctx.putImageData(imageData, 0, 0);
      
      // 3. إزالة التشويش وتنعيم الأسطح (Bilateral Filter Approximation)
      if (settings.denoise > 0) {
        onProgress("إزالة التشويش الرقمي وتقليل ضوضاء الضغط (Denoise)...");
        const denoisedData = applySmartDenoise(ctx, canvas.width, canvas.height, settings.denoise);
        imageData = denoisedData;
        ctx.putImageData(imageData, 0, 0);
      }
      
      // 4. تحسين تفاصيل الوجه والبورتريه (Face Enhance Selective Smoothing)
      if (settings.faceEnhance) {
        onProgress("تحديد ملامح الوجه وتنعيم البشرة بذكاء...");
        const faceEnhancedData = applyFaceEnhancer(ctx, canvas.width, canvas.height);
        imageData = faceEnhancedData;
        ctx.putImageData(imageData, 0, 0);
      }
      
      // 5. زيادة الحدة وتوضيح الحواف (Unsharp Masking / Sharpness Convolution)
      if (settings.sharpness > 0) {
        onProgress("تطبيق خوارزمية زيادة حدة التفاصيل (Edge Sharpening)...");
        const sharpenedData = applySharpenConvolution(
          ctx,
          canvas.width,
          canvas.height,
          settings.sharpness
        );
        imageData = sharpenedData;
        ctx.putImageData(imageData, 0, 0);
      }
      
      onProgress("تصدير الصورة النهائية وتجهيزها للتحميل...");
      // إرجاع رابط الصورة المعالجة بصيغة PNG عالية الجودة
      const resultDataUrl = canvas.toDataURL("image/png");
      resolve(resultDataUrl);
    }, 100);
  });
}

/**
 * موازنة التباين التلقائي عن طريق تمديد الهستوغرام (Contrast / Histogram Stretching)
 */
function applyAutoBalance(data: Uint8ClampedArray, len: number) {
  let minR = 255, maxR = 0;
  let minG = 255, maxG = 0;
  let minB = 255, maxB = 0;
  
  // خطوة 1: إيجاد الحد الأدنى والأقصى لكل قناة لونية
  for (let i = 0; i < len; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    if (r < minR) minR = r;
    if (r > maxR) maxR = r;
    
    if (g < minG) minG = g;
    if (g > maxG) maxG = g;
    
    if (b < minB) minB = b;
    if (b > maxB) maxB = b;
  }
  
  // حماية ضد التقسيم على الصفر
  const rangeR = maxR - minR || 1;
  const rangeG = maxG - minG || 1;
  const rangeB = maxB - minB || 1;
  
  // خطوة 2: تمديد النطاق ليكون بين 0 و 255 كاملين
  for (let i = 0; i < len; i += 4) {
    data[i] = ((data[i] - minR) / rangeR) * 255;
    data[i + 1] = ((data[i + 1] - minG) / rangeG) * 255;
    data[i + 2] = ((data[i + 2] - minB) / rangeB) * 255;
  }
}

/**
 * تطبيق تعديلات السطوع والتباين والتشبع الأساسية للبكسلات
 */
function applyBasicAdjustments(
  data: Uint8ClampedArray,
  len: number,
  brightness: number,
  contrast: number,
  saturation: number
) {
  // تحويل القيم المدخلة (-100 إلى 100) لنسب رياضية قابلة للتطبيق
  const bOffset = (brightness / 100) * 255;
  const cFactor = Math.pow((contrast + 100) / 100, 2);
  const sFactor = (saturation + 100) / 100;
  
  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // 1. السطوع
    if (brightness !== 0) {
      r += bOffset;
      g += bOffset;
      b += bOffset;
    }
    
    // 2. التباين (حول القيمة الرمادية المتوسطة 128)
    if (contrast !== 0) {
      r = (r - 128) * cFactor + 128;
      g = (g - 128) * cFactor + 128;
      b = (b - 128) * cFactor + 128;
    }
    
    // 3. التشبع اللوني
    if (saturation !== 0) {
      // حساب السطوع النسبي للعين البشرية (Luminance)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;
      r = lum + (r - lum) * sFactor;
      g = lum + (g - lum) * sFactor;
      b = lum + (b - lum) * sFactor;
    }
    
    // التأكد من بقاء القيم في النطاق السليم 0 - 255
    data[i] = Math.max(0, Math.min(255, r));
    data[i + 1] = Math.max(0, Math.min(255, g));
    data[i + 2] = Math.max(0, Math.min(255, b));
  }
}

/**
 * زيادة حدة التفاصيل باستخدام مصفوفة الالتفاف (Sharpness Convolution Matrix)
 */
function applySharpenConvolution(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  sharpness: number
): ImageData {
  const original = ctx.getImageData(0, 0, w, h);
  const output = ctx.createImageData(w, h);
  const src = original.data;
  const dst = output.data;
  
  // حساب قوة الفلتر (بين 0 و 1)
  const strength = sharpness / 100;
  
  // مصفوفة الالتفاف للحدة الفائقة
  //     [ 0,  -s,  0 ]
  // K = [ -s, 1+4s, -s ]
  //     [ 0,  -s,  0 ]
  const centerWeight = 1 + 4 * strength;
  const edgeWeight = -strength;
  
  // تسريع العملية ببدء معالجة البيكسلات الداخلية وتجاوز الحواف الخارجية لتجنب الأخطاء الحدودية
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      
      for (let channel = 0; channel < 3; channel++) { // قنوات R, G, B
        const currentChannel = idx + channel;
        
        // حساب الالتفاف المحيط بالبكسل الحالي
        const top = src[currentChannel - w * 4] * edgeWeight;
        const left = src[currentChannel - 4] * edgeWeight;
        const center = src[currentChannel] * centerWeight;
        const right = src[currentChannel + 4] * edgeWeight;
        const bottom = src[currentChannel + w * 4] * edgeWeight;
        
        const sum = top + left + center + right + bottom;
        dst[currentChannel] = Math.max(0, Math.min(255, sum));
      }
      
      dst[idx + 3] = src[idx + 3]; // الاحتفاظ بقيمة الشفافية Alpha الأصلية
    }
  }
  
  // ملء الحواف لتجنب الفراغات السوداء بحواف الصورة
  for (let x = 0; x < w; x++) {
    copyPixel(src, dst, x, 0, w);
    copyPixel(src, dst, x, h - 1, w);
  }
  for (let y = 0; y < h; y++) {
    copyPixel(src, dst, 0, y, w);
    copyPixel(src, dst, w - 1, y, w);
  }
  
  return output;
}

/**
 * تنقية وإزالة التشويش بطريقة محافظة على الحواف الحادة (Bilateral-like Smart Denoise)
 * نقوم بعمل تنعيم ذكي لتقليل النويز دون خسارة حواف وتفاصيل الصورة
 */
function applySmartDenoise(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  denoise: number
): ImageData {
  const original = ctx.getImageData(0, 0, w, h);
  const output = ctx.createImageData(w, h);
  const src = original.data;
  const dst = output.data;
  
  const intensity = denoise / 100;
  // عتبة الفروق اللونية (كلما زادت، يتم تنعيم مساحات أكبر وتفاصيل أكثر)
  const colorThreshold = 25 * intensity;
  
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      
      const cr = src[idx];
      const cg = src[idx + 1];
      const cb = src[idx + 2];
      
      let sumR = 0, sumG = 0, sumB = 0;
      let count = 0;
      
      // فحص الجوار 3x3 للتنعيم الانتقائي
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const nIdx = ((y + ky) * w + (x + kx)) * 4;
          const nr = src[nIdx];
          const ng = src[nIdx + 1];
          const nb = src[nIdx + 2];
          
          // حساب الفرق اللوني بين البكسل المركزي والمحيط
          const diff = Math.sqrt(
            Math.pow(nr - cr, 2) + Math.pow(ng - cg, 2) + Math.pow(nb - cb, 2)
          );
          
          // إذا كان الفرق صغير (مساحة ناعمة/تشويش)، ندمجه في التنعيم
          // إذا كان كبير (حافة حادة)، نمنعه لحماية الحافة
          if (diff < colorThreshold) {
            const weight = 1.0 - (diff / colorThreshold);
            sumR += nr * weight;
            sumG += ng * weight;
            sumB += nb * weight;
            count += weight;
          }
        }
      }
      
      if (count > 0) {
        dst[idx] = sumR / count;
        dst[idx + 1] = sumG / count;
        dst[idx + 2] = sumB / count;
      } else {
        dst[idx] = cr;
        dst[idx + 1] = cg;
        dst[idx + 2] = cb;
      }
      
      dst[idx + 3] = src[idx + 3];
    }
  }
  
  // نسخ الحواف
  for (let x = 0; x < w; x++) {
    copyPixel(src, dst, x, 0, w);
    copyPixel(src, dst, x, h - 1, w);
  }
  for (let y = 0; y < h; y++) {
    copyPixel(src, dst, 0, y, w);
    copyPixel(src, dst, w - 1, y, w);
  }
  
  return output;
}

/**
 * فلتر تحسين ملامح الوجه الذكي (Face/Skin Selective Softener)
 * يبحث عن درجات ألوان البشرة التقريبية ويقوم بتنعيمها حصراً للحفاظ على الشعر والعيون والخلفية حادة
 */
function applyFaceEnhancer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number
): ImageData {
  const original = ctx.getImageData(0, 0, w, h);
  const output = ctx.createImageData(w, h);
  const src = original.data;
  const dst = output.data;
  
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      
      const r = src[idx];
      const g = src[idx + 1];
      const b = src[idx + 2];
      
      // كشف لون البشرة بناء على درجات ألوان RGB القياسية للبشرة بجميع أطيافها
      const isSkin =
        r > 95 &&
        g > 40 &&
        b > 20 &&
        r > g &&
        r > b &&
        r - g > 15 &&
        Math.abs(r - g) > 15 &&
        (Math.max(r, g, b) - Math.min(r, g, b) > 15);
      
      if (isSkin) {
        // تطبيق تنعيم فائق (متوسط الجوار 3x3) للبشرة لتقليل البثور والنمش
        let sumR = 0, sumG = 0, sumB = 0;
        let count = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const nIdx = ((y + ky) * w + (x + kx)) * 4;
            sumR += src[nIdx];
            sumG += src[nIdx + 1];
            sumB += src[nIdx + 2];
            count++;
          }
        }
        
        // دمج 70% من البكسل الناعم مع 30% من التفاصيل الأصلية لمظهر طبيعي غير مصطنع
        dst[idx] = (sumR / count) * 0.7 + r * 0.3;
        dst[idx + 1] = (sumG / count) * 0.7 + g * 0.3;
        dst[idx + 2] = (sumB / count) * 0.7 + b * 0.3;
      } else {
        // إبقاء التفاصيل غير البشرية (العيون، الحواجب، الملابس، الخلفية) حادة كما هي
        dst[idx] = r;
        dst[idx + 1] = g;
        dst[idx + 2] = b;
      }
      
      dst[idx + 3] = src[idx + 3];
    }
  }
  
  // نسخ الحواف
  for (let x = 0; x < w; x++) {
    copyPixel(src, dst, x, 0, w);
    copyPixel(src, dst, x, h - 1, w);
  }
  for (let y = 0; y < h; y++) {
    copyPixel(src, dst, 0, y, w);
    copyPixel(src, dst, w - 1, y, w);
  }
  
  return output;
}

/**
 * دالة مساعدة لنسخ بكسل معين من مصفوفة إلى أخرى
 */
function copyPixel(src: Uint8ClampedArray, dst: Uint8ClampedArray, x: number, y: number, w: number) {
  const idx = (y * w + x) * 4;
  dst[idx] = src[idx];
  dst[idx + 1] = src[idx + 1];
  dst[idx + 2] = src[idx + 2];
  dst[idx + 3] = src[idx + 3];
}
