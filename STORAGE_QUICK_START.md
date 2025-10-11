# تفعيل Firebase Storage - خطوات سريعة ⚡

## 🔥 3 خطوات فقط!

### 1️⃣ تفعيل Storage في Firebase Console

1. اذهب إلى: https://console.firebase.google.com/
2. افتح مشروعك: **buttonsapi-sami**
3. من القائمة الجانبية: **Storage**
4. اضغط **"Get started"**
5. اختر **"Start in production mode"**
6. اختر الموقع: `us-central` (أو الأقرب)
7. اضغط **"Done"**

---

### 2️⃣ نشر Storage Rules

1. في صفحة Storage، اضغط تبويب **"Rules"**
2. احذف القواعد الموجودة
3. انسخ المحتوى من ملف `storage.rules` في المشروع
4. الصق في المحرر
5. اضغط **"Publish"**

---

### 3️⃣ تسجيل دخول مجهول (للتطوير)

أضف هذا الكود في `src/main.tsx` أو `App.tsx`:

```javascript
import { signInAnonymously } from 'firebase/auth';
import { auth } from './config/firebase';

// تسجيل دخول مجهول عند بدء التطبيق
signInAnonymously(auth)
  .then(() => console.log('✅ تم تسجيل الدخول'))
  .catch((error) => console.error('❌ خطأ:', error));
```

---

## ✅ انتهيت! جرب الآن:

1. شغل التطبيق: `npm run dev`
2. اختر زر
3. جرب رفع صورة 🖼️
4. جرب رفع ملف PDF 📄

---

## 📁 الملفات المهمة:

- `FIREBASE_STORAGE_GUIDE.md` - دليل شامل
- `storage.rules` - قواعد الأمان
- `src/config/storage.js` - دوال الرفع

---

## 🐛 مشكلة؟

**خطأ: "User does not have permission"**
→ تأكد من نشر Storage Rules وإضافة تسجيل الدخول المجهول

**خطأ: "File size exceeds"**
→ حجم الملف كبير جداً (الحد: 5MB للصور، 50MB للفيديو)

---

🎉 **مبروك! Storage جاهز للاستخدام!**

