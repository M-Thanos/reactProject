import React from 'react';

const LinkButtonsModal = ({ pages, selectedButton, onLinkButton, onClose }) => {
  if (!selectedButton) {
    return null;
  }

  // الحصول على الصفحة التي يتبع لها الزر المحدد
  const selectedButtonPage = pages.find(page => 
    page.buttons.some(button => button.id === selectedButton.id)
  );

  // الحصول على جميع الأزرار المتاحة للربط
  const availableButtons = pages
    .flatMap((page) => page.buttons.map(button => ({
      ...button,
      pageName: page.name, // إضافة اسم الصفحة لكل زر
      pageId: page.id
    })))
    .filter((button) => 
      button && 
      button.id !== selectedButton.id && 
      !button.linked_buttons &&
      !pages.flatMap(p => p.buttons).some(b => b.linked_buttons === button.id)
    );

  // الحصول على الزر المرتبط حالياً (إن وجد)
  const currentLinkedButton = pages
    .flatMap((page) => page.buttons)
    .find((button) => button.id === selectedButton.linked_buttons);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999999]">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full overflow-auto h-[90vh]">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          اختر زراً للربط
        </h2>
        
        {/* عرض معلومات الزر المحدد */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">الزر المحدد:</p>
          <div className="flex flex-col gap-1">
            <span className="font-bold">{selectedButton.name}</span>
            <span className="text-sm text-gray-500">
              الصفحة: {selectedButtonPage?.name || 'غير معروف'}
            </span>
          </div>
        </div>
        
        {/* عرض الزر المرتبط حالياً */}
        {currentLinkedButton && (
          <div className="mb-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">الزر المرتبط حالياً:</p>
            <div className="flex justify-between items-center">
              <div className="flex flex-col gap-1">
                <span className="font-bold">{currentLinkedButton.name}</span>
                <span className="text-sm text-gray-500">
                  الصفحة: {pages.find(p => p.buttons.includes(currentLinkedButton))?.name || 'غير معروف'}
                </span>
              </div>
              <button
                onClick={() => {
                  onLinkButton(null);
                  onClose();
                }}
                className="text-red-500 hover:text-red-600"
              >
                إلغاء الربط
              </button>
            </div>
          </div>
        )}

        {/* قائمة الأزرار المتاحة */}
        {availableButtons.length > 0 ? (
          <div className="space-y-2">
            {availableButtons.map((button) => (
              <button
                key={button.id}
                onClick={() => {
                  onLinkButton(button.id);
                  onClose();
                }}
                className="w-full text-right p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                <div className="flex flex-col gap-1">
                  <span>{button.name}</span>
                  <span className="text-sm text-gray-500">
                    الصفحة: {button.pageName}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            {currentLinkedButton ? "لا توجد أزرار أخرى متاحة للربط" : "لا توجد أزرار متاحة للربط"}
          </p>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg"
        >
          إغلاق
        </button>
      </div>
    </div>
  );
};

export default LinkButtonsModal;