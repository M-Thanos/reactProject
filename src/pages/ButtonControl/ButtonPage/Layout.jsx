import React, { useEffect, useState } from 'react';
import ButtonSidebar from './ButtonSidebar';
import ButtonNavbar from './ButtonNavbar';
import ButtonFooter from './ButtonFooter';
import ButtonArea from './ButtonArea';
import MeasurementForm from '../Form/MeasurementForm';
import Rename from '../Form/Rename';
import ColorForm from '../Form/ColorForm';
import { useButtonManagement } from './../../../hooks/useButtonManagement';
import ButtonLeftSidebar from './ButtonLeftSidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import NewPageForm from '../Form/NewPageForm';
import LinkButtonsModal from './Form/LinkButtonsModal';
import axios from 'axios';

export default function Layout() {
  const {
    pages,
    setPages,
    currentPageId,
    setCurrentPageId,
    selectedButton,
    setSelectedButton,
    updateButton,
  } = useButtonManagement();

  // إضافة state للأزرار
  const [buttons, setButtons] = useState([]);

  // إضافة useEffect لتحديث الأزرار عند تحميل الصفحة
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await axios.get(
          'https://buttons-back.cowdly.com/api/pages/',
        );
        setPages(response.data);
        // console.log(response.data);

        // تعيين الصفحة الأولى كصفحة افتراضية إذا لم تكن هناك صفحة حالية
        if (!currentPageId && response.data.length > 0) {
          setCurrentPageId(response.data[0].id);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        toast.error('حدث خطأ أثناء تحميل الصفحات');
      }
    };

    fetchPages();
  }, []);

  // تعريف fetchButtonPositions خارج useEffect
  const fetchButtonPositions = async () => {
    if (currentPageId) {
      try {
        const response = await axios.get(
          'https://buttons-back.cowdly.com/api/button-positions/'
        );
        
        const positionsData = {};
        response.data.forEach((position) => {
          const currentPage = pages.find(page => page.id === currentPageId);
          const buttonExists = currentPage?.buttons.some(btn => btn.id === position.button);
          
          if (buttonExists) {
            positionsData[position.button] = {
              x: position.x,
              y: position.y,
              id: position.id,
            };
          }
        });

        // تحديث المواقع في ButtonArea عبر props
        if (setPositions) {
          setPositions(positionsData);
        }
      } catch (error) {
        console.error('Error fetching button positions:', error);
        // toast.error('حدث خطأ أثناء تحميل مواقع الأزرار');
      }
    }
  };

  // تعديل handleSetButtons
  const handleSetButtons = (newButtons) => {
    setButtons(newButtons);
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === currentPageId ? { ...page, buttons: newButtons } : page,
      ),
    );
    
    // استدعاء fetchButtonPositions بعد تحديث الأزرار
    fetchButtonPositions();
  };

  // استخدام useEffect مع fetchButtonPositions
  useEffect(() => {
    fetchButtonPositions();
  }, [currentPageId, pages]);

  const API_URL = 'https://buttons-back.cowdly.com/api/pages/';
  const BUTTONS_API_URL = 'https://buttons-back.cowdly.com/api/buttons/';

  // UI States
  const [showButtonSidebar, setShowButtonSidebar] = useState(false);
  const [showButtonLeftSidebar, setShowButtonLeftSidebar] = useState(false);
  const [showMeasurementForm, setMeasurementForm] = useState(false);
  const [showRenameForm, setShowRenameForm] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showPagePopup, setShowPagePopup] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showNewPageForm, setShowNewPageForm] = useState(false);
  const [showLinkButtons, setShowLinkButtons] = useState(false);

  // إضافة state لتتبع المؤقتات
  const [buttonTimers, setButtonTimers] = useState(() => {
    const savedTimers = localStorage.getItem('buttonTimers');
    return savedTimers ? JSON.parse(savedTimers) : {};
  });

  // إضافة state جديدة لتتبع حالة المؤقت
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // دالة للتحقق من المؤقت
  const isButtonLocked = (buttonId) => {
    const timer = buttonTimers[buttonId];
    if (!timer) return false;
    return new Date().getTime() < timer;
  };

  // دالة لتحديث المؤقت وتنفيذ الوظيفة بعد انتهائه
  const setButtonTimer = (buttonId, duration, callback) => {
    const newTimer = new Date().getTime() + duration * 1000;
    const updatedTimers = {
      ...buttonTimers,
      [buttonId]: newTimer,
    };
    setButtonTimers(updatedTimers);
    localStorage.setItem('buttonTimers', JSON.stringify(updatedTimers));

    // تنفيذ الوظيفة بعد انتهاء المؤقت
    setTimeout(() => {
      // إزالة المؤقت من الحالة
      const currentTimers = { ...buttonTimers };
      delete currentTimers[buttonId];
      setButtonTimers(currentTimers);
      localStorage.setItem('buttonTimers', JSON.stringify(currentTimers));

      // تنفيذ الوظيفة المحددة
      callback();
    }, duration * 1000);
  };

  // دالة للحصول على الوقت المتبقي
  const getRemainingTime = (buttonId) => {
    const timer = buttonTimers[buttonId];
    if (!timer) return 0;
    const remaining = Math.max(
      0,
      Math.ceil((timer - new Date().getTime()) / 1000),
    );
    return remaining;
  };

  // إضافة دالة refreshData في بداية الملف
  const refreshData = async () => {
    try {
      const pagesResponse = await axios.get('https://buttons-back.cowdly.com/api/pages/');
      setPages(pagesResponse.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // دالة لتحديث الزر في الـ API
  const updateButtonInAPI = async (buttonId, updatedData) => {
    try {
      const formData = new FormData();
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            if (key === 'shape_details') {
              // تنسيق shape_details بنفس شكل API
              const shape_details = {
                background_color: value.background_color || '',
                text_color: value.text_color || '#000',
                text: value.text || 'Click me',
                font_size: value.font_size || 16,
                border_radius: value.border_radius || 0,
                type: value.type || '',
                action: {
                  id: value.action?.id,
                  type: value.action?.type || '',
                  target_page: value.action?.target_page || '',
                  media_url: null,
                  media_type: '',
                  file_url: null,
                  file_name: '',
                  file_type: ''
                }
              };
              formData.append(key, JSON.stringify(shape_details));
            } else {
              formData.append(key, JSON.stringify(value));
            }
          } else {
            formData.append(key, value);
          }
        }
      });

      // console.log('Sending data:', Object.fromEntries(formData));

      await axios.patch(
        `https://buttons-back.cowdly.com/api/buttons/${buttonId}/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // تحديث الواجهة - تعديل هنا لتحديث جميع الخصائص بما فيها is_active
      const updatedPages = pages.map((page) =>
        page.id === currentPageId
          ? {
              ...page,
              buttons: page.buttons.map((button) =>
                button.id === buttonId
                  ? {
                      ...button,
                      ...updatedData, // إضافة جميع البيانات المحدثة
                      shape_details: updatedData.shape_details
                        ? { ...button.shape_details, ...updatedData.shape_details }
                        : button.shape_details
                    }
                  : button
              ),
            }
          : page
      );

      setPages(updatedPages);
      
      // تحديث الزر المحدد إذا كان هو الزر الذي تم تحديثه
      if (selectedButton && selectedButton.id === buttonId) {
        setSelectedButton({
          ...selectedButton,
          ...updatedData,
          shape_details: updatedData.shape_details 
            ? { ...selectedButton.shape_details, ...updatedData.shape_details }
            : selectedButton.shape_details
        });
      }
      
      await refreshData();
      toast.success('تم تحديث الزر بنجاح');
    } catch (error) {
      console.error('Error updating button:', error);
      toast.error('حدث خطأ أثناء تحديث الزر');
    }
  };

  // Button Actions
  const handleButtonAction = {
    addNew: async () => {
      const currentPage = pages.find((page) => page.id === currentPageId);
      if (!currentPage) {
        toast.error('الرجاء اختيار صفحة أولاً');
        return;
      }

      const newButton = {
        name: `زر ${currentPage.buttons.length + 1}`,
        height: 50,
        width: 160,
        is_fixed: false,
        is_active: true,
        type: 'page',
        clicks: 0,
        page: currentPageId,
        // calculation: {
        //   enabled: false,
        //   type: '',
        //   display_result: false,
        //   result_position: ''
        // },
        // timer: {
        //   enabled: false,
        //   duration: null,
        //   type: '',
        //   action: ''
        // },
        // shape_details: {
        //   background_color: '',
        //   text_color: '',
        //   text: '',
        //   font_size: null,
        //   border_radius: null,
        //   action: {
        //     type: '',
        //     target_page: '',
        //     media_url: null,
        //     media_type: '',
        //     file_url: null,
        //     file_name: '',
        //     file_type: ''
        //   }
        // }
      };

      try {
        const formData = new FormData();
        Object.entries(newButton).forEach(([key, value]) => {
          formData.append(key, value);
        });

        const buttonResponse = await axios.post(
          'https://buttons-back.cowdly.com/api/buttons/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          },
          
        );
        // إنشاء موقع للزر الجديد
        const buttonPosition = {
          x: 0,
          y: 0,
          button: buttonResponse.data.id,
        };

        // حفظ موقع الزر في API
        await axios.post(
          'https://buttons-back.cowdly.com/api/button-positions/',
          buttonPosition,
        );

        const updatedPages = pages.map((page) =>
          page.id === currentPageId
            ? {
                ...page,
                buttons: [...page.buttons, buttonResponse.data],
              }
            : page,
        );

        setPages(updatedPages);
        setButtons(currentPage.buttons);
        await refreshData();  // إضافة تحديث البيانات
        toast.success('تم إضافة الزر بنجاح');
      } catch (error) {
        console.error('Error creating button:', error);
        toast.error('حدث خطأ أثناء إضافة الزر');
      }
    },

    duplicate: async () => {
      if (!selectedButton) {
        toast.warning('من فضلك اختر زرًا لنسخه!');
        return;
      }

      try {
        // إنشاء FormData للزر المنسوخ
        const formData = new FormData();
        formData.append('name', `${selectedButton.name} (نسخة)`);
        formData.append('page', currentPageId);
        formData.append('height', selectedButton.height);
        formData.append('width', selectedButton.width);
        formData.append('is_fixed', selectedButton.is_fixed);
        formData.append('is_active', selectedButton.is_active);
        formData.append('type', selectedButton.type);
        formData.append('clicks', selectedButton.clicks);

        // نسخ shape_details مع حذف id من الـ action
        if (selectedButton.shape_details) {
          const shape_details = {
            ...selectedButton.shape_details,
            action: selectedButton.shape_details.action ? {
              type: selectedButton.shape_details.action.type || '',
              target_page: selectedButton.shape_details.action.target_page || '',
              media_url: selectedButton.shape_details.action.media_url || null,
              media_type: selectedButton.shape_details.action.media_type || '',
              file_url: selectedButton.shape_details.action.file_url || null,
              file_name: selectedButton.shape_details.action.file_name || '',
              file_type: selectedButton.shape_details.action.file_type || ''
            } : null
          };
          formData.append('shape_details', JSON.stringify(shape_details));
        }

        // إنشاء نسخة من الزر
        const buttonResponse = await axios.post(
          'https://buttons-back.cowdly.com/api/buttons/',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // إنشاء position للزر المنسوخ
        const buttonPosition = {
          x: 0,
          y: 0,
          button: buttonResponse.data.id,
        };

        // حفظ position الزر
        await axios.post(
          'https://buttons-back.cowdly.com/api/button-positions/',
          buttonPosition
        );

        // تحديث البيانات
        try {
          await refreshData();
          // console.log('Data refreshed successfully');
        } catch (refreshError) {
          console.error('Error refreshing data:', refreshError);
        }

        setSelectedButton(null);
        toast.success('تم نسخ الزر بنجاح');
      } catch (error) {
        console.error('Error duplicating button:', error);
        toast.error('حدث خطأ أثناء نسخ الزر');
      }
    },

    delete: async () => {
      if (!selectedButton) {
        toast.warning('من فضلك اختر زرًا لحذفه!');
        return;
      }

      if (
        window.confirm(
          `هل أنت متأكد أنك تريد حذف الزر "${selectedButton.name}"؟`,
        )
      ) {
        await axios.delete(`https://buttons-back.cowdly.com/api/buttons/${selectedButton.id}/`);
        await refreshData();  // إضافة تحديث البيانات
        setSelectedButton(null);
        toast.success('تم حذف الزر بنجاح');
      }
    },
  };

  const changeColor = (color) => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا!');
      return;
    }
    const updatedData = { color: color };
    updateButtonInAPI(selectedButton.id, updatedData);
  };

  const toggleButtonSidebar = () => {
    setShowButtonSidebar(!showButtonSidebar);
  };
  const toggleButtonLeftSidebar = () => {
    setShowButtonLeftSidebar(!showButtonLeftSidebar);
  };

  // console.log('showPagePopup', showPagePopup);

  const handleMeasurementClick = () => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا لتعديله!');
      return;
    }
    setMeasurementForm(true);
  };

  const AddNewPage = (pageName) => {
    const newPage = {
      id: Date.now(),
      name: pageName,
      buttons: [],
    };

    const updatedPages = [...pages, newPage];
    setPages(updatedPages);
    localStorage.setItem('pages', JSON.stringify(updatedPages));
    setCurrentPageId(newPage.id);
  };

  const handleSwitchPage = (pageId) => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا!');
      return;
    }
    const updatedData = { target_page: pageId };
    updateButtonInAPI(selectedButton.id, updatedData);
    setSelectedButton(null);
  };

  const switchToPage = () => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا!');
      return;
    }
    setShowPagePopup(true);
  };
  const handleMovementButton = () => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا لتثبيته أو إلغاء تثبيته!');
      return;
    }
    const updatedData = { is_fixed: !selectedButton.is_fixed };
    updateButtonInAPI(selectedButton.id, updatedData);
    setSelectedButton(null);
  };

  const handleRenameClick = (newName) => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا لتعديله!');
      return;
    }
    const updatedData = { name: newName };
    updateButtonInAPI(selectedButton.id, updatedData);
  };

  const handleFooterAction = async (pageId) => {
    if (selectedButton) {
      try {
        const formData = new FormData();
        
        Object.entries({
          target_page: pageId,
          media: null,
          mediaType: null,
          fileDetails: null,
          shape_details: null,
          type: 'page',
        }).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, value);
          }
        });

        // إرسال FormData في طلب PATCH
        const response = await axios.patch(
          `https://buttons-back.cowdly.com/api/buttons/${selectedButton.id}/`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        // console.log('Button update response:', response.data); // لنرى الرد من API

        // تحديث الواجهة
        const updatedPages = pages.map((page) =>
          page.id === currentPageId
            ? {
                ...page,
                buttons: page.buttons.map((button) =>
                  button.id === selectedButton.id
                    ? {
                        ...selectedButton,
                        target_page: pageId,
                        media: null,
                        mediaType: null,
                        fileDetails: null,
                        shape_details: null,
                        type: 'page',
                      }
                    : button,
                ),
              }
            : page,
        );

        setPages(updatedPages);
        
        await refreshData();  // إضافة تحديث البيانات
        toast.success(`تم تعيين صفحة الانتقال للزر "${selectedButton.name}"`);
        setSelectedButton(null);
        setShowPagePopup(false);
      } catch (error) {
        console.error('Error updating button:', error);
        toast.error('حدث خطأ أثناء تحديث الزر');
      }
    }
  };

  const addMedia = () => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا!');
      return;
    }
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
        
        const formData = new FormData();
        formData.append('media', file); // إضافة الملف مباشرة
        const isImage = file.type.startsWith('image/');
        formData.append('media_type', isImage ? 'image' : 'video');
        formData.append('type', 'media');

        // const updatedData = {
        //   shape_details: {
        //     background_color: selectedButton.shape_details?.background_color || '',
        //     text_color: selectedButton.shape_details?.text_color || '',
        //     text: selectedButton.shape_details?.text || '',
        //     font_size: selectedButton.shape_details?.font_size || null,
        //     border_radius: selectedButton.shape_details?.border_radius || null,
        //     action: {
        //       id: selectedButton?.shape_details?.action?.id,
        //       type: 'media',
        //       target_page: '',
        //       media_type: mediaType,
        //       file_url: null,
        //       file_name: '',
        //       file_type: ''
        //     }
        //   }
        // };

        // formData.append('shape_details', JSON.stringify(updatedData.shape_details));

        try {
          await axios.patch(
            `https://buttons-back.cowdly.com/api/buttons/${selectedButton.id}/`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          toast.success('تم إضافة الوسائط بنجاح');
        } catch (error) {
          console.error('Error uploading media:', error);
          toast.error('حدث خطأ أثناء رفع الوسائط');
        }
      }
    };
    fileInput.click();
  };

  const handleFileUpload = () => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا!');
      return;
    }
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.zip,.rar';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const allowedExtensions = [
          '.pdf',
          '.doc',
          '.docx',
          '.txt',
          '.xls',
          '.xlsx',
          '.ppt',
          '.pptx',
          '.zip',
          '.rar',
        ];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
          toast.error(
            'نوع الملف غير مسموح به. الملفات المسموح بها هي: PDF, DOC, DOCX, TXT, XLS, XLSX, PPT, PPTX, ZIP, RAR',
          );
          return;
        }

        const allowedMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'application/zip',
          'application/x-rar-compressed',
        ];

        if (!allowedMimeTypes.includes(file.type)) {
          toast.error('نوع الملف غير مسموح به');
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error('حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت');
          return;
        }

        const formData = new FormData();
        formData.append('file', file); // إضافة الملف مباشرة
        formData.append('type', 'file'); // إضافة الملف مباشرة


        // const updatedData = {
        //   shape_details: {
        //     background_color: selectedButton.shape_details?.background_color || '',
        //     text_color: selectedButton.shape_details?.text_color || '',
        //     text: selectedButton.shape_details?.text || '',
        //     font_size: selectedButton.shape_details?.font_size || null,
        //     border_radius: selectedButton.shape_details?.border_radius || null,
        //     action: {
        //       id: selectedButton?.shape_details?.action?.id,
        //       type: 'file',
        //       target_page: '',
        //       media_url: null,
        //       media_type: '',
        //       file_name: file.name,
        //       file_type: file.type
        //     }
        //   }
        // };

        // formData.append('shape_details', JSON.stringify(updatedData.shape_details));

        try {
          await axios.patch(
            `https://buttons-back.cowdly.com/api/buttons/${selectedButton.id}/`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          toast.success('تم إضافة الملف بنجاح');
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error('حدث خطأ أثناء رفع الملف');
        }
      }
    };
    fileInput.click();
  };

  useEffect(() => {
    const storedPages = localStorage.getItem('pages');
    if (storedPages) {
      setPages(JSON.parse(storedPages));
    }
  }, []);

  const [showMenu, setShowMenu] = useState(false);

  const toggleShowMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleShapeChange = (newButtonData) => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا!');
      return;
    }

    // إرسال فقط البيانات التي تم تغييرها
    const updatedData = {
      ...Object.keys(newButtonData).reduce((acc, key) => {
        if (selectedButton[key] !== newButtonData[key]) {
          acc[key] = newButtonData[key];
        }
        return acc;
      }, {}),
    };

    // تجنب إرسال shapeDetails إذا لم يتم تغييره
    if ('shape_details' in updatedData && !newButtonData.shape_details) {
      delete updatedData.shape_details;
    }

    if (Object.keys(updatedData).length > 0) {
      updateButtonInAPI(selectedButton.id, updatedData);
    }
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    setSelectedButton(null);
    refreshData();
  };

  // إضافة state جديد للأزرار الأصلية
  const [originalPages, setOriginalPages] = useState({});

  // حفظ النسخة الأصلية لجميع الأزرار في كل الصفحات
  useEffect(() => {
    const originalState = {};
    pages.forEach((page) => {
      originalState[page.id] = {
        ...page,
        buttons: page.buttons.map((button) => ({ ...button })),
      };
    });
    setOriginalPages(originalState);
  }, []);

  // التعامل مع تغيير حالة التحكم
  useEffect(() => {
    if (showControls) {
      // استعادة الحالة الأصلية لجميع الصفحات
      const restoredPages = pages.map((page) => {
        const originalPage = originalPages[page.id];
        if (!originalPage) return page;

        return {
          ...originalPage,
          buttons: page.buttons.map((button) => {
            const originalButton = originalPage.buttons.find(
              (ob) => ob.id === button.id,
            );
            if (!originalButton) return button;

            return {
              ...originalButton,
              media: button.media || originalButton.media,
              shape_details: {
                ...originalButton.shape_details,
                ...(button.shape_details || {}),
              },
              fileDetails: {
                ...originalButton.fileDetails,
                ...(button.fileDetails || {}),
              },
              target_page: button.target_page || originalButton.target_page,
              is_active: true,
            };
          }),
        };
      });

      setPages(restoredPages);
      // toast.info('تم استعادة الحالة الأصلية لجميع الأزرار');
    } else {
      // حفظ النسخة الحالية كنسخة أصلية
      const newOriginalState = {};
      pages.forEach((page) => {
        newOriginalState[page.id] = {
          ...page,
          buttons: page.buttons.map((button) => ({ ...button })),
        };
      });
      setOriginalPages(newOriginalState);
    }
  }, [showControls]);

  // تعديل دالة handleButtonClick
  const handleButtonClick = (buttonId, executeCallback) => {
    const currentPage = pages.find((page) => page.id === currentPageId);
    const button = currentPage?.buttons.find((btn) => btn.id === buttonId);

    if (!button) return false;

    if (isButtonLocked(buttonId)) {
      const remainingTime = getRemainingTime(buttonId);
      toast.error(`انتظر ${remainingTime} ثواني قبل الضغط مرة أخرى`);
      return false;
    }

    if (button.timer?.enabled && button.timer.duration > 0) {
      setIsTimerRunning(true); // تفعيل حالة المؤقت
      setButtonTimer(buttonId, button.timer.duration, () => {
        executeCallback();
        const updatedButtons = buttons.map((btn) =>
          btn.id === buttonId ? { ...btn, clicks: (btn.clicks || 0) + 1 } : btn,
        );
        setButtons(updatedButtons);

        if (button.timer.action === 'hide') {
          const updatedButtons = buttons.map((btn) =>
            btn.id === buttonId ? { ...btn, is_active: false } : btn,
          );
          setButtons(updatedButtons);
        }
        setIsTimerRunning(false); // إيقاف حالة المؤقت
      });
      return 'waiting';
    }

    return true;
  };

  // إضافة دالة ربط الأزرار
  const handleLinkButton = (targetButtonId) => {
    if (!selectedButton) {
      toast.warning('الرجاء اختيار زر أولاً');
      return;
    }

    // تحضير بيانات الزر المحدث مع الحفاظ على القيم الموجودة
    const updatedButton = {
      ...selectedButton,
      linked_buttons: targetButtonId,
      calculation: {
        ...selectedButton.calculation,  // الحفاظ على القيم الموجودة
        enabled: true,
        type: selectedButton.calculation?.type || 'add',
        display_result: selectedButton.calculation?.display_result || false,
        result_position: selectedButton.calculation?.result_position || '',
        clicks: selectedButton.calculation?.clicks || 0
      }
    };

    // إنشاء FormData للإرسال إلى API
    const formData = new FormData();
    formData.append('linked_buttons', targetButtonId || 0);
    formData.append('calculation', JSON.stringify(updatedButton.calculation));

    // تحديث الزر في API
    axios.patch(
      `https://buttons-back.cowdly.com/api/buttons/${selectedButton.id}/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
    .then(() => {
      // تحديث الواجهة بعد نجاح العملية
      const updatedPages = pages.map((page) => ({
        ...page,
        buttons: page.buttons.map((button) =>
          button.id === selectedButton.id ? updatedButton : button
        ),
      }));
      setPages(updatedPages);
      setSelectedButton(updatedButton);  // تحديث الزر المحدد
      toast.success('تم ربط الزر بنجاح');
    })
    .catch((error) => {
      console.error('Error linking button:', error);
      toast.error('حدث خطأ أثناء ربط الزر');
    });
  };

  // إضافة useEffect لتنظيف المؤقتات القديمة
  useEffect(() => {
    const cleanupTimers = () => {
      const now = new Date().getTime();
      const updatedTimers = { ...buttonTimers };
      let hasChanges = false;

      Object.entries(updatedTimers).forEach(([buttonId, timestamp]) => {
        if (timestamp < now) {
          delete updatedTimers[buttonId];
          hasChanges = true;
        }
      });

      if (hasChanges) {
        setButtonTimers(updatedTimers);
        localStorage.setItem('buttonTimers', JSON.stringify(updatedTimers));
      }
    };

    const interval = setInterval(cleanupTimers, 1000);
    return () => clearInterval(interval);
  }, [buttonTimers]);

  // تحديث useEffect لمراقبة تغييرات الصفحة الحالية
  useEffect(() => {
    const currentPage = pages.find((page) => page.id === currentPageId);
    if (currentPage) {
      setButtons(currentPage.buttons || []);
    }
  }, [currentPageId, pages]);

  const handleCalculationTypeChange = (e) => {
    if (!selectedButton) {
      toast.warning('الرجاء اختيار زر أولاً');
      return;
    }

    const updatedButton = {
      ...selectedButton,
      calculation: {
        ...selectedButton.calculation,
        type: e.target.value,
        enabled: true,
      },
    };

    // console.log('Selected Calculation Type:', e.target.value); // طباعة نوع العملية

    updateButton(selectedButton.id, updatedButton);
  };

  const renderCalculationResults = () => {
    const processedPairs = new Set();

    return pages.map((page) => {
      return page.buttons.map((button) => {
        if (button.linked_buttons && button.calculation?.enabled) {
          const linkedId = button.linked_buttons;
          const pairId = [button.id, linkedId].sort().join('-');

          if (processedPairs.has(pairId)) {
            return null;
          }

          processedPairs.add(pairId);

          const linkedButton = pages
            .flatMap((p) => p.buttons)
            .find((b) => b.id === linkedId);

          if (!linkedButton) return null;

          let result = 0;
          const buttonClicks = button.clicks || 0;
          const linkedClicks = linkedButton.clicks || 0;

          switch (button.calculation.type) {
            case 'add':
              result = buttonClicks + linkedClicks;
              break;
            case 'subtract':
              result = buttonClicks - linkedClicks;
              break;
            case 'multiply':
              result = buttonClicks * linkedClicks;
              break;
            case 'percentage':
              result =
                linkedClicks > 0 ? (buttonClicks / linkedClicks) * 100 : 0;
              break;
            default:
              result = 0;
          }

          return (
            <div
              key={pairId}
              className="mb-4 bg-gray-100 dark:bg-gray-600 p-3 rounded"
            >
              <div className="flex justify-between items-center">
                <span>{button.name}:</span>
                <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  {buttonClicks} نقرة
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>{linkedButton.name}:</span>
                <span className="bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                  {linkedClicks} نقرة
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span>النتيجة:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {result.toFixed(2)}{' '}
                  {button.calculation.type === 'percentage' ? '%' : ''}
                </span>
              </div>
            </div>
          );
        }
        return null;
      });
    });
  };

  const handleColorChange = async (buttonId, colors) => {
    try {
      await updateButtonInAPI(buttonId, colors);
      setShowColorPicker(false);
    } catch (error) {
      console.error('Error updating colors:', error);
      toast.error('حدث خطأ أثناء تحديث الألوان');
    }
  };

  const handleShowLinkButtons = () => {
    if (!selectedButton) {
      toast.warning('الرجاء اختيار زر أولاً');
      return;
    }
    setShowLinkButtons(true);
  };

  // إضافة state جديدة للتحكم في السايدبارات في وضع إخفاء التحكمات
  const [sidebarStates, setSidebarStates] = useState({
    right: true,  // ButtonSidebar
    left: true,   // ButtonLeftSidebar
    nav: true     // ButtonNavbar
  });

  // دالة للتحكم في حالة السايدبارات
  const toggleSidebarState = (side) => {
    setSidebarStates(prev => ({
      ...prev,
      [side]: !prev[side]
    }));
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnHover={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        theme="colored"
        className={'z-[9999999]'}
      />

      {/* إضافة أزرار التحكم في السايدبارات عندما تكون التحكمات مخفية */}
      {!showControls && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => toggleSidebarState('right')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg"
          >
            {sidebarStates.right ? 'إخفاء القائمة اليمنى' : 'إظهار القائمة اليمنى'}
          </button>
          <button
            onClick={() => toggleSidebarState('left')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg"
          >
            {sidebarStates.left ? 'إخفاء القائمة اليسرى' : 'إظهار القائمة اليسرى'}
          </button>
        </div>
      )}

      <div className="flex gap-3 h-screen overflow-hidden bg-white dark:bg-gray-900">
        <div className={`${!showControls && sidebarStates.left ? 'w-64 flex-shrink-0' : ''}`}>
          <ButtonSidebar
            toggleButtonSidebar={toggleButtonSidebar}
            setShowButtonSidebar={setShowButtonSidebar}
            showButtonSidebar={showControls ? showButtonSidebar : sidebarStates.right}
            pages={pages}
            setPages={setPages}
            AddNewPage={() => setShowNewPageForm(true)}
            setCurrentPageId={(pageId) => setCurrentPageId(pageId)}
            currentPageId={currentPageId}
            showControls={showControls}
            handleButtonAction={handleButtonAction}
            sidebarStates={sidebarStates}
          />
        </div>
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {showControls && (
            <ButtonNavbar
              handleButtonAction={handleButtonAction}
              toggleButtonSidebar={toggleButtonSidebar}
              toggleButtonLeftSidebar={toggleButtonLeftSidebar}
              showButtonLeftSidebar={showButtonLeftSidebar}
              showButtonSidebar={showButtonSidebar}
              onMeasurementClick={handleMeasurementClick}
              handleRenameClick={handleRenameClick}
              deleteButton={handleButtonAction.delete}
              handleMovementButton={handleMovementButton}
              selectedButton={selectedButton}
              updateButton={updateButton}
              changeColor={changeColor}
              toggleShowMenu={toggleShowMenu}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              setShowRenameForm={setShowRenameForm}
              setShowColorPicker={setShowColorPicker}
              setMeasurementForm={setMeasurementForm}
            />
          )}

          <div className="flex py-3">
            {pages.find((page) => page.id === currentPageId) &&
            pages.find((page) => page.id === currentPageId).buttons ? (
              <ButtonArea
                pages={pages}
                currentPageId={currentPageId}
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
                showControls={showControls}
                toggleControls={toggleControls}
                setCurrentPageId={setCurrentPageId}
                originalPages={originalPages}
                handleButtonClick={handleButtonClick}
                setButtons={handleSetButtons}
                buttons={buttons}
                isTimerRunning={isTimerRunning}
              />
            ) : (
              <p className="text-center text-gray-500">
                لا توجد بيانات لعرضها!
              </p>
            )}
          </div>

          {showControls && (
            <ButtonFooter
              showControls={showControls}
              addMedia={addMedia}
              toggleButtonSidebar={toggleButtonSidebar}
              showButtonSidebar={showButtonSidebar}
              onMeasurementClick={handleMeasurementClick}
              handleRenameClick={handleRenameClick}
              setSelectedButton={setSelectedButton}
              deleteButton={handleButtonAction.delete}
              handleMovementButton={handleMovementButton}
              selectedButton={selectedButton}
              handleSwitchPage={handleSwitchPage}
              updateButton={updateButton}
              updateButtonInAPI={updateButtonInAPI}
              pages={pages}
              setShowPagePopup={setShowPagePopup}
              handleFooterAction={handleFooterAction}
              changeShape={toggleShowMenu}
              onSwitchPage={() => {
                if (selectedButton) {
                  setShowPagePopup(true);
                } else {
                  toast.warning('من فضلك اختر زرًا لتحديد الصفحة!');
                }
              }}
              handleShapeChange={handleShapeChange}
              handleFileUpload={handleFileUpload}
            />
          )}
        </div>

        <div className={`${!showControls && sidebarStates.right ? 'w-64 flex-shrink-0' : ''}`}>
          <ButtonLeftSidebar
            toggleButtonLeftSidebar={toggleButtonLeftSidebar}
            setShowButtonLeftSidebar={setShowButtonLeftSidebar}
            showButtonLeftSidebar={showControls ? showButtonLeftSidebar : sidebarStates.left}
            pages={pages}
            setPages={setPages}
            AddNewPage={AddNewPage}
            setCurrentPageId={setCurrentPageId}
            handleButtonAction={handleButtonAction}
            setShowLinkButtons={setShowLinkButtons}
            selectedButton={selectedButton}
            updateButton={updateButton}
            toggleControls={toggleControls}
            showControls={showControls}
            sidebarStates={sidebarStates}
            updateButtonInAPI={updateButtonInAPI}
          />
        </div>
      </div>

      {showControls && showMeasurementForm && (
        <MeasurementForm
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
          onClose={() => setMeasurementForm(false)}
          updateButton={updateButtonInAPI}
        />
      )}

      {showControls && showRenameForm && (
        <Rename
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
          onClose={() => setShowRenameForm(false)}
          updateButton={updateButtonInAPI}
        />
      )}

      {showControls && showColorPicker && (
        <ColorForm
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
          onClose={() => setShowColorPicker(false)}
          updateButton={updateButtonInAPI}
          setShowColorPicker={setShowColorPicker}
        />
      )}

      {showControls && showPagePopup && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999999999]">
          <div className="bg-white p-5 rounded shadow-lg w-65">
            <h2 className="text-lg font-bold mb-4">اختر الصفحة</h2>
            <ul className="space-y-2">
              {pages.map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => handleFooterAction(page.id)}
                    className="block w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    {page.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowPagePopup(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {showNewPageForm && (
        <NewPageForm
          onSubmit={AddNewPage}
          onClose={() => setShowNewPageForm(false)}
        />
      )}

      {showLinkButtons && (
        <LinkButtonsModal
          pages={pages}
          selectedButton={selectedButton}
          onLinkButton={handleLinkButton}
          onClose={() => setShowLinkButtons(false)}
        />
      )}
    </>
  );
}
