import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const NewPageForm = ({ onSubmit, onClose }) => {
  const [pageName, setPageName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pageName.trim()) {
      onSubmit(pageName);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-99999">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-96 relative">
        {/* زر الإغلاق */}
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <FaTimes />
        </button>

        {/* العنوان */}
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-6 text-center">
          إضافة صفحة جديدة
        </h2>

        {/* النموذج */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="pageName" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              اسم الصفحة
            </label>
            <input
              type="text"
              id="pageName"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="أدخل اسم الصفحة"
              autoFocus
            />
          </div>

          {/* أزرار التحكم */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:hover:bg-blue-700"
              disabled={!pageName.trim()}
            >
              إضافة
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPageForm; 