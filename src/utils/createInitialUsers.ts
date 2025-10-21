/**
 * سكريبت لإنشاء المستخدمين الأوليين
 * 
 * يمكنك استدعاء هذه الدالة من Console المتصفح أو إنشاء صفحة مؤقتة لتشغيلها
 * 
 * تحذير: هذا السكريبت للاستخدام لمرة واحدة فقط عند إعداد النظام
 */

// @ts-ignore
import { auth, db } from '../config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

interface UserToCreate {
  email: string;
  password: string;
  role: 'admin' | 'designer' | 'user';
  displayName: string;
}

const initialUsers: UserToCreate[] = [
  {
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin',
    displayName: 'المدير الرئيسي'
  },
  {
    email: 'designer@example.com',
    password: 'designer123',
    role: 'designer',
    displayName: 'المصمم'
  },
  {
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    displayName: 'مستخدم عادي'
  }
]; 

export async function createInitialUsers() {
  const results = {
    success: [] as string[],
    failed: [] as { email: string; error: string }[]
  };

  for (const userData of initialUsers) {
    try {
      console.log(`جاري إنشاء المستخدم: ${userData.email}...`);
      
      // إنشاء المستخدم في Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password
      );

      // إضافة بيانات المستخدم في Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName,
        createdAt: new Date().toISOString()
      });

      results.success.push(userData.email);
      console.log(`✅ تم إنشاء المستخدم بنجاح: ${userData.email}`);
    } catch (error: any) {
      results.failed.push({
        email: userData.email,
        error: error.message
      });
      console.error(`❌ فشل إنشاء المستخدم: ${userData.email}`, error.message);
    }
  }

  return results;
}

// تصدير للاستخدام المباشر من Console
if (typeof window !== 'undefined') {
  (window as any).createInitialUsers = createInitialUsers;
  console.log('✨ يمكنك الآن استخدام: await createInitialUsers()');
}

