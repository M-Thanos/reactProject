import React, { useState } from 'react';
import Button from '../components/Button';

// Icons
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 13L6 9H8V4H12V9H14L10 13Z" fill="currentColor"/>
    <path d="M4 16V14H16V16H4Z" fill="currentColor"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 2C5.13 2 2 5.13 2 9C2 12.87 5.13 16 9 16C10.57 16 12.03 15.43 13.2 14.5L16.29 17.59L17.71 16.17L14.61 13.07C15.54 11.9 16.11 10.44 16.11 8.89C16.11 5.02 12.98 1.89 9.11 1.89L9 2ZM9 4C11.87 4 14.22 6.35 14.22 9.22C14.22 12.09 11.87 14.44 9 14.44C6.13 14.44 3.78 12.09 3.78 9.22C3.78 6.35 6.13 4 9 4Z" fill="currentColor"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 9V4H11V9H16V11H11V16H9V11H4V9H9Z" fill="currentColor"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18L8.55 16.7C4.4 13 1.75 10.6 1.75 7.75C1.75 5.35 3.65 3.5 6 3.5C7.38 3.5 8.71 4.15 9.625 5.19C10.54 4.15 11.87 3.5 13.25 3.5C15.6 3.5 17.5 5.35 17.5 7.75C17.5 10.6 14.85 13 10.7 16.7L10 18Z" fill="currentColor"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3V4H3V6H4V16C4 17.1 4.9 18 6 18H14C15.1 18 16 17.1 16 16V6H17V4H13V3H7ZM6 6H14V16H6V6ZM8 8V14H10V8H8ZM11 8V14H13V8H11Z" fill="currentColor"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 13.5L4 10L2.6 11.4L7.5 16.3L17.5 6.3L16.1 4.9L7.5 13.5Z" fill="currentColor"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 4L8.6 5.4L13.2 10L8.6 14.6L10 16L16 10L10 4Z" fill="currentColor"/>
  </svg>
);

const ButtonShowcase: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleLoadingClick = (id: string) => {
    setLoadingStates(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [id]: false }));
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-boxdark-2 dark:to-boxdark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            نظام الأزرار الاحترافي
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            تصميم عصري مستوحى من Figma مع تأثيرات متقدمة
          </p>
        </div>

        {/* Variants Section */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">الأنماط المختلفة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="gradient">Gradient</Button>
          </div>
        </div>

        {/* Sizes Section */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">الأحجام المختلفة</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="xs">Extra Small</Button>
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">Extra Large</Button>
          </div>
        </div>

        {/* With Icons Section */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">أزرار مع أيقونات</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="primary" leftIcon={<DownloadIcon />}>
              تحميل الملف
            </Button>
            <Button variant="secondary" leftIcon={<SearchIcon />}>
              بحث
            </Button>
            <Button variant="success" leftIcon={<PlusIcon />}>
              إضافة جديد
            </Button>
            <Button variant="danger" leftIcon={<TrashIcon />}>
              حذف
            </Button>
            <Button variant="outline" rightIcon={<ArrowRightIcon />}>
              التالي
            </Button>
            <Button variant="gradient" leftIcon={<HeartIcon />}>
              إعجاب
            </Button>
          </div>
        </div>

        {/* Loading States Section */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">حالات التحميل</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              variant="primary" 
              loading={loadingStates.loading1}
              onClick={() => handleLoadingClick('loading1')}
            >
              حفظ
            </Button>
            <Button 
              variant="success" 
              loading={loadingStates.loading2}
              onClick={() => handleLoadingClick('loading2')}
            >
              إرسال
            </Button>
            <Button 
              variant="gradient" 
              loading={loadingStates.loading3}
              onClick={() => handleLoadingClick('loading3')}
            >
              معالجة
            </Button>
          </div>
        </div>

        {/* Disabled States Section */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">الحالة المعطلة</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="primary" disabled>Primary</Button>
            <Button variant="secondary" disabled>Secondary</Button>
            <Button variant="outline" disabled>Outline</Button>
            <Button variant="danger" disabled>Danger</Button>
          </div>
        </div>

        {/* Full Width Section */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">العرض الكامل</h2>
          <div className="space-y-4">
            <Button variant="primary" fullWidth leftIcon={<CheckIcon />}>
              تأكيد الطلب
            </Button>
            <Button variant="gradient" fullWidth leftIcon={<DownloadIcon />}>
              تحميل جميع الملفات
            </Button>
            <Button variant="outline" fullWidth>
              إلغاء
            </Button>
          </div>
        </div>

        {/* Action Examples */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">أمثلة عملية</h2>
          
          {/* Login Form Example */}
          <div className="mb-8 p-6 bg-gray-50 dark:bg-boxdark-2 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">نموذج تسجيل دخول</h3>
            <div className="space-y-3">
              <Button variant="primary" fullWidth size="lg">
                تسجيل الدخول
              </Button>
              <Button variant="outline" fullWidth>
                تسجيل حساب جديد
              </Button>
              <Button variant="ghost" fullWidth size="sm">
                نسيت كلمة المرور؟
              </Button>
            </div>
          </div>

          {/* Action Bar Example */}
          <div className="p-6 bg-gray-50 dark:bg-boxdark-2 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">شريط الإجراءات</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="success" leftIcon={<CheckIcon />}>
                موافق
              </Button>
              <Button variant="danger" leftIcon={<TrashIcon />}>
                حذف
              </Button>
              <Button variant="secondary">
                تعديل
              </Button>
              <Button variant="ghost">
                إلغاء
              </Button>
            </div>
          </div>
        </div>

        {/* Code Example */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">مثال على الاستخدام</h2>
          <div className="bg-gray-900 rounded-lg p-6 overflow-x-auto">
            <pre className="text-green-400 text-sm font-mono" dir="ltr">
{`import Button from './components/Button';

// استخدام بسيط
<Button variant="primary">انقر هنا</Button>

// مع أيقونة
<Button 
  variant="success" 
  leftIcon={<CheckIcon />}
>
  حفظ
</Button>

// حالة تحميل
<Button 
  variant="primary" 
  loading={isLoading}
  onClick={handleSubmit}
>
  إرسال
</Button>

// عرض كامل
<Button 
  variant="gradient" 
  fullWidth
  size="lg"
>
  ابدأ الآن
</Button>`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ButtonShowcase;

