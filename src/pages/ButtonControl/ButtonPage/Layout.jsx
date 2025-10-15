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
// استبدال axios بـ Firestore
import {
  getAllPagesWithButtons,
  addPage,
  addButton,
  updateButton as updateButtonInFirestore,
  deleteButton as deleteButtonFromFirestore,
  addButtonPosition,
  updateButtonPosition,
  getButtonPositionById,
} from '../../../config/firestore';
// استيراد دوال Firebase Storage
import {
  uploadMedia,
  uploadDocument,
} from '../../../config/storage';

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

  const [buttons, setButtons] = useState([]);

  // جلب البيانات من Firestore
  useEffect(() => {
    const fetchPages = async () => {
      try {
        console.log('🔄 جلب البيانات من Firestore...');
        const pagesWithButtons = await getAllPagesWithButtons();
        console.log('📄 بيانات الصفحات المستلمة:', pagesWithButtons);
        
        if (!Array.isArray(pagesWithButtons)) {
          console.error('خطأ: البيانات ليست مصفوفة:', pagesWithButtons);
          toast.error('خطأ في تنسيق بيانات الصفحات');
          return;
        }

        // تحويل التسمية من camelCase إلى snake_case لتوافق الكود الموجود
        const formattedPages = pagesWithButtons.map((page) => ({
          ...page,
          is_active: page.isActive !== undefined ? page.isActive : true,
          buttons: (page.buttons || []).map((btn) => ({
            ...btn,
            page_id: btn.pageId || page.id,
            is_active: btn.isActive !== undefined ? btn.isActive : true,
            background_color: btn.backgroundColor || btn.background_color || '#3b82f6',
            text_color: btn.textColor || btn.text_color || '#ffffff',
            shape_details: btn.shapeDetails || btn.shape_details || null,
            linked_buttons: btn.linkedButtons || btn.linked_buttons || null,
            target_page: btn.targetPage || btn.target_page || null,
            media_type: btn.mediaType || btn.media_type || null,
            is_fixed: btn.isFixed || btn.is_fixed || false,
          })),
        }));

        setPages(formattedPages);

        // تعيين الصفحة الأولى كافتراضية
        if (!currentPageId && formattedPages.length > 0) {
          setCurrentPageId(formattedPages[0].id);
        }
      } catch (error) {
        console.error('❌ خطأ في جلب الصفحات:', error);
        toast.error('حدث خطأ أثناء تحميل الصفحات');
        
        // إضافة صفحة افتراضية في حالة الخطأ
        setPages([{
          id: 'default-page',
          name: 'الصفحة الرئيسية',
          title: 'الصفحة الرئيسية',
          is_active: true,
          buttons: []
        }]);
        setCurrentPageId('default-page');
      }
    };

    fetchPages();
  }, [setCurrentPageId, setPages]);

  // تحديث الأزرار عند تغيير الصفحة الحالية
  useEffect(() => {
    const currentPage = pages.find((page) => page.id === currentPageId);
    if (currentPage) {
      setButtons(currentPage.buttons || []);
    }
  }, [currentPageId, pages]);

  const handleSetButtons = (newButtons) => {
    setButtons(newButtons);
    setPages((prevPages) =>
      prevPages.map((page) =>
        page.id === currentPageId ? { ...page, buttons: newButtons } : page,
      ),
    );
  };

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
  const [showMenu, setShowMenu] = useState(false);

  // إضافة state لتتبع المؤقتات
  const [buttonTimers, setButtonTimers] = useState(() => {
    const savedTimers = localStorage.getItem('buttonTimers');
    return savedTimers ? JSON.parse(savedTimers) : {};
  });

  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // دالة للتحقق من المؤقت
  const isButtonLocked = (buttonId) => {
    const timer = buttonTimers[buttonId];
    if (!timer) return false;
    return new Date().getTime() < timer;
  };

  // دالة لتحديث المؤقت
  const setButtonTimer = (buttonId, duration, callback) => {
    const newTimer = new Date().getTime() + duration * 1000;
    const updatedTimers = {
      ...buttonTimers,
      [buttonId]: newTimer,
    };
    setButtonTimers(updatedTimers);
    localStorage.setItem('buttonTimers', JSON.stringify(updatedTimers));

    setTimeout(() => {
      const currentTimers = { ...buttonTimers };
      delete currentTimers[buttonId];
      setButtonTimers(currentTimers);
      localStorage.setItem('buttonTimers', JSON.stringify(currentTimers));
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

  // تحديث البيانات من Firestore
  const refreshData = async () => {
    try {
      console.log('🔄 تحديث البيانات من Firestore...');
      const pagesWithButtons = await getAllPagesWithButtons();
      console.log('📄 بيانات الصفحات المستلمة:', pagesWithButtons);
      
      if (!Array.isArray(pagesWithButtons)) {
        console.error('❌ البيانات ليست مصفوفة:', pagesWithButtons);
        return;
      }

      // تحويل التسمية لتوافق الكود الموجود
      const formattedPages = pagesWithButtons.map((page) => ({
        ...page,
        is_active: page.isActive !== undefined ? page.isActive : true,
        buttons: (page.buttons || []).map((btn) => ({
          ...btn,
          page_id: btn.pageId || page.id,
          is_active: btn.isActive !== undefined ? btn.isActive : true,
          background_color: btn.backgroundColor || btn.background_color || '#3b82f6',
          text_color: btn.textColor || btn.text_color || '#ffffff',
          shape_details: btn.shapeDetails || btn.shape_details || null,
          linked_buttons: btn.linkedButtons || btn.linked_buttons || null,
          target_page: btn.targetPage || btn.target_page || null,
          media_type: btn.mediaType || btn.media_type || null,
          is_fixed: btn.isFixed || btn.is_fixed || false,
        })),
      }));

      console.log('📊 الصفحات مع الأزرار:', formattedPages);
      setPages(formattedPages);
      console.log('✅ تم تحديث البيانات بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تحديث البيانات:', error);
      toast.error('حدث خطأ أثناء تحديث البيانات');
    }
  };

  // تحديث الزر في Firestore
  const updateButtonInAPI = async (buttonId, updatedData) => {
    try {
      // تحويل snake_case إلى camelCase لـ Firestore
      const firestoreData = {};
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // تحويل التسمية
          const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          firestoreData[camelKey] = value;
          
          // الاحتفاظ بالتسمية الأصلية أيضاً للتوافق
          firestoreData[key] = value;
        }
      });

      await updateButtonInFirestore(buttonId, firestoreData);
      await refreshData();
      toast.success('تم تحديث الزر بنجاح');
    } catch (error) {
      console.error('❌ خطأ في تحديث الزر:', error);
      toast.error('حدث خطأ أثناء تحديث الزر');
    }
  };

  // إجراءات الأزرار
  const handleButtonAction = {
    addNew: async (shapeType = 'square') => {
      console.log('🚀 بدء إضافة شكل:', shapeType);
      console.log('📄 الصفحة الحالية:', currentPageId);
      console.log('📚 الصفحات المتاحة:', pages);
      
      const currentPage = pages.find((page) => page.id === currentPageId);
      if (!currentPage) {
        console.error('❌ لم يتم العثور على الصفحة الحالية');
        toast.error('الرجاء اختيار صفحة أولاً');
        return;
      }
      console.log('✅ تم العثور على الصفحة:', currentPage);

      // تحديد خصائص الشكل حسب النوع
      const shapeConfigs = {
        triangle: {
          name: 'مثلث',
          width: 80,
          height: 80,
          shape_details: {
            type: 'triangle',
            sides: 3,
            style: {
              clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)'
            }
          }
        },
        square: {
          name: 'مربع',
          width: 80,
          height: 80,
          shape_details: {
            type: 'square',
            sides: 4,
            style: {
              borderRadius: '0%'
            }
          }
        },
        rectangle: {
          name: 'مستطيل',
          width: 120,
          height: 60,
          shape_details: {
            type: 'rectangle',
            sides: 4,
            style: {
              borderRadius: '0%'
            }
          }
        },
        circle: {
          name: 'دائرة',
          width: 80,
          height: 80,
          shape_details: {
            type: 'circle',
            sides: 0,
            style: {
              borderRadius: '50%'
            }
          }
        }
      };

      const shapeConfig = shapeConfigs[shapeType] || shapeConfigs.square;
      console.log('🔧 إعدادات الشكل:', shapeConfig);

      const newButton = {
        name: shapeConfig.name,
        type: 'shape',
        width: shapeConfig.width,
        height: shapeConfig.height,
        is_active: true,
        page_id: currentPageId,
        clicks: 0,
        background_color: '#3b82f6',
        text_color: '#ffffff',
        shape_details: shapeConfig.shape_details
      };
      console.log('📦 بيانات الزر الجديد:', newButton);

      try {
        console.log('📤 إرسال البيانات إلى Firestore...');
        
        // تحويل البيانات لـ Firestore (camelCase + snake_case)
        const buttonData = {
          name: newButton.name,
          type: newButton.type,
          width: newButton.width,
          height: newButton.height,
          isActive: newButton.is_active,
          is_active: newButton.is_active,
          pageId: currentPageId,
          page_id: currentPageId,
          clicks: newButton.clicks,
          backgroundColor: newButton.background_color,
          background_color: newButton.background_color,
          textColor: newButton.text_color,
          text_color: newButton.text_color,
          shapeDetails: newButton.shape_details,
          shape_details: newButton.shape_details,
        };

        console.log('🌐 إضافة الزر إلى Firestore...');
        const createdButton = await addButton(buttonData);
        console.log('✅ تم إنشاء الزر:', createdButton);

        // إنشاء موقع للزر الجديد
        const buttonPosition = {
          x: 0,
          y: 0,
          buttonId: createdButton.id,
          button: createdButton.id,
        };

        await addButtonPosition(buttonPosition);
        console.log('✅ تم إنشاء موقع الزر');

        console.log('🔄 تحديث البيانات...');
        await refreshData();
        console.log('🎉 تم إضافة الشكل بنجاح!');
        toast.success(`تم إضافة ${shapeConfig.name} بنجاح`);
      } catch (error) {
        console.error('❌ خطأ في إنشاء الزر:', error);
        toast.error('حدث خطأ أثناء إضافة الزر');
      }
    },

    duplicate: async () => {
      if (!selectedButton) {
        toast.warning('من فضلك اختر زرًا');
        return;
      }

      try {
        const buttonData = {
          name: `${selectedButton.name} (نسخة)`,
          type: selectedButton.type,
          pageId: currentPageId,
          page_id: currentPageId,
          height: selectedButton.height,
          width: selectedButton.width,
          isActive: selectedButton.is_active,
          is_active: selectedButton.is_active,
          backgroundColor: selectedButton.background_color || '#3b82f6',
          background_color: selectedButton.background_color || '#3b82f6',
          textColor: selectedButton.text_color || '#000000',
          text_color: selectedButton.text_color || '#000000',
        };

        const createdButton = await addButton(buttonData);

        const buttonPosition = {
          x: 0,
          y: 0,
          buttonId: createdButton.id,
          button: createdButton.id,
        };

        await addButtonPosition(buttonPosition);

        await refreshData();
        setSelectedButton(null);
        toast.success('تم نسخ الزر بنجاح');
      } catch (error) {
        console.error('❌ خطأ في نسخ الزر:', error);
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
        try {
          // حذف الزر من Firestore
          await deleteButtonFromFirestore(selectedButton.id);
          console.log('✅ تم حذف الزر من Firestore');
          
          // ملاحظة: مواقع الأزرار في Firestore يمكن حذفها لاحقاً
          // أو يمكن إضافة logic لحذفها تلقائياً
          
          // تنظيف localStorage من موقع الزر المحذوف
          const savedPositions = localStorage.getItem('buttonPositions');
          if (savedPositions) {
            const positions = JSON.parse(savedPositions);
            delete positions[selectedButton.id];
            localStorage.setItem('buttonPositions', JSON.stringify(positions));
          }
          
          await refreshData();
          setSelectedButton(null);
          toast.success('تم حذف الزر بنجاح');
        } catch (error) {
          console.error('❌ خطأ في حذف الزر:', error);
          toast.error('حدث خطأ أثناء حذف الزر');
        }
      }
    },
  };

  const handleMeasurementClick = () => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا لتعديله!');
      return;
    }
    setMeasurementForm(true);
  };

  const AddNewPage = async (pageName) => {
    try {
      const pageData = {
        name: pageName,
        title: pageName,
        isActive: true,
        is_active: true,
        order: pages.length + 1,
      };

      const createdPage = await addPage(pageData);
      console.log('✅ تم إنشاء الصفحة:', createdPage);

      await refreshData();
      setCurrentPageId(createdPage.id);
      toast.success('تم إضافة الصفحة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في إنشاء الصفحة:', error);
      toast.error('حدث خطأ أثناء إضافة الصفحة');
    }
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
        const updatedData = {
          type: 'page',
          target_page: pageId
        };

        await updateButtonInAPI(selectedButton.id, updatedData);
        toast.success(`تم تعيين صفحة الانتقال للزر "${selectedButton.name}"`);
        setSelectedButton(null);
        setShowPagePopup(false);
      } catch (error) {
        console.error('Error updating button:', error);
        toast.error('حدث خطأ أثناء تحديث الزر');
      }
    }
  };

  // إضافة وسائط مستقلة (بدون زر)
  const addStandaloneMedia = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*,audio/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const loadingToast = toast.loading('جاري رفع الوسائط...');

          // رفع الوسائط إلى Firebase Storage
          const uploadedFile = await uploadMedia(file, (progress) => {
            console.log(`نسبة الرفع: ${Math.round(progress)}%`);
          });

          console.log('✅ تم رفع الوسائط:', uploadedFile);

          // إنشاء "زر" خاص بالوسائط فقط
          const mediaData = {
            name: uploadedFile.fileName,
            type: 'standalone-media', // نوع جديد للوسائط المستقلة
            width: file.type.startsWith('image/') ? 300 : 400,
            height: file.type.startsWith('image/') ? 200 : 300,
            isActive: true,
            is_active: true,
            pageId: currentPageId,
            page_id: currentPageId,
            media: uploadedFile.url,
            mediaType: uploadedFile.mediaType,
            media_type: uploadedFile.mediaType,
            fileName: uploadedFile.fileName,
            file_name: uploadedFile.fileName,
            filePath: uploadedFile.path,
            file_path: uploadedFile.path,
            backgroundColor: 'transparent',
            background_color: 'transparent',
            textColor: '#ffffff',
            text_color: '#ffffff',
          };

          const createdMedia = await addButton(mediaData);
          console.log('✅ تم إنشاء الوسائط:', createdMedia);

          // إنشاء موقع للوسائط
          const mediaPosition = {
            x: 50,
            y: 50,
            buttonId: createdMedia.id,
            button: createdMedia.id,
          };

          await addButtonPosition(mediaPosition);
          
          toast.dismiss(loadingToast);
          await refreshData();
          toast.success('تم إضافة الوسائط بنجاح');
        } catch (error) {
          console.error('❌ خطأ في رفع الوسائط:', error);
          toast.error(error.message || 'حدث خطأ أثناء رفع الوسائط');
        }
      }
    };
    fileInput.click();
  };

  // إضافة وسائط لزر محدد (مع دمج)
  const addMedia = () => {
    if (!selectedButton) {
      // إذا لم يكن هناك زر محدد، اسأل المستخدم
      const choice = window.confirm(
        'لا يوجد زر محدد. هل تريد إضافة الوسائط كعنصر مستقل؟\n\nنعم = وسائط مستقلة\nلا = اختر زر أولاً'
      );
      
      if (choice) {
        addStandaloneMedia();
      } else {
        toast.warning('من فضلك اختر زرًا أولاً أو أضف الوسائط كعنصر مستقل');
      }
      return;
    }

    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,video/*,audio/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const loadingToast = toast.loading('جاري رفع الملف...');

          const uploadedFile = await uploadMedia(file, (progress) => {
            console.log(`نسبة الرفع: ${Math.round(progress)}%`);
          });

          console.log('✅ تم رفع الوسائط:', uploadedFile);

          // تحديث الزر في Firestore
          const updatedData = {
            type: 'media',
            media: uploadedFile.url,
            mediaType: uploadedFile.mediaType,
            media_type: uploadedFile.mediaType,
            fileName: uploadedFile.fileName,
            file_name: uploadedFile.fileName,
            filePath: uploadedFile.path,
            file_path: uploadedFile.path,
          };

          await updateButtonInAPI(selectedButton.id, updatedData);
          
          toast.dismiss(loadingToast);
          toast.success('تم إضافة الوسائط للزر بنجاح');
        } catch (error) {
          console.error('❌ خطأ في رفع الوسائط:', error);
          toast.error(error.message || 'حدث خطأ أثناء رفع الوسائط');
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
        try {
          // عرض رسالة تحميل
          const loadingToast = toast.loading('جاري رفع الملف...');

          // رفع المستند إلى Firebase Storage
          const uploadedFile = await uploadDocument(file, (progress) => {
            // يمكن عرض نسبة التقدم هنا
            console.log(`نسبة الرفع: ${Math.round(progress)}%`);
          });

          console.log('✅ تم رفع المستند:', uploadedFile);

          // تحديث الزر في Firestore
          const updatedData = {
            type: 'file',
            file: uploadedFile.url,
            fileName: uploadedFile.fileName,
            file_name: uploadedFile.fileName,
            fileType: uploadedFile.fileType,
            file_type: uploadedFile.fileType,
            filePath: uploadedFile.path,
            file_path: uploadedFile.path,
            fileSize: uploadedFile.fileSize,
            file_size: uploadedFile.fileSize,
          };

          await updateButtonInAPI(selectedButton.id, updatedData);
          
          // إخفاء رسالة التحميل وعرض رسالة النجاح
          toast.dismiss(loadingToast);
          toast.success('تم إضافة الملف بنجاح');
        } catch (error) {
          console.error('❌ خطأ في رفع الملف:', error);
          toast.error(error.message || 'حدث خطأ أثناء رفع الملف');
        }
      }
    };
    fileInput.click();
  };

  const toggleButtonSidebar = () => {
    setShowButtonSidebar(!showButtonSidebar);
  };

  const toggleButtonLeftSidebar = () => {
    setShowButtonLeftSidebar(!showButtonLeftSidebar);
  };

  const toggleShowMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleShapeChange = (newButtonData) => {
    if (!selectedButton) {
      toast.warning('من فضلك اختر زرًا!');
      return;
    }
    updateButtonInAPI(selectedButton.id, newButtonData);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
    setSelectedButton(null);
    refreshData();
  };

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
      setIsTimerRunning(true);
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
        setIsTimerRunning(false);
      });
      return 'waiting';
    }

    return true;
  };

  const handleLinkButton = (targetButtonId) => {
    if (!selectedButton) {
      toast.warning('الرجاء اختيار زر أولاً');
      return;
    }

    const updatedData = {
      linked_buttons: targetButtonId,
      calculation: {
        type: selectedButton?.calculation?.type || 'add',
        enabled: targetButtonId !== null,
      },
    };

    updateButtonInAPI(selectedButton.id, updatedData);
    toast.success(targetButtonId ? 'تم ربط الزر بنجاح' : 'تم إلغاء الربط');
  };

  // تنظيف المؤقتات القديمة
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

  // إضافة state للتحكم في السايدبارات في وضع إخفاء التحكمات
  const [sidebarStates, setSidebarStates] = useState({
    right: true,
    left: false,
    nav: true
  });

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
        className="z-[99999]"
      />

      {!showControls && (
        <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 flex flex-col sm:flex-row gap-1 sm:gap-2">
          <button
            onClick={() => toggleSidebarState('right')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md shadow-lg whitespace-nowrap"
          >
            <span className="hidden sm:inline">{sidebarStates.right ? 'إخفاء القائمة اليمنى' : 'إظهار القائمة اليمنى'}</span>
            <span className="sm:hidden">{sidebarStates.right ? 'إخفاء اليمنى' : 'إظهار اليمنى'}</span>
          </button>
          <button
            onClick={() => toggleSidebarState('left')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-md shadow-lg whitespace-nowrap"
          >
            <span className="hidden sm:inline">{sidebarStates.left ? 'إخفاء القائمة اليسرى' : 'إظهار القائمة اليسرى'}</span>
            <span className="sm:hidden">{sidebarStates.left ? 'إخفاء اليسرى' : 'إظهار اليسرى'}</span>
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-0 lg:gap-3 h-screen overflow-hidden bg-white dark:bg-gray-900">
        <div className={`${!showControls && sidebarStates.left ? 'w-full lg:w-64 flex-shrink-0' : ''}`}>
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
        
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
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
              toggleShowMenu={toggleShowMenu}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              setShowRenameForm={setShowRenameForm}
              setShowColorPicker={setShowColorPicker}
              setMeasurementForm={setMeasurementForm}
            />
          )}

          <div className="flex py-1 sm:py-2 md:py-3 flex-1 overflow-hidden">
            {pages.length > 0 && currentPageId ? (
              <ButtonArea
                pages={pages}
                currentPageId={currentPageId}
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
                showControls={showControls}
                toggleControls={toggleControls}
                setCurrentPageId={setCurrentPageId}
                handleButtonClick={handleButtonClick}
                setButtons={handleSetButtons}
                buttons={buttons}
                isTimerRunning={isTimerRunning}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-center text-gray-500">
                  {pages.length === 0 ? 'لا توجد صفحات متاحة' : 'لا توجد بيانات لعرضها!'}
                </p>
              </div>
            )}
          </div>

          {showControls && (
            <ButtonFooter
              showControls={showControls}
              addMedia={addMedia}
              addStandaloneMedia={addStandaloneMedia}
              toggleButtonSidebar={toggleButtonSidebar}
              showButtonSidebar={showButtonSidebar}
              onMeasurementClick={handleMeasurementClick}
              handleRenameClick={handleRenameClick}
              setSelectedButton={setSelectedButton}
              deleteButton={handleButtonAction.delete}
              handleMovementButton={handleMovementButton}
              selectedButton={selectedButton}
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

        <div className={`${!showControls && sidebarStates.right ? 'w-full lg:w-64 flex-shrink-0' : ''}`}>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99999] p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-lg shadow-lg w-full max-w-md mx-2 sm:mx-4">
            <h2 className="text-base sm:text-lg font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">اختر الصفحة</h2>
            <ul className="space-y-1.5 sm:space-y-2 max-h-[60vh] overflow-y-auto">
              {pages.map((page) => (
                <li key={page.id}>
                  <button
                    onClick={() => handleFooterAction(page.id)}
                    className="block w-full p-2 sm:p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                  >
                    {page.name}
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowPagePopup(false)}
              className="mt-3 sm:mt-4 w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm sm:text-base"
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
