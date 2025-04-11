import { useEffect, useRef, useState } from 'react';
import {
  FaPlus,
  FaTimes,
  FaLink,
  FaList,
  FaEye,
  FaEyeSlash,
  FaArrowRight,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const ButtonLeftSidebar = ({
  toggleButtonLeftSidebar,
  setShowButtonLeftSidebar,
  showButtonLeftSidebar,
  pages,
  AddNewPage,
  setCurrentPageId,
  handleButtonAction,
  setShowLinkButtons,
  selectedButton,
  updateButton,
  showControls,
  setPages,
  sidebarStates = { left: false },
  updateButtonInAPI,
}) => {
  // حساب إجمالي عدد الأزرار في جميع الصفحات
  const totalButtons = pages.reduce(
    (total, page) => total + (page.buttons?.length || 0),
    0,
  );

  // إضافة state لعرض/إخفاء قائمة الأزرار
  const [showAllButtons, setShowAllButtons] = useState(false);

  // إضافة state لتخزين الأزرار المجمعة
  const [allButtonsState, setAllButtonsState] = useState([]);

  const sidebarRef = useRef();

  // إضافة useRef للاحتفاظ بالقيمة السابقة لـ showControls
  const prevShowControlsRef = useRef(showControls);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowButtonLeftSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowButtonLeftSidebar]);

  // تحديث الأزرار عند تغيير الصفحات
  useEffect(() => {
    // دمج جميع الأزرار من جميع الصفحات في مصفوفة واحدة
    const combinedButtons = pages.reduce((acc, page) => {
      return [
        ...acc,
        ...page.buttons.map((button) => ({
          ...button,
          pageName: page.name,
          pageId: page.id,
        })),
      ];
    }, []);

    // تحديث حالة الأزرار
    setAllButtonsState(combinedButtons);

    // تسجيل سجل لتتبع التغييرات
    // console.log(`Updated buttons list: ${combinedButtons.length} buttons`);
    // console.log(`Controls are currently ${showControls ? 'shown' : 'hidden'}`);
  }, [pages, showControls]);

  const handleLinkButton = (targetButtonId) => {
    if (!selectedButton) {
      toast.warning('الرجاء اختيار زر أولاً');
      return;
    }

    const updatedButton = {
      ...selectedButton,
      linked_buttons: targetButtonId,
      calculation: {
        type: selectedButton.calculation.type,
        enabled: true,
        clicks: selectedButton.clicks || 0,
      }
    };

    updateButton(selectedButton.id, updatedButton);

    // تحديث localStorage
    const updatedPages = pages.map((page) => ({
      ...page,
      buttons: page.buttons.map((button) =>
        button.id === selectedButton.id ? updatedButton : button,
      ),
    }));
    setPages(updatedPages);
    localStorage.setItem('pages', JSON.stringify(updatedPages));

    toast.success('تم ربط الزر بنجاح');
  };

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
        displayResult: selectedButton?.calculation?.displayResult || false,
      },
    };

    updateButton(selectedButton.id, updatedButton);

    // تحديث في API
    const formData = new FormData();
    formData.append('calculation', JSON.stringify(updatedButton.calculation));

    fetch(`https://buttons-back.cowdly.com/api/buttons/${selectedButton.id}/`, {
      method: 'PATCH',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('فشل تحديث نوع العملية');
        return response.json();
      })
      .catch((error) => {
        console.error('Error updating calculation type:', error);
        toast.error('حدث خطأ أثناء تحديث نوع العملية');
      });
  };

  const handleTimerUpdate = (timerData) => {
    if (!selectedButton) {
      toast.warning('الرجاء اختيار زر أولاً');
      return;
    }

    const updatedButton = {
      ...selectedButton,
      timer: {
        ...selectedButton.timer,
        ...timerData,
      },
    };

    // تحديث الزر في واجهة المستخدم
    updateButton(selectedButton.id, updatedButton);

    // تحديث الزر في API
    const formData = new FormData();
    formData.append('timer', JSON.stringify(updatedButton.timer));

    // إرسال التحديث إلى API
    fetch(`https://buttons-back.cowdly.com/api/buttons/${selectedButton.id}/`, {
      method: 'PATCH',
      body: formData,
    })
      .then((response) => {
        if (!response.ok) throw new Error('فشل تحديث المؤقت');
        return response.json();
      })
      .then(() => {
        toast.success('تم تحديث المؤقت بنجاح');
      })
      .catch((error) => {
        console.error('Error updating timer:', error);
        toast.error('حدث خطأ أثناء تحديث المؤقت');
      });
  };

  // دالة لعرض نتائج العمليات الحسابية
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

          // console.log(`Calculation Result for ${button.name} and ${linkedButton.name}:`, result);

          return (
            <div
              key={pairId}
              className="mb-4 bg-gray-100 dark:bg-gray-600 p-3 rounded"
            >
              <span>{button.calculation.type}</span>
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

  // تعديل دالة للتحكم في إظهار وإخفاء الزر
  const handleToggleButtonVisibility = async (buttonId) => {
    const targetButton = buttonId
      ? allButtonsState.find((b) => b.id === buttonId)
      : selectedButton;

    if (!targetButton) {
      toast.warning('الرجاء اختيار زر أولاً');
      return;
    }

    try {
      // تحديث حالة الزر محلياً
      const newIsActive = !targetButton.is_active;
      // console.log(`Toggling button ${targetButton.id} visibility to ${newIsActive ? 'visible' : 'hidden'}`);

      // تحديث الزر في API
      await updateButtonInAPI(targetButton.id, { is_active: newIsActive });

      // تحديث الصفحات المحلية (يمكن أن تتم عبر الاستجابة من updateButtonInAPI)
      const updatedPages = pages.map((page) => ({
        ...page,
        buttons: page.buttons.map((btn) =>
          btn.id === targetButton.id ? { ...btn, is_active: newIsActive } : btn,
        ),
      }));

      setPages(updatedPages);

      // أعد تحميل البيانات بعد فترة قصيرة للتأكد من التحديث
      setTimeout(() => {
        // تحديث القائمة المحلية
        const updatedAllButtons = updatedPages.reduce((acc, page) => {
          return [
            ...acc,
            ...page.buttons.map((button) => ({
              ...button,
              pageName: page.name,
              pageId: page.id,
            })),
          ];
        }, []);
        setAllButtonsState(updatedAllButtons);

        // إذا كنا في وضع الإخفاء وكان الزر مخفياً، حدث القائمة
        if (!showControls && !newIsActive) {
          const currentPage = updatedPages.find(
            (page) => page.id === currentPageId,
          );
          if (currentPage) {
            const visibleButtons = currentPage.buttons.filter(
              (button) => button.is_active !== false,
            );
            setButtons(visibleButtons);
          }
        }
      }, 200);

      toast.success(
        newIsActive ? 'تم إظهار الزر بنجاح' : 'تم إخفاء الزر بنجاح',
      );
    } catch (error) {
      console.error('Error toggling button visibility:', error);
      toast.error('حدث خطأ أثناء تحديث حالة الزر');
    }
  };

  // دالة لتحديد الزر المحدد
  const handleSelectButton = (button) => {
    // الانتقال إلى صفحة الزر أولاً
    setCurrentPageId(button.pageId);

    // ثم تحديد الزر
    setTimeout(() => {
      updateButton(button.id, button);
    }, 100);
  };

  return (
    <aside
      className={`
        fixed top-0 bottom-0 left-0 lg:left-0 w-64 mt-20 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-linear z-9999
        ${
          (showControls && showButtonLeftSidebar) ||
          (!showControls && sidebarStates?.left)
            ? 'translate-x-0'
            : '-translate-x-full opacity-0'
        }
      `}
    >
      <div className="flex flex-col h-full">
        {/* رأس السايدبار */}
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          {showControls && (
            <button
              onClick={toggleButtonLeftSidebar}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <FaTimes />
            </button>
          )}
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">
            {showControls ? 'لوحة التحكم' : 'نتائج العمليات'}
          </h2>
        </div>

        {/* محتوى السايدبار */}
        <div className="flex-1 overflow-y-auto p-2">
          {/* عرض نتائج العمليات فقط عندما يكون التحكم مخفياً */}
          {!showControls && (
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              {renderCalculationResults()}
            </div>
          )}

          {/* عرض عناصر التحكم فقط في وضع التحكم */}
          {showControls && (
            <>
              {/* قائمة الأزرار بتصميم مشابه للصورة */}
              <div className="bg-blue-50 dark:bg-gray-700 p-2 rounded-lg mb-4 text-wrap">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    جميع الأزرار
                  </h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {allButtonsState.length}
                  </span>
                </div>

                <div className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-600 rounded-lg shadow-sm max-h-[350px] overflow-y-auto w-full">
                  <div className="bg-blue-100 dark:bg-gray-700 px-4 py-2 border-b border-blue-200 dark:border-gray-600 flex justify-between items-center">
                    <span className="font-medium text-blue-900 dark:text-blue-300">
                      جميع الأزرار
                    </span>
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      ></path>
                    </svg>
                  </div>

                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {allButtonsState.map((button) => (
                      <li
                        key={button.id}
                        className={`flex items-center justify-between px-4 py-3 transition-colors duration-200
                          ${
                            button.is_active === false
                              ? 'bg-red-50 dark:bg-red-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }
                          ${
                            selectedButton?.id === button.id
                              ? 'border-l-4 border-blue-500'
                              : ''
                          }
                        `}
                      >
                        <div
                          className="flex items-center justify-center gap-2 w-2/3 "
                          onClick={() => handleSelectButton(button)}
                        >
                          <FaArrowRight className="w-4 h-4 flex-shrink-0 text-gray-500" />
                          <div className="flex flex-wrap">
                            <div className="flex gap-2 flex-col">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                {button.name || `زر ${button.id}`}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 text-nowrap">
                                الصفحة: {button.pageName}
                              </span>
                            </div>

                            {button.is_active === false && (
                              <span className="mt-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                مخفي
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-1/3 ml-auto flex justify-end">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleButtonVisibility(button.id);
                            }}
                            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                            title={
                              button.is_active !== false
                                ? 'إخفاء الزر'
                                : 'إظهار الزر'
                            }
                          >
                            {button.is_active !== false ? (
                              <svg
                                className="w-5 h-5 text-green-600 dark:text-green-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                ></path>
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                ></path>
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"
                                ></path>
                              </svg>
                            )}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* إضافة قسم إظهار/إخفاء الزر */}
              {/* {selectedButton && (
                <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    حالة الزر: {selectedButton.name}
                  </h3>
                  <div className="flex justify-between items-center">
                    <span className="text-gr{/* ay-600 dark:text-gray-300">
                      الحالة الحالية:
                    </span>
                    <span
                      className={`font-bold ${
                        selectedButton.is_active
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {selectedButton.is_active ? 'ظاهر' : 'مخفي'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600 dark:text-gray-300">
                      معرف الزر (ID):
                    </span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {selectedButton.id}
                    </span>
                  </div>
                  <button
                    onClick={handleToggleButtonVisibility}
                    className={`w-full mt-3 ${
                      selectedButton.is_active
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-green-500 hover:bg-green-600'
                    } text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2`}
                  >
                    {selectedButton.is_active ? 'إخفاء الزر' : 'إظهار الزر'}
                  </button>
                </div>
              )} */}

              {/* إحصائيات */}
              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  إحصائيات
                </h3>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-300">
                    عدد الأزرار:
                  </span> 
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {totalButtons}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-gray-600 dark:text-gray-300">
                    عدد الصفحات:
                  </span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">
                    {pages.length}
                  </span>
                </div>
              </div>

              {/* زر إضافة زر جديد */}
              <button
                onClick={handleButtonAction?.addNew}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg mb-4 flex items-center justify-center gap-2"
              >
                <FaPlus />
                <span>إضافة زر جديد</span>
              </button>

              {/* قائمة الصفحات */}
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  الصفحات
                </h3>
                <div className="space-y-2 h-[300px] overflow-y-auto">
                  {pages.map((page) => (
                    <div
                      key={page.id}
                      className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
                    >
                      <button
                        onClick={() => setCurrentPageId(page.id)}
                        className="text-gray-700 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400"
                      >
                        {page.name}
                      </button>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {page.buttons?.length || 0} أزرار
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* قسم ربط الأزرار */}
              <div className="bg-gray-50 dark:bg-gray-700 mt-4 p-1 rounded-lg">
                <h3 className="text-sm font-semibold mb-3">
                  ربط الأزرار والعمليات الحسابية
                </h3>

                {/* زر ربط الأزرار */}
                <button
                  onClick={() => setShowLinkButtons(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mb-4 flex items-center justify-center gap-2"
                >
                  <FaLink />
                  <span>ربط مع زر آخر</span>
                </button>

                {/* نوع العملية الحسابية */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    نوع العملية الحسابية:
                  </label>
                  <select
                    value={selectedButton?.calculation?.type}
                    onChange={handleCalculationTypeChange}
                    className="w-full p-2 rounded border dark:bg-gray-600"
                  >
                    <option value="add">جمع (+)</option>
                    <option value="subtract">طرح (-)</option>
                    <option value="multiply">ضرب (×)</option>
                    <option value="percentage">نسبة مئوية (%)</option>
                  </select>
                </div>

                {/* عرض النتائج */}
                <div className="h-[300px] overflow-y-auto w-full">
                  {renderCalculationResults()}
                </div>
              </div>

              {/* إضافة قسم إعدادات المؤقت بعد قسم ربط الأزرار والعمليات الحسابية */}
              <div className="bg-gray-50 dark:bg-gray-700 mt-4 p-4 rounded-lg">
                <h3 className="text-sm font-semibold mb-3">إعدادات المؤقت</h3>

                {/* تفعيل/تعطيل المؤقت */}
                <div className="mb-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedButton?.timer?.enabled || false}
                      onChange={(e) => {
                        handleTimerUpdate({
                          enabled: e.target.checked,
                          duration: selectedButton?.timer?.duration || 0,
                        });
                      }}
                      className="form-checkbox h-4 w-4 text-blue-500"
                    />
                    <span className="mr-2 text-sm">تفعيل المؤقت</span>
                  </label>
                </div>

                {/* إعدادات المؤقت - تظهر فقط عند تفعيل المؤقت */}
                {selectedButton?.timer?.enabled && (
                  <div className="space-y-4">
                    {/* مدة المؤقت */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        مدة المؤقت (بالثواني):
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selectedButton?.timer?.duration || 0}
                        onChange={(e) => {
                          // تحديث محلي فقط للقيمة
                          updateButton(selectedButton.id, {
                            ...selectedButton,
                            timer: {
                              ...selectedButton.timer,
                              duration: parseInt(e.target.value) || 0,
                            },
                          });
                        }}
                        onBlur={(e) => {
                          // إرسال إلى API عند الخروج من المربع
                          handleTimerUpdate({
                            ...selectedButton?.timer,
                            duration: parseInt(e.target.value) || 0,
                          });
                        }}
                        className="w-full p-2 rounded border dark:bg-gray-600"
                      />
                    </div>

                    {/* نوع المؤقت */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        نوع المؤقت:
                      </label>
                      <select
                        value={selectedButton?.timer?.type || 'countdown'}
                        onChange={(e) => {
                          handleTimerUpdate({
                            ...selectedButton?.timer,
                            type: e.target.value,
                          });
                        }}
                        className="w-full p-2 rounded border dark:bg-gray-600"
                      >
                        <option value="countdown">عد تنازلي</option>
                        <option value="cooldown">فترة انتظار</option>
                      </select>
                    </div>

                    {/* عرض المؤقت */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        عرض المؤقت:
                      </label>
                      <select
                        value={selectedButton?.timer?.display || 'none'}
                        onChange={(e) => {
                          handleTimerUpdate({
                            ...selectedButton?.timer,
                            display: e.target.value,
                          });
                        }}
                        className="w-full p-2 rounded border dark:bg-gray-600"
                      >
                        <option value="none">لا يوجد</option>
                        <option value="button">على الزر</option>
                        <option value="toast">إشعار منبثق</option>
                        <option value="both">كلاهما</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* معاينة المؤقت */}
                {selectedButton?.timer?.enabled &&
                  selectedButton?.timer?.duration > 0 && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-600 rounded">
                      <div className="text-sm text-center">
                        <span className="font-medium">معاينة المؤقت: </span>
                        <span className="text-blue-600 dark:text-blue-400">
                          {selectedButton.timer.duration} ثواني
                        </span>
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}
        </div>

        {/* زر إضافة صفحة جديدة */}
        {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={AddNewPage}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <FaPlus />
            <span>إضافة صفحة جديدة</span>
          </button>
        </div> */}
      </div>
    </aside>
  );
};

export default ButtonLeftSidebar;
