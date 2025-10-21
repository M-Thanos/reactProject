import React, { useState } from 'react';
import Button from '../components/Button';
import ButtonGroup from '../components/Button/ButtonGroup';
import IconButton from '../components/Button/IconButton';

// Icons
const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.06 6.19L13.81 6.44L11.56 4.19L11.81 3.94C12.2 3.55 12.83 3.55 13.22 3.94L14.06 4.78C14.45 5.17 14.45 5.8 14.06 6.19ZM3 13.5L10.81 5.69L13.06 7.94L5.25 15.75H3V13.5Z" fill="currentColor"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 3V4H3V6H4V16C4 17.1 4.9 18 6 18H14C15.1 18 16 17.1 16 16V6H17V4H13V3H7ZM6 6H14V16H6V6ZM8 8V14H10V8H8ZM11 8V14H13V8H11Z" fill="currentColor"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.95 10.78C15.98 10.52 16 10.26 16 10C16 9.74 15.98 9.48 15.95 9.22L17.63 7.93C17.78 7.81 17.82 7.6 17.72 7.43L16.14 4.57C16.04 4.4 15.83 4.34 15.66 4.41L13.68 5.21C13.26 4.88 12.81 4.6 12.31 4.37L12 2.25C11.97 2.06 11.81 1.92 11.62 1.92H8.38C8.19 1.92 8.03 2.06 8 2.25L7.69 4.37C7.19 4.6 6.74 4.89 6.32 5.21L4.34 4.41C4.17 4.33 3.96 4.4 3.86 4.57L2.28 7.43C2.17 7.6 2.22 7.81 2.37 7.93L4.05 9.22C4.02 9.48 4 9.74 4 10C4 10.26 4.02 10.52 4.05 10.78L2.37 12.07C2.22 12.19 2.18 12.4 2.28 12.57L3.86 15.43C3.96 15.6 4.17 15.66 4.34 15.59L6.32 14.79C6.74 15.12 7.19 15.4 7.69 15.63L8 17.75C8.03 17.94 8.19 18.08 8.38 18.08H11.62C11.81 18.08 11.97 17.94 12 17.75L12.31 15.63C12.81 15.4 13.26 15.11 13.68 14.79L15.66 15.59C15.83 15.67 16.04 15.6 16.14 15.43L17.72 12.57C17.82 12.4 17.78 12.19 17.63 12.07L15.95 10.78ZM10 13C8.34 13 7 11.66 7 10C7 8.34 8.34 7 10 7C11.66 7 13 8.34 13 10C13 11.66 11.66 13 10 13Z" fill="currentColor"/>
  </svg>
);

const ShareIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 14.08C14.24 14.08 13.56 14.38 13.04 14.85L7.91 11.7C7.96 11.47 8 11.24 8 11C8 10.76 7.96 10.53 7.91 10.3L12.96 7.19C13.5 7.69 14.21 8 15 8C16.66 8 18 6.66 18 5C18 3.34 16.66 2 15 2C13.34 2 12 3.34 12 5C12 5.24 12.04 5.47 12.09 5.7L7.04 8.81C6.5 8.31 5.79 8 5 8C3.34 8 2 9.34 2 11C2 12.66 3.34 14 5 14C5.79 14 6.5 13.69 7.04 13.19L12.16 16.35C12.11 16.56 12.08 16.78 12.08 17C12.08 18.61 13.39 19.92 15 19.92C16.61 19.92 17.92 18.61 17.92 17C17.92 15.39 16.61 14.08 15 14.08Z" fill="currentColor"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18L8.55 16.7C4.4 13 1.75 10.6 1.75 7.75C1.75 5.35 3.65 3.5 6 3.5C7.38 3.5 8.71 4.15 9.625 5.19C10.54 4.15 11.87 3.5 13.25 3.5C15.6 3.5 17.5 5.35 17.5 7.75C17.5 10.6 14.85 13 10.7 16.7L10 18Z" fill="currentColor"/>
  </svg>
);

const BookmarkIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 2C3.9 2 3 2.9 3 4V18L10 15L17 18V4C17 2.9 16.1 2 15 2H5Z" fill="currentColor"/>
  </svg>
);

const MoreIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 6C11.1 6 12 5.1 12 4C12 2.9 11.1 2 10 2C8.9 2 8 2.9 8 4C8 5.1 8.9 6 10 6ZM10 8C8.9 8 8 8.9 8 10C8 11.1 8.9 12 10 12C11.1 12 12 11.1 12 10C12 8.9 11.1 8 10 8ZM10 14C8.9 14 8 14.9 8 16C8 17.1 8.9 18 10 18C11.1 18 12 17.1 12 16C12 14.9 11.1 14 10 14Z" fill="currentColor"/>
  </svg>
);

const AdvancedButtonShowcase: React.FC = () => {
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [selectedView, setSelectedView] = useState('grid');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-boxdark-2 dark:to-boxdark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            أمثلة متقدمة للأزرار
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            ButtonGroups, IconButtons والمزيد
          </p>
        </div>

        {/* Button Groups - Horizontal */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">مجموعات أزرار أفقية</h2>
          
          <div className="space-y-6">
            {/* View Switcher */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">مبدل العرض</p>
              <ButtonGroup>
                <Button 
                  variant={selectedView === 'grid' ? 'primary' : 'outline'}
                  onClick={() => setSelectedView('grid')}
                >
                  شبكة
                </Button>
                <Button 
                  variant={selectedView === 'list' ? 'primary' : 'outline'}
                  onClick={() => setSelectedView('list')}
                >
                  قائمة
                </Button>
                <Button 
                  variant={selectedView === 'card' ? 'primary' : 'outline'}
                  onClick={() => setSelectedView('card')}
                >
                  بطاقات
                </Button>
              </ButtonGroup>
            </div>

            {/* Text Formatting */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">تنسيق النص</p>
              <ButtonGroup>
                <Button variant="outline" size="sm">عريض</Button>
                <Button variant="outline" size="sm">مائل</Button>
                <Button variant="outline" size="sm">تسطير</Button>
                <Button variant="outline" size="sm">يتوسطه خط</Button>
              </ButtonGroup>
            </div>

            {/* Color Picker */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">منتقي الألوان</p>
              <ButtonGroup>
                <Button variant="primary">أزرق</Button>
                <Button variant="success">أخضر</Button>
                <Button variant="danger">أحمر</Button>
                <Button variant="warning">برتقالي</Button>
                <Button variant="secondary">رمادي</Button>
              </ButtonGroup>
            </div>
          </div>
        </div>

        {/* Button Groups - Vertical */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">مجموعات أزرار عمودية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">قائمة إجراءات</p>
              <ButtonGroup vertical>
                <Button variant="outline" leftIcon={<EditIcon />}>تعديل</Button>
                <Button variant="outline" leftIcon={<ShareIcon />}>مشاركة</Button>
                <Button variant="outline" leftIcon={<DeleteIcon />}>حذف</Button>
              </ButtonGroup>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">أولويات المهام</p>
              <ButtonGroup vertical fullWidth>
                <Button variant="danger">عالية</Button>
                <Button variant="warning">متوسطة</Button>
                <Button variant="success">منخفضة</Button>
              </ButtonGroup>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">الحالة</p>
              <ButtonGroup vertical fullWidth>
                <Button variant="success">نشط</Button>
                <Button variant="secondary">معلق</Button>
                <Button variant="danger">موقوف</Button>
              </ButtonGroup>
            </div>
          </div>
        </div>

        {/* Icon Buttons */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">أزرار الأيقونات</h2>
          
          <div className="space-y-6">
            {/* Regular Icon Buttons */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">أزرار أيقونات عادية</p>
              <div className="flex flex-wrap gap-3">
                <IconButton variant="primary" icon={<EditIcon />} />
                <IconButton variant="secondary" icon={<DeleteIcon />} />
                <IconButton variant="success" icon={<ShareIcon />} />
                <IconButton variant="danger" icon={<DeleteIcon />} />
                <IconButton variant="outline" icon={<SettingsIcon />} />
                <IconButton variant="ghost" icon={<MoreIcon />} />
              </div>
            </div>

            {/* Rounded Icon Buttons */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">أزرار دائرية</p>
              <div className="flex flex-wrap gap-3">
                <IconButton variant="primary" icon={<EditIcon />} rounded />
                <IconButton variant="secondary" icon={<DeleteIcon />} rounded />
                <IconButton variant="success" icon={<ShareIcon />} rounded />
                <IconButton variant="danger" icon={<DeleteIcon />} rounded />
                <IconButton variant="outline" icon={<SettingsIcon />} rounded />
                <IconButton variant="ghost" icon={<MoreIcon />} rounded />
              </div>
            </div>

            {/* Sizes */}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">أحجام مختلفة</p>
              <div className="flex flex-wrap items-center gap-3">
                <IconButton variant="primary" icon={<SettingsIcon />} size="sm" />
                <IconButton variant="primary" icon={<SettingsIcon />} size="md" />
                <IconButton variant="primary" icon={<SettingsIcon />} size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Examples */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">أمثلة تفاعلية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Social Actions */}
            <div className="p-6 bg-gray-50 dark:bg-boxdark-2 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">إجراءات اجتماعية</h3>
              <div className="flex gap-3">
                <IconButton 
                  variant={liked ? "danger" : "outline"} 
                  icon={<HeartIcon />}
                  onClick={() => setLiked(!liked)}
                  rounded
                />
                <IconButton 
                  variant={bookmarked ? "warning" : "outline"} 
                  icon={<BookmarkIcon />}
                  onClick={() => setBookmarked(!bookmarked)}
                  rounded
                />
                <IconButton variant="outline" icon={<ShareIcon />} rounded />
              </div>
            </div>

            {/* Toolbar */}
            <div className="p-6 bg-gray-50 dark:bg-boxdark-2 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">شريط أدوات</h3>
              <div className="flex gap-2">
                <IconButton variant="ghost" icon={<EditIcon />} size="sm" />
                <IconButton variant="ghost" icon={<DeleteIcon />} size="sm" />
                <IconButton variant="ghost" icon={<ShareIcon />} size="sm" />
                <div className="flex-1" />
                <IconButton variant="ghost" icon={<SettingsIcon />} size="sm" />
                <IconButton variant="ghost" icon={<MoreIcon />} size="sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Real World Examples */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">أمثلة من الواقع</h2>
          
          <div className="space-y-8">
            {/* Card with Actions */}
            <div className="border border-gray-200 dark:border-strokedark rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">عنوان البطاقة</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">وصف قصير للبطاقة</p>
                </div>
                <IconButton variant="ghost" icon={<MoreIcon />} size="sm" />
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="primary" size="sm">عرض</Button>
                <Button variant="outline" size="sm" leftIcon={<EditIcon />}>تعديل</Button>
                <Button variant="ghost" size="sm" leftIcon={<ShareIcon />}>مشاركة</Button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border border-gray-200 dark:border-strokedark rounded-xl p-6 bg-gray-50 dark:bg-boxdark-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">تذييل نافذة منبثقة</h3>
              <div className="flex justify-end gap-3">
                <Button variant="ghost">إلغاء</Button>
                <Button variant="primary">حفظ التغييرات</Button>
              </div>
            </div>

            {/* Table Actions */}
            <div className="border border-gray-200 dark:border-strokedark rounded-xl overflow-hidden">
              <div className="p-4 bg-gray-50 dark:bg-boxdark-2 border-b border-gray-200 dark:border-strokedark">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">إجراءات الجدول</h3>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" leftIcon={<EditIcon />}>تحرير</Button>
                    <Button variant="outline" size="sm">معاينة</Button>
                  </div>
                  <div className="flex gap-2">
                    <IconButton variant="ghost" icon={<ShareIcon />} size="sm" />
                    <IconButton variant="danger" icon={<DeleteIcon />} size="sm" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedButtonShowcase;

