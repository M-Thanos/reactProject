# Firebase Integration - دليل المشروع 🔥

تم تحويل المشروع بالكامل لاستخدام Firebase (Firestore + Storage) بدلاً من REST API.

---

## 📚 الملفات الهامة:

| الملف | الوصف | متى تحتاجه |
|------|-------|-----------|
| **STORAGE_QUICK_START.md** | 🚀 **ابدأ هنا!** خطوات سريعة لتفعيل Storage | الآن - لرفع الملفات |
| **FIREBASE_SETUP.md** | إعداد Firestore في Firebase Console | تم - اختياري للمراجعة |
| **FIREBASE_STORAGE_GUIDE.md** | دليل شامل لـ Firebase Storage | للتفاصيل والأمثلة |
| **FIRESTORE_MIGRATION_GUIDE.md** | دليل الانتقال من API إلى Firestore | للفهم الكامل |
| `firestore.rules` | قواعد أمان Firestore | انشرها في Console |
| `storage.rules` | قواعد أمان Storage | **انشرها الآن!** |

---

## ⚡ بدء سريع:

### 1. تفعيل Storage (إذا لم تفعله):
```bash
# راجع ملف STORAGE_QUICK_START.md
```

### 2. تشغيل المشروع:
```bash
npm run dev
```

### 3. اختبار:
- ✅ إضافة صفحة جديدة
- ✅ إضافة أزرار/أشكال
- ✅ رفع صورة
- ✅ رفع ملف PDF

---

## 🏗️ البنية الجديدة:

```
src/config/
├── firebase.js      → إعدادات Firebase الأساسية
├── firestore.js     → دوال Firestore (Pages, Buttons, Positions)
└── storage.js       → دوال Storage (رفع/حذف الملفات)
```

---

## 📦 Collections في Firestore:

1. **pages** - الصفحات
2. **buttons** - الأزرار
3. **buttonPositions** - مواقع الأزرار

---

## 📁 المجلدات في Storage:

1. **images/** - الصور (5MB max)
2. **videos/** - الفيديوهات (50MB max)
3. **audio/** - الملفات الصوتية (10MB max)
4. **documents/** - المستندات (10MB max)

---

## 🔐 الأمان:

### Firestore:
- ✅ القراءة: للجميع
- ✅ الكتابة: للمستخدمين المسجلين

### Storage:
- ✅ القراءة: للجميع
- ✅ الرفع/الحذف: للمستخدمين المسجلين

---

## 🎯 الدوال الأساسية:

### Firestore (من `firestore.js`):
```javascript
import { 
  getAllPagesWithButtons,
  addPage,
  addButton,
  updateButton,
  deleteButton 
} from './config/firestore';
```

### Storage (من `storage.js`):
```javascript
import { 
  uploadMedia,
  uploadDocument,
  deleteFile 
} from './config/storage';
```

---

## 💡 نصائح:

1. **للتطوير**: استخدم تسجيل دخول مجهول
2. **للإنتاج**: أضف Firebase Authentication كامل
3. **لتتبع الرفع**: استخدم `onProgress` callback
4. **لتقليل التكلفة**: اضغط الصور قبل الرفع

---

## 🐛 حل المشاكل:

| المشكلة | الحل |
|---------|------|
| "User does not have permission" | أضف تسجيل دخول مجهول |
| "File size exceeds" | قلل حجم الملف |
| "Invalid file type" | تحقق من نوع الملف المدعوم |
| لا توجد بيانات | تأكد من نشر Firestore Rules |

---

## 📞 للدعم:

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Guide](https://firebase.google.com/docs/firestore)
- [Storage Guide](https://firebase.google.com/docs/storage)

---

## ✅ Checklist:

### Firestore:
- [x] تثبيت Firebase SDK
- [x] إعداد firebase.js
- [x] إعداد firestore.js
- [x] نشر Firestore Rules
- [x] اختبار العمليات الأساسية

### Storage:
- [ ] تفعيل Storage في Console ← **افعل هذا الآن!**
- [ ] نشر Storage Rules ← **مهم!**
- [ ] إضافة تسجيل دخول مجهول ← **للاختبار**
- [ ] اختبار رفع الملفات

---

## 🎉 النتيجة:

✅ **لا حاجة لـ REST API**
✅ **لا حاجة لسيرفر منفصل**
✅ **رفع الملفات يعمل مباشرة**
✅ **تحديثات فورية (قريباً)**
✅ **مشروع حديث وقابل للتطوير**

---

**مبروك! مشروعك الآن يستخدم Firebase بالكامل! 🔥**

