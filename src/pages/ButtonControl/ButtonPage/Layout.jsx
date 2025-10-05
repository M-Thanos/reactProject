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

  const [buttons, setButtons] = useState([]);

  // جلب البيانات من API
  useEffect(() => {
    const fetchPages = async () => {
      try {
        const response = await axios.get(
          'https://buttons-api-production.up.railway.app/api/pages',
        );
        console.log('Pages response:', response.data);
        
        // التحقق من وجود البيانات
        const pagesData = response.data?.data || response.data || [];
        
        if (!Array.isArray(pagesData)) {
          console.error('Pages data is not an array:', pagesData);
          toast.error('خطأ في تنسيق بيانات الصفحات');
          return;
        }

        // تحديث البيانات للتطابق مع API
        const pagesWithButtons = await Promise.all(
          pagesData.map(async (page) => {
            try {
              const buttonsResponse = await axios.get(
                `https://buttons-api-production.up.railway.app/api/buttons`,
                { params: { page_id: page.id } }
              );
              const buttonsData = buttonsResponse.data?.data || buttonsResponse.data || [];
              
              // تحليل shape_details إذا كانت JSON string
              const processedButtons = Array.isArray(buttonsData) ? buttonsData.map(btn => {
                if (btn.shape_details && typeof btn.shape_details === 'string') {
                  try {
                    btn.shape_details = JSON.parse(btn.shape_details);
                  } catch (e) {
                    console.error('Error parsing shape_details:', e);
                  }
                }
                return btn;
              }) : [];
              
              return {
                ...page,
                buttons: processedButtons.filter(btn => btn.page_id == page.id)
              };
            } catch (error) {
              console.error(`Error fetching buttons for page ${page.id}:`, error);
              return {
                ...page,
                buttons: []
              };
            }
          })
        );

        setPages(pagesWithButtons);

        // تعيين الصفحة الأولى كافتراضية
        if (!currentPageId && pagesWithButtons.length > 0) {
          setCurrentPageId(pagesWithButtons[0].id);
        }
      } catch (error) {
        console.error('Error fetching pages:', error);
        toast.error('حدث خطأ أثناء تحميل الصفحات');
        
        // إضافة صفحة افتراضية في حالة الخطأ
        setPages([{
          id: 1,
          name: 'الصفحة الرئيسية',
          title: 'الصفحة الرئيسية',
          is_active: true,
          buttons: []
        }]);
        setCurrentPageId(1);
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

  // تحديث البيانات
  const refreshData = async () => {
    try {
      const response = await axios.get('https://buttons-api-production.up.railway.app/api/pages');
      const pagesData = response.data?.data || response.data || [];
      
      if (!Array.isArray(pagesData)) {
        console.error('Pages data is not an array during refresh:', pagesData);
        return;
      }

      const pagesWithButtons = await Promise.all(
        pagesData.map(async (page) => {
          try {
            const buttonsResponse = await axios.get(
              `https://buttons-api-production.up.railway.app/api/buttons`,
              { params: { page_id: page.id } }
            );
            const buttonsData = buttonsResponse.data?.data || buttonsResponse.data || [];
            
            // تحليل shape_details إذا كانت JSON string
            const processedButtons = Array.isArray(buttonsData) ? buttonsData.map(btn => {
              if (btn.shape_details && typeof btn.shape_details === 'string') {
                try {
                  btn.shape_details = JSON.parse(btn.shape_details);
                } catch (e) {
                  console.error('Error parsing shape_details:', e);
                }
              }
              return btn;
            }) : [];
            
            return {
              ...page,
              buttons: processedButtons.filter(btn => btn.page_id == page.id)
            };
          } catch (error) {
            return {
              ...page,
              buttons: []
            };
          }
        })
      );
      setPages(pagesWithButtons);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  // تحديث الزر في API
  const updateButtonInAPI = async (buttonId, updatedData) => {
    try {
      const formData = new FormData();
      Object.entries(updatedData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          if (typeof value === 'object') {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        }
      });

      await axios.patch(
        `https://buttons-api-production.up.railway.app/api/buttons/${buttonId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      await refreshData();
      toast.success('تم تحديث الزر بنجاح');
    } catch (error) {
      console.error('Error updating button:', error);
      toast.error('حدث خطأ أثناء تحديث الزر');
    }
  };

  // إجراءات الأزرار
  const handleButtonAction = {
    addNew: async (shapeType = 'square') => {
      const currentPage = pages.find((page) => page.id === currentPageId);
      if (!currentPage) {
        toast.error('الرجاء اختيار صفحة أولاً');
        return;
      }

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

      try {
        const formData = new FormData();
        Object.entries(newButton).forEach(([key, value]) => {
          if (key === 'shape_details' && value) {
            formData.append(key, JSON.stringify(value));
          } else {
            formData.append(key, value);
          }
        });

        const buttonResponse = await axios.post(
          'https://buttons-api-production.up.railway.app/api/buttons',
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
          button: buttonResponse.data.data.id,
        };

        await axios.post(
          'https://buttons-api-production.up.railway.app/api/button-positions',
          buttonPosition,
        );

        await refreshData();
        toast.success(`تم إضافة ${shapeConfig.name} بنجاح`);
      } catch (error) {
        console.error('Error creating button:', error);
        toast.error('حدث خطأ أثناء إضافة الزر');
      }
    },

    duplicate: async () => {
      if (!selectedButton) {
        toast.warning('من فضلك اختر زرًا');
        return;
      }

      try {
        const formData = new FormData();
        formData.append('name', `${selectedButton.name} (نسخة)`);
        formData.append('type', selectedButton.type);
        formData.append('page_id', currentPageId);
        formData.append('height', selectedButton.height);
        formData.append('width', selectedButton.width);
        formData.append('is_active', selectedButton.is_active);
        formData.append('background_color', selectedButton.background_color || '#3b82f6');
        formData.append('text_color', selectedButton.text_color || '#000000');

        const buttonResponse = await axios.post(
          'https://buttons-api-production.up.railway.app/api/buttons',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );

        const buttonPosition = {
          x: 0,
          y: 0,
          button: buttonResponse.data.data.id,
        };

        await axios.post(
          'https://buttons-api-production.up.railway.app/api/button-positions',
          buttonPosition
        );

        await refreshData();
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
        try {
          // حذف الزر
          await axios.delete(`https://buttons-api-production.up.railway.app/api/buttons/${selectedButton.id}`);
          
          // حذف موقع الزر من قاعدة البيانات
          try {
            // الحصول على جميع المواقع والبحث عن موقع هذا الزر
            const positionsResponse = await axios.get('https://buttons-api-production.up.railway.app/api/button-positions/');
            const buttonPosition = positionsResponse.data.find(pos => pos.button == selectedButton.id);
            
            if (buttonPosition && buttonPosition.id) {
              await axios.delete(`https://buttons-api-production.up.railway.app/api/button-positions/${buttonPosition.id}/`);
            }
          } catch (posError) {
            console.warn('Error deleting button position:', posError);
            // لا نريد إيقاف العملية إذا فشل حذف الموقع
          }
          
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
          console.error('Error deleting button:', error);
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
      const newPage = {
        name: pageName,
        title: pageName,
        is_active: true
      };

      const response = await axios.post(
        'https://buttons-api-production.up.railway.app/api/pages',
        newPage
      );

      await refreshData();
      setCurrentPageId(response.data.data.id);
      toast.success('تم إضافة الصفحة بنجاح');
    } catch (error) {
      console.error('Error creating page:', error);
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
        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadResponse = await axios.post(
            'https://buttons-api-production.up.railway.app/api/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const updatedData = {
            type: 'media',
            media: uploadResponse.data.file.url,
            media_type: file.type.startsWith('image/') ? 'image' : 'video'
          };

          await updateButtonInAPI(selectedButton.id, updatedData);
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
          '.pdf', '.doc', '.docx', '.txt', '.xls', 
          '.xlsx', '.ppt', '.pptx', '.zip', '.rar'
        ];
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
          toast.error('نوع الملف غير مسموح به');
          return;
        }

        if (file.size > 10 * 1024 * 1024) {
          toast.error('حجم الملف كبير جداً. الحد الأقصى هو 10 ميجابايت');
          return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadResponse = await axios.post(
            'https://buttons-api-production.up.railway.app/api/upload',
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const updatedData = {
            type: 'file',
            file: uploadResponse.data.file.url,
            file_name: file.name,
            file_type: file.type
          };

          await updateButtonInAPI(selectedButton.id, updatedData);
          toast.success('تم إضافة الملف بنجاح');
        } catch (error) {
          console.error('Error uploading file:', error);
          toast.error('حدث خطأ أثناء رفع الملف');
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
              toggleShowMenu={toggleShowMenu}
              showMenu={showMenu}
              setShowMenu={setShowMenu}
              setShowRenameForm={setShowRenameForm}
              setShowColorPicker={setShowColorPicker}
              setMeasurementForm={setMeasurementForm}
            />
          )}

          <div className="flex py-3">
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
        <div className="absolute inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[99999]">
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
