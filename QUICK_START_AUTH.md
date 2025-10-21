# دليل البدء السريع - نظام المصادقة 🚀

## الخطوة 1: إنشاء المستخدمين الأوليين

### الطريقة الأولى: Firebase Console (موصى بها)

1. افتح [Firebase Console](https://console.firebase.google.com)
2. اختر مشروعك: `buttonsapi-sami`
3. اذهب إلى **Authentication** > **Users** > **Add user**
4. أضف المستخدمين التالية:

#### مدير:
- Email: `admin@example.com`
- Password: `admin123`

#### مصمم:
- Email: `designer@example.com`  
- Password: `designer123`

#### مستخدم عادي:
- Email: `user@example.com`
- Password: `user123`

5. بعد إضافة كل مستخدم، اذهب إلى **Firestore Database**
6. افتح collection **users** (أنشئها إذا لم تكن موجودة)
7. أضف document لكل مستخدم بالـ **UID** الخاص به من Authentication:

```
Document ID: [UID من Authentication]

{
  "email": "admin@example.com",
  "role": "admin",
  "displayName": "المدير الرئيسي",
  "createdAt": "2024-01-20T00:00:00.000Z"
}
```

كرر العملية للمستخدمين الآخرين مع تغيير `role` إلى `designer` و `user`

### الطريقة الثانية: استخدام الكود

1. أضف صفحة مؤقتة في `src/pages/Setup.tsx`:

```tsx
import { useState } from 'react';
import { createInitialUsers } from '../utils/createInitialUsers';

function Setup() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    setLoading(true);
    try {
      const res = await createInitialUsers();
      setResults(res);
    } catch (error) {
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl mb-4">إعداد المستخدمين الأوليين</h1>
      <button 
        onClick={handleSetup}
        disabled={loading}
        className="bg-primary text-white px-6 py-3 rounded"
      >
        {loading ? 'جاري الإنشاء...' : 'إنشاء المستخدمين'}
      </button>
      
      {results && (
        <div className="mt-4">
          <h2 className="text-lg font-bold">النتائج:</h2>
          <div className="mt-2">
            <p className="text-green-600">نجح: {results.success.length}</p>
            <ul>
              {results.success.map((email: string) => (
                <li key={email}>✅ {email}</li>
              ))}
            </ul>
            
            {results.failed.length > 0 && (
              <>
                <p className="text-red-600 mt-2">فشل: {results.failed.length}</p>
                <ul>
                  {results.failed.map((item: any) => (
                    <li key={item.email}>❌ {item.email}: {item.error}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Setup;
```

2. أضف route مؤقت في `App.tsx`:

```tsx
<Route path="/setup" element={<Setup />} />
```

3. اذهب إلى `http://localhost:5173/setup`
4. اضغط على زر "إنشاء المستخدمين"
5. **احذف** الملف والـroute بعد الانتهاء!

## الخطوة 2: نشر Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## الخطوة 3: تجربة النظام

1. شغل المشروع:
```bash
npm run dev
```

2. افتح المتصفح على `http://localhost:5173`

3. سيتم تحويلك تلقائياً لصفحة تسجيل الدخول

4. جرب الحسابات:

### تجربة حساب Admin:
```
Email: admin@example.com
Password: admin123
```
- يمكنك الوصول لجميع الصفحات
- اذهب إلى `/users` لإدارة المستخدمين
- يظهر في Header: "مدير"

### تجربة حساب Designer:
```
Email: designer@example.com
Password: designer123
```
- يمكنك الوصول لمعظم الصفحات ماعدا إدارة المستخدمين
- يمكنك الوصول لـ `/marketers-list`
- يظهر في Header: "مصمم"

### تجربة حساب User:
```
Email: user@example.com
Password: user123
```
- وصول محدود للصفحات الأساسية فقط
- لا يمكن الوصول لـ `/marketers-list` أو `/users`
- يظهر في Header: "مستخدم"

## الخطوة 4: تخصيص النظام

### تغيير كلمات المرور:
1. اذهب إلى Firebase Console
2. Authentication > Users
3. اختر المستخدم > Reset password

### إضافة مستخدم جديد:
1. سجل دخول كـ Admin
2. اذهب إلى `/users`
3. ملاحظة: حالياً يجب إضافتهم من Firebase Console
4. يمكن تعديل الأدوار من صفحة إدارة المستخدمين

### تعديل الصلاحيات:
افتح `src/App.tsx` وعدل `allowedRoles`:
```tsx
<ProtectedRoute allowedRoles={['admin', 'designer']}>
  <MyComponent />
</ProtectedRoute>
```

## استكشاف المشاكل الشائعة

### ❌ "البريد الإلكتروني غير مسجل"
- تأكد من إضافة المستخدم في Firebase Authentication

### ❌ "غير مصرح لك بالوصول"
- تحقق من إضافة document المستخدم في Firestore `users` collection
- تأكد من أن الـUID مطابق بين Authentication و Firestore

### ❌ "Permission denied" في Firestore
- تأكد من نشر Rules الجديدة: `firebase deploy --only firestore:rules`
- تحقق من وجود `users` document للمستخدم

### ❌ صفحة بيضاء أو خطأ
- افتح Console المتصفح (F12)
- تحقق من رسائل الخطأ
- تأكد من تشغيل Firebase بشكل صحيح

## نصائح الأمان 🔒

1. ✅ **غير كلمات المرور الافتراضية فوراً**
2. ✅ استخدم كلمات مرور قوية في الإنتاج
3. ✅ لا تشارك بيانات اعتماد المدير
4. ✅ فعل 2FA في Firebase Console
5. ✅ راجع Firestore Rules بانتظام

## الملفات المهمة 📁

```
src/
├── contexts/AuthContext.tsx          # Context المصادقة
├── components/ProtectedRoute.tsx     # حماية المسارات
├── pages/Auth/
│   ├── Login.tsx                     # صفحة تسجيل الدخول
│   └── UserManagement.tsx            # إدارة المستخدمين
└── utils/createInitialUsers.ts       # سكريبت إنشاء مستخدمين

firestore.rules                        # قواعد الأمان
```

## ما التالي؟ 🎯

- [ ] أضف صفحة استعادة كلمة المرور
- [ ] أضف صفحة تسجيل مستخدمين جدد
- [ ] أضف صفحة الملف الشخصي
- [ ] فعل تسجيل الدخول بـGoogle
- [ ] أضف Activity Log

## المساعدة 💬

راجع `AUTHENTICATION_GUIDE.md` للتفاصيل الكاملة

---

**جاهز للعمل! 🎉**

