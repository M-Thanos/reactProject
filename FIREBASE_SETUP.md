# إعداد Firebase Security Rules 🔒

## خطوات إعداد Security Rules في Firebase Console:

### 1. الذهاب إلى Firebase Console
- افتح: https://console.firebase.google.com/
- اختر مشروعك: **buttonsapi-sami**

### 2. إعداد Firestore Security Rules
1. من القائمة الجانبية، اختر **Firestore Database**
2. اضغط على تبويب **Rules**
3. انسخ المحتوى من ملف `firestore.rules` الموجود في المشروع
4. الصق المحتوى في محرر القواعد
5. اضغط **Publish** لتفعيل القواعد

### 3. إنشاء Collections في Firestore

#### طريقة 1: يدوياً من Console
1. اذهب إلى تبويب **Data**
2. اضغط **Start collection**
3. أنشئ Collections التالية:
   - `pages`
   - `buttons`
   - `buttonPositions`

#### طريقة 2: تلقائياً عند إضافة أول بيانات
- Collections ستُنشأ تلقائياً عند إضافة أول بيانات من التطبيق

---

## 📊 هيكل البيانات المقترح:

### Collection: `pages`
```json
{
  "id": "auto-generated",
  "name": "Page 1",
  "description": "وصف الصفحة",
  "order": 1,
  "isActive": true,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Collection: `buttons`
```json
{
  "id": "auto-generated",
  "pageId": "page-id-reference",
  "name": "Button 1",
  "type": "rectangle",
  "text": "نص الزر",
  "position": {
    "x": 100,
    "y": 200
  },
  "size": {
    "width": 150,
    "height": 50
  },
  "style": {
    "backgroundColor": "#3b82f6",
    "textColor": "#ffffff",
    "fontSize": 16,
    "borderRadius": 8
  },
  "linked_buttons": "button-id-or-null",
  "calculation": {},
  "isVisible": true,
  "order": 1,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Collection: `buttonPositions`
```json
{
  "id": "auto-generated",
  "buttonId": "button-id-reference",
  "x": 100,
  "y": 200,
  "z": 1,
  "rotation": 0,
  "scale": 1,
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

---

## 🔐 مستويات الأمان:

### المستوى الحالي (للتطوير):
- ✅ القراءة متاحة للجميع
- ✅ الكتابة تتطلب تسجيل دخول

### مستوى أعلى (للإنتاج):
يمكنك تفعيل القواعد المعلقة في `firestore.rules` لإضافة:
- التحقق من ملكية البيانات
- صلاحيات محددة لكل مستخدم
- التحقق من صحة البيانات

---

## ⚙️ استخدام Environment Variables:

### إنشاء ملف `.env`:
1. انسخ محتوى `.env.example`
2. أنشئ ملف جديد باسم `.env`
3. املأ القيم من Firebase Console

### ملاحظة مهمة:
- ⚠️ **لا تضف ملف `.env` إلى Git**
- ملف `.gitignore` موجود بالفعل ويتجاهل `.env`
- استخدم `.env.example` للمشاركة مع الفريق

---

## ✅ اختبار Firebase:

بعد إعداد Firebase، يمكنك اختبار الاتصال من التطبيق:

```javascript
import { getAllPages, addPage } from './config/firestore';

// اختبار جلب الصفحات
const pages = await getAllPages();
console.log('Pages:', pages);

// اختبار إضافة صفحة
const newPage = await addPage({
  name: 'Test Page',
  description: 'Test description',
  order: 1,
  isActive: true
});
console.log('New Page:', newPage);
```

---

## 🚀 الخطوات التالية:

1. ✅ إعداد Security Rules (هذا الملف)
2. ✅ إنشاء Collections
3. ⏳ ترحيل البيانات من API الحالي (إن وجدت)
4. ⏳ تحديث المكونات لاستخدام Firestore
5. ⏳ اختبار Real-time updates

---

## 📞 للدعم:
إذا واجهت أي مشاكل، راجع:
- [Firebase Documentation](https://firebase.google.com/docs/firestore)
- [Security Rules Guide](https://firebase.google.com/docs/firestore/security/get-started)

