import React, { useState } from 'react';
import { toast } from 'react-toastify';

export default function ColorForm({
  setShowColorPicker,
  updateButton,
  selectedButton,
  setSelectedButton,
  onClose,
}) {
  const originalBackgroundColor = selectedButton.color || '#2563eb';
  const originalTextColor = selectedButton.text_color || '#000000';

  const [tempBackgroundColor, setTempBackgroundColor] = useState(
    originalBackgroundColor,
  );
  const [tempTextColor, setTempTextColor] = useState(originalTextColor);

  const handleBackgroundColorChange = (e) => {
    setTempBackgroundColor(e.target.value);
  };

  const handleTextColorChange = (e) => {
    setTempTextColor(e.target.value);
  };

  const handleCancel = () => {
    updateButton(selectedButton?.id, {
      color: originalBackgroundColor,
      background_color: originalBackgroundColor, // إضافة background_color للتأكد
      text_color: originalTextColor,
    });
    onClose();
  };

  const handleConfirm = async () => {
    try {
      console.log('🎨 Updating button colors:', {
        buttonId: selectedButton?.id,
        background_color: tempBackgroundColor,
        text_color: tempTextColor
      });
      
      await updateButton(selectedButton?.id, {
        color: tempBackgroundColor,
        background_color: tempBackgroundColor, // إضافة background_color للتأكد
        text_color: tempTextColor,
      });
      
      console.log('✅ Button colors updated successfully');
      toast.success('تم تحديث ألوان الزر بنجاح');
      onClose();
      setSelectedButton(null);
    } catch (error) {
      console.error('❌ Error updating button colors:', error);
      toast.error('حدث خطأ أثناء تحديث ألوان الزر');
    }
  };

  return (
    <div className="w-full absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9998]">
      <div className="bg-white dark:bg-gray-800 p-5 rounded shadow-lg w-[30%]">
        <h2 className="text-lg font-bold mb-4">تخصيص الألوان</h2>
        <div className="space-y-4">
          {/* لون الخلفية */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              لون خلفية الزر
            </label>
            <div className="flex items-center gap-3">
              <input
                className="text-right text-black dark:text-white dark:bg-gray-800 font-semibold w-full p-1 border rounded"
                type="text"
                value={tempBackgroundColor}
                onChange={handleBackgroundColorChange}
              />
              <input
                type="color"
                className="p-1 h-10 w-full block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                value={tempBackgroundColor}
                onChange={handleBackgroundColorChange}
              />
            </div>
          </div>

          {/* لون النص */}
          <div>
            <label className="block text-sm font-medium mb-2 dark:text-white">
              لون النص
            </label>
            <div className="flex items-center gap-3">
              <input
                className="text-right text-black dark:text-white dark:bg-gray-800 font-semibold w-full p-1 border rounded"
                type="text"
                value={tempTextColor}
                onChange={handleTextColorChange}
              />
              <input
                type="color"
                className="p-1 h-10 w-full block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700"
                value={tempTextColor}
                onChange={handleTextColorChange}
              />
            </div>
          </div>

          {/* معاينة */}
          <div className="mt-4 p-4 rounded border">
            <label className="block text-sm font-medium mb-2 dark:text-white">
              معاينة
            </label>
            <div
              className="p-4 rounded text-center"
              style={{
                backgroundColor: tempBackgroundColor,
                color: tempTextColor,
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: '500'
              }}
            >
              {selectedButton?.name || 'نص تجريبي'}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              لون الخلفية: {tempBackgroundColor} | لون النص: {tempTextColor}
            </p>
          </div>

          <div className="flex justify-between mt-4">
            <button
              onClick={handleCancel}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              إلغاء
            </button>
            <button
              onClick={handleConfirm}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              تأكيد
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
