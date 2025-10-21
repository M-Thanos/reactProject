# دليل نظام المصادقة والأدوار

## نظرة عامة

تم إضافة نظام مصادقة كامل للتطبيق باستخدام Firebase Authentication مع نظام أدوار (Roles) متقدم.

## الأدوار المتاحة

النظام يدعم ثلاثة أدوار رئيسية:

### 1. Admin (مدير)
- الوصول الكامل للنظام
- إدارة المستخدمين (إضافة، تعديل، حذف)
- تغيير أدوار المستخدمين
- الوصول لجميع الصفحات والميزات

### 2. Designer (مصمم)
- إدارة الأزرار والعناصر
- الوصول لقائمة المسوقين
- لا يمكنه إدارة المستخدمين

### 3. User (مستخدم عادي)
- الوصول للصفحات الأساسية فقط
- عرض البيانات فقط
- لا يمكنه التعديل أو الإدارة

## الميزات المضافة

### 1. المصادقة (Authentication)
- تسجيل الدخول بالبريد الإلكتروني وكلمة المرور
- تسجيل الخروج
- حفظ حالة تسجيل الدخول تلقائياً
- رسائل خطأ باللغة العربية

### 2. حماية المسارات (Route Protection)
- منع الوصول للصفحات المحمية بدون تسجيل دخول
- إعادة التوجيه التلقائي لصفحة تسجيل الدخول
- التحقق من الصلاحيات حسب الدور

### 3. إدارة المستخدمين (Admin فقط)
- عرض قائمة بجميع المستخدمين
- تعديل أدوار المستخدمين
- حذف المستخدمين
- عرض معلومات المستخدم (البريد، الاسم، الدور، تاريخ التسجيل)

### 4. واجهة المستخدم
- عرض معلومات المستخدم الحالي في الـHeader
- عرض الدور الخاص بالمستخدم
- قائمة منسدلة مع خيارات حسب الدور
- تصميم متجاوب وجميل

## الصفحات والمسارات

### المسارات العامة
- `/login` - صفحة تسجيل الدخول (متاحة للجميع)

### المسارات المحمية
- `/` - الصفحة الرئيسية (جميع المستخدمين المسجلين)
- `/client` - صفحة العميل (جميع المستخدمين المسجلين)
- `/marketers-list` - قائمة المسوقين (Admin و Designer فقط)
- `/users` - إدارة المستخدمين (Admin فقط)

## إعداد المستخدمين الأوليين

### الطريقة 1: استخدام Firebase Console

1. افتح Firebase Console
2. اذهب إلى **Authentication** > **Users**
3. أضف مستخدمين جدد
4. اذهب إلى **Firestore Database**
5. أنشئ collection باسم `users`
6. أضف document لكل مستخدم بالـUID الخاص به:
   ```json
   {
     "email": "admin@example.com",
     "role": "admin",
     "displayName": "المدير",
     "createdAt": "2024-01-01T00:00:00.000Z"
   }
   ```

### الطريقة 2: استخدام الكود

يمكنك إنشاء ملف مؤقت لإضافة المستخدمين:

```javascript
import { auth, db } from './src/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

async function createInitialUsers() {
  // إنشاء مدير
  const adminUser = await createUserWithEmailAndPassword(
    auth, 
    'admin@example.com', 
    'admin123'
  );
  await setDoc(doc(db, 'users', adminUser.user.uid), {
    email: 'admin@example.com',
    role: 'admin',
    displayName: 'المدير الرئيسي',
    createdAt: new Date().toISOString()
  });

  // إنشاء مصمم
  const designerUser = await createUserWithEmailAndPassword(
    auth, 
    'designer@example.com', 
    'designer123'
  );
  await setDoc(doc(db, 'users', designerUser.user.uid), {
    email: 'designer@example.com',
    role: 'designer',
    displayName: 'المصمم',
    createdAt: new Date().toISOString()
  });

  // إنشاء مستخدم عادي
  const normalUser = await createUserWithEmailAndPassword(
    auth, 
    'user@example.com', 
    'user123'
  );
  await setDoc(doc(db, 'users', normalUser.user.uid), {
    email: 'user@example.com',
    role: 'user',
    displayName: 'مستخدم عادي',
    createdAt: new Date().toISOString()
  });
}
```

## حسابات تجريبية

تم توفير حسابات تجريبية في صفحة تسجيل الدخول:

| الدور | البريد الإلكتروني | كلمة المرور |
|------|-------------------|-------------|
| Admin | admin@example.com | admin123 |
| Designer | designer@example.com | designer123 |
| User | user@example.com | user123 |

**ملاحظة مهمة:** يجب عليك إنشاء هذه الحسابات في Firebase أولاً!

## Firestore Security Rules

تم تحديث قواعد Firestore لدعم نظام الأدوار:

- **Users Collection**: يمكن للمستخدم قراءة بياناته فقط، والمدير يمكنه قراءة وتعديل الكل
- **Pages, Buttons, ButtonPositions**: فقط Admin و Designer يمكنهم الكتابة
- **Marketers**: فقط Admin و Designer يمكنهم الوصول

### نشر القواعد إلى Firebase

```bash
firebase deploy --only firestore:rules
```

## الملفات المضافة

```
src/
├── contexts/
│   └── AuthContext.tsx          # Context للمصادقة والأدوار
├── components/
│   └── ProtectedRoute.tsx       # مكون حماية المسارات
├── pages/
│   └── Auth/
│       ├── Login.tsx            # صفحة تسجيل الدخول
│       └── UserManagement.tsx   # صفحة إدارة المستخدمين
└── components/Header/
    └── DropdownUser.tsx         # تم تحديثه لعرض معلومات المستخدم
```

## الملفات المعدلة

- `src/App.tsx` - إضافة حماية المسارات
- `src/main.tsx` - إضافة AuthProvider
- `firestore.rules` - تحديث قواعد الأمان

## استخدام نظام الأدوار في الكود

### التحقق من الدور في المكونات

```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { userData, hasRole } = useAuth();

  // التحقق من دور واحد
  if (hasRole('admin')) {
    // كود خاص بالمدير
  }

  // التحقق من عدة أدوار
  if (hasRole(['admin', 'designer'])) {
    // كود خاص بالمدير والمصمم
  }

  return (
    <div>
      <p>دورك: {userData?.role}</p>
    </div>
  );
}
```

### حماية مسار معين

```tsx
<Route 
  path="/special-page" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <SpecialPage />
    </ProtectedRoute>
  } 
/>
```

## الأمان

### نصائح هامة:

1. **غير كلمات المرور الافتراضية** للحسابات التجريبية فوراً
2. **فعل Two-Factor Authentication** في Firebase Console للحسابات الهامة
3. **راجع Firestore Rules** بانتظام للتأكد من الأمان
4. **لا تشارك** بيانات اعتماد المدير مع أي شخص
5. **استخدم HTTPS** دائماً في الإنتاج

## استكشاف الأخطاء

### لا يمكن تسجيل الدخول
- تأكد من إنشاء المستخدم في Firebase Authentication
- تأكد من وجود document للمستخدم في collection `users`
- تحقق من صحة البريد وكلمة المرور

### رسالة "غير مصرح لك بالوصول"
- تحقق من الدور المسند للمستخدم في Firestore
- تأكد من تطابق الأدوار المطلوبة في `ProtectedRoute`

### خطأ في Firestore Rules
- تأكد من نشر القواعد الجديدة: `firebase deploy --only firestore:rules`
- تحقق من وجود document للمستخدم في collection `users`

## التطوير المستقبلي

يمكن إضافة:
- [ ] تسجيل دخول بـGoogle / Facebook
- [ ] استعادة كلمة المرور
- [ ] تغيير كلمة المرور
- [ ] صفحة الملف الشخصي
- [ ] سجل النشاطات (Activity Log)
- [ ] إشعارات بالبريد الإلكتروني
- [ ] أدوار مخصصة إضافية
- [ ] صلاحيات دقيقة (Permissions)

## الدعم

إذا واجهت أي مشاكل:
1. تحقق من Firebase Console للأخطاء
2. افحص Console في المتصفح
3. راجع ملفات Log
4. تأكد من تحديث جميع التبعيات

---

**تم التطوير بنجاح! ✨**

