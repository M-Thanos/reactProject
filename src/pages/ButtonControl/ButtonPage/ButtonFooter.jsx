import React, { useState, useRef, useEffect } from 'react';
import { GiMove } from 'react-icons/gi';
import { FaPlus } from 'react-icons/fa';
import { FaPenToSquare } from 'react-icons/fa6';
import { AiOutlineFullscreen } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import { FaFile } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import axios from 'axios';

const ButtonFooter = ({
  handleRenameClick,
  selectedButton,
  updateButton,
  setSelectedButton,
  pages,
  setShowPagePopup,
  updateButtonInAPI,
  handleFooterAction,
  addMedia,
  addStandaloneMedia,
  changeShape,
  handleShapeChange,
  handleFileUpload,
  showControls,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showShapePopup, setShowShapePopup] = useState(false);
  const [selectedActionType, setSelectedActionType] = useState(
    selectedButton?.shape_details?.action?.type || 'none',
  );
  const [previewColors, setPreviewColors] = useState({
    backgroundColor:
      selectedButton?.shape_details?.backgroundColor || '#ffffff',
    textColor: selectedButton?.shape_details?.textColor || '#000000',
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    setActionId(selectedButton?.shape_details?.action?.id);
  }, [selectedButton]);

  const dropdownRef = useRef(null); // Reference to the dropdown

  const toggleShowMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowMenu(false); // Close the dropdown if clicked outside
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    if (selectedButton?.shape_details) {
      setSelectedActionType(
        selectedButton.shape_details.action?.type || 'none',
      );
    }
  }, [selectedButton]);

  const exportToExcel = () => {
    if (!selectedButton) {
      alert('من فضلك اختر زرًا');
      return;
    }
    const data = [
      {
        اسم: selectedButton.name,
        ارتفاع: selectedButton.height,
        أعمدة: selectedButton.columns,
      },
    ];
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Buttons');
    XLSX.writeFile(workbook, 'buttons_data.xlsx');

    alert('تم التصدير بنجاح');
    setSelectedButton(null);
  };

  const switchToPage = () => {
    if (!selectedButton) {
      alert('من فضلك اختر زرًا');
      return;
    }
    setShowPagePopup(true);
  };

  const handleActionTypeChange = (e) => {
    const newType = e.target.value;
    setSelectedActionType(newType);

    // Reset all file-related states
    setSelectedFile(null);
    setPreviewUrl('');

    // Clear file input
    if (document.querySelector('input[type="file"]')) {
      document.querySelector('input[type="file"]').value = '';
    }

    // تحديث البيانات في الزر بنفس شكل الـ API
    if (selectedButton && selectedButton.id) {
      const updatedButton = {
        ...selectedButton,
        shape_details: {
          ...selectedButton.shape_details,
          action: {
            id: selectedButton?.shape_details?.action?.id,
            type: newType,
            target_page: null,
            media_url: null,
            media_type: null,
            file_url: null,
            file_name: null,
            file_type: null,
          },
        },
      };

      updateButton(selectedButton.id, updatedButton);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedMimeTypes = {
        'application/pdf': '.pdf',
        'application/msword': '.doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          '.docx',
        'text/plain': '.txt',
        'application/vnd.ms-excel': '.xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
          '.xlsx',
        'application/vnd.ms-powerpoint': '.ppt',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation':
          '.pptx',
        'application/zip': '.zip',
        'application/x-rar-compressed': '.rar',
        'application/x-zip-compressed': '.zip',
        'application/octet-stream': '.rar',
      };

      const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        e.target.value = '';
        toast.error('لا يمكن رفع الصور أو الفيديوهات في قسم الملفات');
        return;
      }

      const isValidMimeType = Object.keys(allowedMimeTypes).includes(file.type);
      const isValidExtension =
        Object.values(allowedMimeTypes).includes(fileExtension);

      if (!isValidMimeType || !isValidExtension) {
        e.target.value = '';
        toast.error('نوع الملف غير مسموح به');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        e.target.value = '';
        toast.error('حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت');
        return;
      }

      setSelectedFile(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);

      // تحديث البيانات في الزر بنفس شكل الـ API
      const updatedButton = {
        ...selectedButton,
        shape_details: {
          ...selectedButton.shape_details,
          action: {
            id: selectedButton?.shape_details?.action?.id,
            type: 'file',
            target_page: null,
            media_url: null,
            media_type: null,
            file_url: fileUrl,
            file_name: file.name,
            file_type: file.type,
          },
        },
      };

      updateButton(selectedButton.id, updatedButton);
    }
  };

  // دالة منفصلة للتعامل مع الوسائط (صور وفيديو)
  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      const isAudio = file.type.startsWith('audio/');

      // التحقق من نوع الوسائط
      if (!isImage && !isVideo && !isAudio) {
        e.target.value = '';
        toast.error('يرجى اختيار صورة أو فيديو أو ملف صوتي فقط');
        return;
      }

      // التحقق من حجم الملف
      const maxSize = isImage
        ? 5 * 1024 * 1024
        : isVideo
        ? 50 * 1024 * 1024
        : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        e.target.value = '';
        toast.error(
          `حجم الملف كبير جداً. الحد الأقصى هو ${
            maxSize / (1024 * 1024)
          } ميجابايت`,
        );
        return;
      }

      setSelectedFile(file);
      const mediaUrl = URL.createObjectURL(file);
      setPreviewUrl(mediaUrl);

      // تحديث البيانات في الزر بنفس شكل الـ API
      const updatedButton = {
        ...selectedButton,
        shape_details: {
          ...selectedButton.shape_details,
          action: {
            id: selectedButton?.shape_details?.action?.id,
            type: 'media',
            target_page: null,
            media_url: mediaUrl,
            media_type: isImage ? 'image' : isVideo ? 'video' : 'audio',
            file_url: null,
            file_name: null,
            file_type: null,
          },
        },
      };

      updateButton(selectedButton.id, updatedButton);
    }
  };

  // console.log(actionId);

  const handleShapeSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      const updatedData = {
        type: 'shape',
        target_page: '',
        media: '',
        media_type: '',
        file: '',
        shape_details: {
          background_color: formData.get('backgroundColor') || '',
          text_color: formData.get('textColor') || '#000',
          text: formData.get('text') || 'Click me',
          font_size: formData.get('fontSize') || 16,
          border_radius: formData.get('borderRadius') || 0,
          type: '',
          action: {
            id: actionId,
            type: formData.get('actionType') || 'page',
            target_page: formData.get('targetPageId') || '',
            media_url: null,
            media_type: '',
            file_url: null,
            file_name: '',
            file_type: '',
          },
        },
        // حفظ الخصائص الافتراضية
        color: selectedButton.color || '',
        text_color: selectedButton.text_color || ''
      };

      if (selectedButton && selectedButton.id) {
        await updateButtonInAPI(selectedButton.id, updatedData);
        handleShapeChange({ shape_details: updatedData.shape_details });
        setShowShapePopup(false);
        toast.success('تم حفظ التغييرات بنجاح');
      } else {
        toast.error('لم يتم اختيار زر للتحديث');
      }
    } catch (error) {
      console.error('Error updating button:', error);
      toast.error('حدث خطأ أثناء حفظ التغييرات');
    }
  };

  const handleShapeClick = () => {
    if (selectedButton) {
      setShowShapePopup(true);
    } else {
      toast.warning('من فضلك اختر زرًا!');
    }
  };

  const buttons = [
    {
      id: 1,
      name: 'إضافة ملف',
      icon: <FaFile />,
      action: handleFileUpload,
    },
    {
      id: 2,
      name: 'إضافة وسائط مستقلة',
      icon: <FaPlus />,
      action: addStandaloneMedia,
      className: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    },
    {
      id: 3,
      name: 'دمج وسائط مع زر',
      icon: <GiMove />,
      action: addMedia,
    },
    {
      id: 4,
      name: 'تحويل شكل جديد',
      icon: <FaPenToSquare />,
      action: handleShapeClick,
    },
    {
      id: 5,
      name: 'تحويل صفحه جديده',
      icon: <AiOutlineFullscreen />,
      action: switchToPage,
    },
  ];

  // Add states for form data
  const [formData, setFormData] = useState({
    backgroundColor:
      selectedButton?.shape_details?.background_color || '#ffffff',
    textColor: selectedButton?.shape_details?.text_color || '#000000',
    text: selectedButton?.shape_details?.text || '',
    fontSize: selectedButton?.shape_details?.font_size || '',
    borderRadius: selectedButton?.shape_details?.border_radius || '0',
    actionType: selectedButton?.shape_details?.action?.type || 'none',
  });

  // Update form data when selected button changes
  useEffect(() => {
    if (selectedButton?.shape_details) {
      setFormData({
        backgroundColor:
          selectedButton.shape_details.background_color || '#ffffff',
        textColor: selectedButton.shape_details.text_color || '#000000',
        text: selectedButton.shape_details.text || '',
        fontSize: selectedButton.shape_details.font_size || '',
        borderRadius: selectedButton.shape_details.border_radius || '0',
        actionType: selectedButton.shape_details.action?.type || 'none',
      });
      setSelectedActionType(
        selectedButton.shape_details.action?.type || 'none',
      );
    }
  }, [selectedButton]);

  const handleShapePopup = () => {
    setShowShapePopup(true);
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 text-white p-4 flex justify-between w-full items-center shadow-lg shadow-gray-500/50 dark:shadow-none">
        <div className="container mx-auto xl:flex items-center justify-end gap-8 2xsm:hidden ">
          <ul className="flex gap-4">
            {buttons.map((button, index) => (
              <li key={index}>
                <button
                  onClick={button.action}
                  className={`flex items-center gap-2 px-4 py-2 rounded text-white transition-all ${
                    button.className || 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  title={button.name}
                >
                  {button.icon} {button.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative" ref={dropdownRef}>
          <div className="xl:hidden flex items-center justify-end gap-2">
            <button
              onClick={toggleShowMenu}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              الوظائف
            </button>
            {/* <button
              onClick={changeShape}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              تغير الشكل
            </button> */}
          </div>

          {showMenu && (
            <div className="xl:hidden lg:flex z-10 absolute left-0 mt-8 bg-white divide-y divide-gray-100 rounded-lg shadow w-64">
              <ul className="py-2 text-sm text-gray-700">
                {buttons.map((button, index) => (
                  <li className="p-2" key={index}>
                    <button
                      onClick={button.action}
                      className={`flex items-center gap-2 px-4 py-2 rounded w-full text-right ${
                        button.className 
                          ? `${button.className} text-white` 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {button.icon} {button.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </nav>

      {showShapePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99999]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-right">
              تعديل شكل الزر
            </h2>

            <form onSubmit={handleShapeSubmit} className="space-y-4">
              {/* لون الخلفية */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="backgroundColor"
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        backgroundColor: e.target.value,
                      })
                    }
                    className="w-8 h-8"
                  />
                  <input
                    type="text"
                    value={formData.backgroundColor}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        backgroundColor: e.target.value,
                      })
                    }
                    className="border p-2 w-full"
                  />
                </div>
                <label className="font-bold">لون الخلفية</label>
              </div>

              {/* لون النص */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    name="textColor"
                    value={formData.textColor}
                    onChange={(e) =>
                      setFormData({ ...formData, textColor: e.target.value })
                    }
                    className="w-8 h-8"
                  />
                  <button
                    type="button"
                    className="bg-black text-white px-4 py-2 rounded"
                    onClick={() => {
                      /* معاينة اللون */
                    }}
                  >
                    معاينة اللون
                  </button>
                </div>
                <label className="font-bold">لون النص</label>
              </div>

              {/* معاينة النص واللون */}
              <div
                className="border p-4 rounded"
                style={{
                  backgroundColor: formData.backgroundColor,
                  color: formData.textColor,
                }}
              >
                <div className="text-center">معاينة النص واللون</div>
                <div className="text-center">{formData.text || 'النص'}</div>
              </div>

              {/* النص */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-right">النص</label>
                <input
                  type="text"
                  name="text"
                  value={formData.text}
                  onChange={(e) =>
                    setFormData({ ...formData, text: e.target.value })
                  }
                  placeholder="أدخل النص"
                  className="border p-2 w-full"
                />
              </div>

              {/* حجم النص */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-right">حجم النص</label>
                <input
                  type="number"
                  name="fontSize"
                  value={formData.fontSize}
                  onChange={(e) =>
                    setFormData({ ...formData, fontSize: e.target.value })
                  }
                  className="border p-2"
                />
              </div>

              {/* حواف الزر */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-right">حواف الزر</label>
                <input
                  type="text"
                  name="borderRadius"
                  value={formData.borderRadius}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      borderRadius: e.target.value || '0',
                    })
                  }
                  className="border p-2"
                  defaultValue="0"
                />
              </div>

              {/* الوظيفة */}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-right">الوظيفة</label>
                <select
                  name="actionType"
                  value={selectedActionType}
                  onChange={handleActionTypeChange}
                  className="border p-2"
                >
                  <option value="none">بدون</option>
                  <option value="page">الانتقال إلى صفحة</option>
                  <option value="media">عرض صورة/فيديو</option>
                  <option value="file">عرض ملف</option>
                </select>
              </div>

              {selectedActionType === 'page' && (
                <div>
                  <label className="block text-gray-700 mb-2">
                    اختر الصفحة
                  </label>
                  <select
                    name="targetPageId"
                    className="w-full p-2 border rounded"
                    defaultValue={
                      selectedButton?.shapeDetails?.action?.targetPage
                        ? pages.find(
                            (page) =>
                              page.name ===
                              selectedButton.shapeDetails.action.targetPage,
                          )?.id
                        : ''
                    }
                  >
                    <option value="" disabled>
                      اختر صفحة
                    </option>
                    {pages.map((page) => (
                      <option key={page.id} value={String(page.id)}>
                        {page.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* File upload section */}
              {(selectedActionType === 'media' ||
                selectedActionType === 'file') && (
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-right">
                    {selectedActionType === 'media'
                      ? 'اختر ملف الوسائط'
                      : 'اختر ملف'}
                  </label>
                  <input
                    type="file"
                    onChange={
                      selectedActionType === 'media'
                        ? handleMediaSelect
                        : handleFileSelect
                    }
                    className="border p-2"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  حفظ التغييرات
                </button>
                <button
                  type="button"
                  onClick={() => setShowShapePopup(false)}
                  className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonFooter;
