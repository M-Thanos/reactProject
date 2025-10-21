import React, { useState } from 'react';
// @ts-ignore
import { createInitialUsers } from '../../utils/createInitialUsers';

interface SetupResult {
  success: string[];
  failed: { email: string; error: string }[];
} 

const InitialSetup: React.FC = () => {
  const [results, setResults] = useState<SetupResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (!window.confirm('هل أنت متأكد من إنشاء المستخدمين الأوليين؟\nهذه العملية يجب أن تتم مرة واحدة فقط!')) {
      return;
    }

    setLoading(true);
    setResults(null); 

    try {
      const res = await createInitialUsers();
      setResults(res);
    } catch (error: any) {
      console.error('خطأ في الإعداد:', error);
      alert('حدث خطأ أثناء إنشاء المستخدمين: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-boxdark-2 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white dark:bg-boxdark rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              إعداد النظام الأولي
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              إنشاء المستخدمين التجريبيين للنظام
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-1">
                  تحذير مهم
                </h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1">
                  <li>هذه الصفحة للاستخدام لمرة واحدة فقط</li>
                  <li>احذف هذه الصفحة بعد الانتهاء من الإعداد</li>
                  <li>غير كلمات المرور الافتراضية فوراً</li>
                  <li>لا تترك هذه الصفحة متاحة في الإنتاج</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Users Info */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              المستخدمين التي سيتم إنشاؤها:
            </h2>
            <div className="space-y-4">
              {/* Admin */}
              <div className="border border-stroke dark:border-strokedark rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">مدير (Admin)</h3>
                  <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 text-xs font-medium rounded-full">
                    صلاحيات كاملة
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>📧 admin@example.com</p>
                  <p>🔑 admin123</p>
                </div>
              </div>

              {/* Designer */}
              <div className="border border-stroke dark:border-strokedark rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">مصمم (Designer)</h3>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 text-xs font-medium rounded-full">
                    إدارة المحتوى
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>📧 designer@example.com</p>
                  <p>🔑 designer123</p>
                </div>
              </div>

              {/* User */}
              <div className="border border-stroke dark:border-strokedark rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">مستخدم (User)</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 text-xs font-medium rounded-full">
                    قراءة فقط
                  </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <p>📧 user@example.com</p>
                  <p>🔑 user123</p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Button */}
          <div className="text-center mb-6">
            <button
              onClick={handleSetup}
              disabled={loading || (results !== null && results.success.length > 0)}
              className="px-8 py-3 bg-primary text-white font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري إنشاء المستخدمين...
                </span>
              ) : results !== null && results.success.length > 0 ? (
                'تم الإنشاء بنجاح ✓'
              ) : (
                'إنشاء المستخدمين'
              )}
            </button>
          </div>

          {/* Results */}
          {results && (
            <div className="border-t border-stroke dark:border-strokedark pt-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                النتائج:
              </h2>
              
              {/* Success */}
              {results.success.length > 0 && (
                <div className="mb-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <h3 className="text-green-800 dark:text-green-300 font-medium mb-2">
                      ✅ نجح ({results.success.length})
                    </h3>
                    <ul className="text-sm text-green-700 dark:text-green-400 space-y-1">
                      {results.success.map((email) => (
                        <li key={email}>{email}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Failed */}
              {results.failed.length > 0 && (
                <div>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">
                      ❌ فشل ({results.failed.length})
                    </h3>
                    <ul className="text-sm text-red-700 dark:text-red-400 space-y-2">
                      {results.failed.map((item) => (
                        <li key={item.email}>
                          <span className="font-medium">{item.email}</span>
                          <br />
                          <span className="text-xs">{item.error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Next Steps */}
              {results.success.length > 0 && (
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="text-blue-800 dark:text-blue-300 font-medium mb-2">
                    الخطوات التالية:
                  </h3>
                  <ol className="text-sm text-blue-700 dark:text-blue-400 list-decimal list-inside space-y-1">
                    <li>احذف ملف src/pages/Setup/InitialSetup.tsx</li>
                    <li>احذف src/utils/createInitialUsers.ts</li>
                    <li>أزل route /setup من App.tsx</li>
                    <li>غير كلمات المرور من Firebase Console</li>
                    <li>انشر Firestore Rules: firebase deploy --only firestore:rules</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>في حالة الفشل، يمكنك إنشاء المستخدمين يدوياً من Firebase Console</p>
          <p className="mt-2">راجع ملف QUICK_START_AUTH.md للمزيد من التفاصيل</p>
        </div>
      </div>
    </div>
  );
};

export default InitialSetup;

