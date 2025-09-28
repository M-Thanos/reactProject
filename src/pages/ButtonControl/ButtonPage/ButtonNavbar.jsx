import React, { useState, useRef, useEffect } from 'react';
import { GiFlatHammer     } from 'react-icons/gi';
import { FaPlus } from 'react-icons/fa';
import { FaPenToSquare } from 'react-icons/fa6';
import { AiOutlineFullscreen } from 'react-icons/ai';
import { MdDelete } from 'react-icons/md';
import { AiOutlineMenu } from 'react-icons/ai';
import { toast } from 'react-toastify';

const ButtonNavbar = ({
  toggleButtonSidebar,
  toggleButtonLeftSidebar,
  showButtonSidebar,
  showButtonLeftSidebar,
  onMeasurementClick,
  handleRenameClick,
  deleteButton,
  setSelectedButton,
  updateButton,
  handleMovementButton,
  selectedButton,
  changeColor,
  handleButtonAction,
  toggleShowMenu,
  showMenu,
  setShowMenu,
  setShowRenameForm,
  setShowColorPicker,
  setMeasurementForm,
}) => {
  const dropdownRef = useRef(null); // Reference to the dropdown

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

  // console.log('selectedButton', selectedButton);

  const buttons = [
    {
      id: 1,
      name: 'حذف',
      icon: <MdDelete />,
      action: () => {
        if (!selectedButton) {
          toast.warning('الرجاء اختيار زر أولاً');
          return;
        }

        // تأكيد الحذف
        if (window.confirm('هل أنت متأكد من حذف هذا الزر؟')) {
          // حذف الزر من API
          fetch(
            `https://buttons-api-production.up.railway.app/api/buttons/${selectedButton.id}/`,
            {
              method: 'DELETE',
            },
          )
            .then((response) => {
              if (!response.ok) throw new Error('فشل حذف الزر');

              // حذف الزر محلياً
              deleteButton();
              toast.success('تم حذف الزر بنجاح');
            })
            .catch((error) => {
              console.error('Error deleting button:', error);
              toast.error('حدث خطأ أثناء حذف الزر');
            });
        }
      },
    },
    {
      id: 2,
      name: selectedButton?.isFixed ? ' تحريك' : 'تثبيت',
      icon: <GiFlatHammer     />,
      action: handleMovementButton,
    },
    {
      id: 3,
      name: 'الالوان',
      icon: <FaPlus />,
      action: () => {
        if (selectedButton) {
          setShowColorPicker(true);
        } else {
          alert('من فضلك اختر زرًا');
        }
      },
    },
    {
      id: 4,
      name: 'زياده العدد',
      icon: <FaPlus />,
      action: handleButtonAction.duplicate,
    },
    {
      id: 5,
      name: 'كتابة',
      icon: <FaPenToSquare />,
      action: () => {
        if (selectedButton) {
          setShowRenameForm(true);
        } else {
          toast.warning('من فضلك اختر زرًا!');
        }
      },
    },
    {
      id: 6,
      name: 'القياسات',
      icon: <AiOutlineFullscreen />,
      action: () => {
        if (selectedButton) {
          setMeasurementForm(true);
        } else {
          alert('من فضلك اختر زرًا');
        }
      },
    },
  ];

  return (
    <>
      <nav className="bg-white dark:bg-gray-800 text-white p-4 flex justify-between items-center shadow-lg shadow-gray-500/50 dark:shadow-none">
        <div className="ml-5">
          {!showButtonLeftSidebar && (
            <button
              onClick={toggleButtonLeftSidebar}
              className="text-gray-900 dark:text-white"
            >
              <AiOutlineMenu size={25} />
            </button>
          )}
        </div>
        <div className="container mx-auto xl:flex items-center justify-end gap-8 2xsm:hidden ">
          <ul className="flex gap-4">
            {buttons.map((button, index) => (
              <li key={index}>
                <button
                  onClick={button.action}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {button.icon} {button.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative" ref={dropdownRef}>
          <div className="xl:hidden lg:flex items-center justify-end">
            <button
              onClick={toggleShowMenu}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
            >
              خيارات إضافية
            </button>
          </div>

          {showMenu && (
            //  
            <div
              className={`xl:hidden flex z-99999
           absolute 
             mt-8 bg-white divide-y divide-gray-100 rounded-lg shadow w-64`}
            >
              <ul className="py-2 text-sm text-gray-700">
                {buttons.map((button, index) => (
                  <li className="p-2" key={index}>
                    <button
                      onClick={button.action}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded"
                    >
                      {button.icon} {button.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="ml-5">
          {!showButtonSidebar && (
            <button
              onClick={toggleButtonSidebar}
              className="text-gray-900 dark:text-white"
            >
              <AiOutlineMenu size={25} />
            </button>
          )}
        </div>
      </nav>
    </>
  );
};

export default ButtonNavbar;
