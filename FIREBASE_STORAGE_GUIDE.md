# دليل Firebase Storage - رفع الملفات 📁

## ✅ تم الإعداد بنجاح!

تم إضافة **Firebase Storage** بالكامل إلى مشروعك لرفع وإدارة الملفات.

---

## 📋 ما تم إنجازه:

### ✅ 1. إضافة Storage إلى Firebase Config
تم تحديث `src/config/firebase.js`:
```javascript
import { getStorage } from 'firebase/storage';
export const storage = getStorage(app);
```

### ✅ 2. إنشاء ملف Storage Service
تم إنشاء `src/config/storage.js` مع **20+ دالة** لإدارة الملفات:
- رفع الصور (Images)
- رفع الفيديوهات (Videos)
- رفع الملفات الصوتية (Audio)
- رفع المستندات (Documents)
- حذف الملفات
- وغيرها...

### ✅ 3. تحويل دوال رفع الملفات في Layout.jsx
- ✅ `addMedia()` - الآن يستخدم Firebase Storage
- ✅ `handleFileUpload()` - الآن يستخدم Firebase Storage

### ✅ 4. إنشاء Storage Security Rules
تم إنشاء `storage.rules` مع قواعد أمان شاملة

---

## 🎯 المجلدات في Storage:

عند رفع الملفات، سيتم تنظيمها في المجلدات التالية:

```
firebase-storage-root/
├── images/          (الصور - حد أقصى 5MB)
├── videos/          (الفيديوهات - حد أقصى 50MB)
├── audio/           (الملفات الصوتية - حد أقصى 10MB)
├── documents/       (المستندات - حد أقصى 10MB)
└── uploads/         (مجلد عام - حد أقصى 10MB)
```

---

## 🔥 خطوات إعداد Storage في Firebase Console

### الخطوة 1: تفعيل Storage
1. اذهب إلى: https://console.firebase.google.com/
2. افتح مشروعك: **buttonsapi-sami**
3. من القائمة الجانبية، اختر **Storage**
4. اضغط **Get started**
5. اختر **Start in production mode** (سنضبط القواعد لاحقاً)
6. اختر الموقع (نفس موقع Firestore): `us-central` أو الأقرب لك
7. اضغط **Done**

### الخطوة 2: إعداد Security Rules
1. في Storage، اضغط على تبويب **Rules**
2. احذف القواعد الموجودة
3. انسخ محتوى ملف `storage.rules` من المشروع
4. الصق المحتوى في المحرر
5. اضغط **Publish** لتفعيل القواعد

### الخطوة 3: اختبار!
- جرب رفع صورة من التطبيق 🖼️
- جرب رفع فيديو 🎬
- جرب رفع مستند PDF 📄

---

## 📚 الدوال المتاحة في `storage.js`

### 🎨 رفع الوسائط:

#### `uploadMedia(file, onProgress)`
رفع صورة أو فيديو أو صوت تلقائياً
```javascript
const result = await uploadMedia(file, (progress) => {
  console.log(`${progress}% مكتمل`);
});
// result: { url, fileName, fileType, fileSize, path, mediaType }
```

#### `uploadImage(file, onProgress)`
رفع صورة فقط (JPG, PNG, GIF, WEBP)
```javascript
const result = await uploadImage(file);
// Maximum: 5MB
```

#### `uploadVideo(file, onProgress)`
رفع فيديو (MP4, WebM, OGG)
```javascript
const result = await uploadVideo(file);
// Maximum: 50MB
```

#### `uploadAudio(file, onProgress)`
رفع ملف صوتي (MP3, WAV, OGG)
```javascript
const result = await uploadAudio(file);
// Maximum: 10MB
```

### 📄 رفع المستندات:

#### `uploadDocument(file, onProgress)`
رفع مستند (PDF, Word, Excel, etc.)
```javascript
const result = await uploadDocument(file);
// Maximum: 10MB
// Allowed: .pdf, .doc, .docx, .txt, .xls, .xlsx, .ppt, .pptx, .zip, .rar
```

### 🗑️ حذف الملفات:

#### `deleteFile(filePath)`
حذف ملف بالمسار
```javascript
await deleteFile('images/1234567890_photo.jpg');
```

#### `deleteFileByURL(fileURL)`
حذف ملف بالرابط
```javascript
await deleteFileByURL('https://firebasestorage.googleapis.com/...');
```

### 📋 عرض الملفات:

#### `listFiles(folder)`
جلب قائمة الملفات في مجلد
```javascript
const files = await listFiles('images');
// Returns: [{ name, fullPath, url }, ...]
```

### 🛠️ دوال مساعدة:

```javascript
// الحصول على نوع الملف
const type = getFileType('photo.jpg'); // 'image'

// تحويل حجم الملف لنص مقروء
const size = formatFileSize(1048576); // '1 MB'

// التحقق من نوع الملف
const valid = validateFileType(file, ['image/jpeg', 'image/png']);

// التحقق من حجم الملف
const valid = validateFileSize(file, 5); // 5MB max
```

---

## 💻 أمثلة الاستخدام:

### مثال 1: رفع صورة مع شريط تقدم
```javascript
import { uploadImage } from '../config/storage';
import { toast } from 'react-hot-toast';

const handleImageUpload = async (file) => {
  const loadingToast = toast.loading('جاري رفع الصورة...');
  
  try {
    const result = await uploadImage(file, (progress) => {
      toast.loading(`جاري الرفع: ${Math.round(progress)}%`, {
        id: loadingToast
      });
    });
    
    console.log('URL:', result.url);
    console.log('Path:', result.path);
    
    toast.success('تم رفع الصورة بنجاح!', { id: loadingToast });
    return result;
  } catch (error) {
    toast.error(error.message, { id: loadingToast });
  }
};
```

### مثال 2: رفع مستند
```javascript
import { uploadDocument } from '../config/storage';

const handleDocumentUpload = async (file) => {
  try {
    const result = await uploadDocument(file);
    
    // حفظ معلومات الملف في Firestore
    await addButton({
      type: 'file',
      file: result.url,
      fileName: result.fileName,
      filePath: result.path,
      fileSize: result.fileSize
    });
    
    return result;
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### مثال 3: حذف ملف عند حذف زر
```javascript
import { deleteFileByURL } from '../config/storage';

const handleDeleteButton = async (button) => {
  // حذف الملف من Storage إذا كان موجوداً
  if (button.media) {
    await deleteFileByURL(button.media);
  }
  
  // حذف الزر من Firestore
  await deleteButton(button.id);
};
```

---

## 🔐 قواعد الأمان (Storage Rules):

### القواعد الحالية:
```javascript
// القراءة: متاحة للجميع ✅
allow read: if true;

// الكتابة: للمستخدمين المسجلين فقط ✅
allow create: if isSignedIn();

// الحذف: للمستخدمين المسجلين فقط ✅
allow delete: if isSignedIn();
```

### الحدود القصوى:
- **الصور**: 5 MB
- **الفيديوهات**: 50 MB
- **الصوتيات**: 10 MB
- **المستندات**: 10 MB

---

## ⚠️ ملاحظات مهمة:

### 1. Authentication مطلوب للرفع
حالياً القواعد تتطلب Authentication. إذا لم يكن لديك نظام تسجيل دخول:

**حل مؤقت للتطوير:**
يمكنك تعديل `storage.rules` لتكون:
```javascript
allow create: if true; // السماح للجميع (للتطوير فقط!)
```

**الحل الدائم:**
إضافة Firebase Authentication أو تسجيل دخول مجهول:
```javascript
import { signInAnonymously } from 'firebase/auth';
import { auth } from './config/firebase';

// عند بدء التطبيق
signInAnonymously(auth);
```

### 2. حجم الملفات
- الأحجام المحددة في `storage.js` يمكن تعديلها
- لكن تذكر: Firebase لديه حد أقصى 5GB لكل ملف

### 3. التكلفة
في الخطة المجانية (Spark):
- **Storage**: 5GB مساحة تخزين
- **Downloads**: 1GB/يوم
- **Uploads**: 10GB/يوم (غير محدود)

---

## 🎨 تحسينات اختيارية:

### 1. إضافة شريط تقدم مرئي
```javascript
import { useState } from 'react';

const [uploadProgress, setUploadProgress] = useState(0);

const result = await uploadImage(file, (progress) => {
  setUploadProgress(progress);
});

// في الـ JSX:
<div className="progress-bar">
  <div style={{ width: `${uploadProgress}%` }}>
    {Math.round(uploadProgress)}%
  </div>
</div>
```

### 2. معاينة الصورة قبل الرفع
```javascript
const [preview, setPreview] = useState(null);

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (file && file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  }
};
```

### 3. ضغط الصور قبل الرفع
يمكنك استخدام مكتبة مثل `browser-image-compression`:
```bash
npm install browser-image-compression
```

```javascript
import imageCompression from 'browser-image-compression';

const compressedFile = await imageCompression(file, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920
});
```

---

## 🚀 الخطوات التالية:

### ✅ تم الانتهاء:
- [x] إعداد Firebase Storage
- [x] إنشاء دوال الرفع والحذف
- [x] تحويل `addMedia()` و `handleFileUpload()`
- [x] إنشاء Storage Rules

### 🎯 المتبقي (اختياري):
- [ ] إضافة Firebase Authentication (للأمان الكامل)
- [ ] إضافة شريط تقدم مرئي
- [ ] إضافة ضغط الصور
- [ ] إضافة معاينة الملفات قبل الرفع
- [ ] إضافة إدارة الملفات (عرض + حذف)

---

## 🐛 استكشاف الأخطاء:

### خطأ: "Firebase Storage: User does not have permission"
**الحل:**
1. تحقق من أنك فعّلت Storage Rules في Firebase Console
2. أضف تسجيل دخول مجهول:
```javascript
import { signInAnonymously } from 'firebase/auth';
signInAnonymously(auth);
```

### خطأ: "File size exceeds maximum"
**الحل:** قلل حجم الملف أو زد الحد الأقصى في `storage.js`

### خطأ: "Invalid file type"
**الحل:** تحقق من أن نوع الملف مدعوم في الدالة المستخدمة

---

## 📞 للدعم:

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Upload Files Guide](https://firebase.google.com/docs/storage/web/upload-files)

---

## ✨ مبروك!

تطبيقك الآن يدعم **رفع الملفات** بالكامل باستخدام Firebase Storage! 🎉

**الملفات التي يمكن رفعها:**
- 🖼️ صور (JPG, PNG, GIF, WEBP)
- 🎬 فيديوهات (MP4, WebM, OGG)
- 🎵 صوتيات (MP3, WAV, OGG)
- 📄 مستندات (PDF, Word, Excel, PowerPoint, ZIP, RAR)

**جرب الآن!** 🚀

