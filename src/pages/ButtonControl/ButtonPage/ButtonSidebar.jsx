import { FaPlus, FaTimes } from 'react-icons/fa';
import { useRef, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { BsTrash } from 'react-icons/bs';
// استبدال axios و API_ENDPOINTS بـ Firestore
import {
  addPage,
  deletePage,
  getAllPages,
} from '../../../config/firestore';

const ButtonSidebar = ({
  toggleButtonSidebar,
  setShowButtonSidebar,
  showButtonSidebar,
  pages,
  setCurrentPageId,
  currentPageId,
  showControls,
  setPages,
  sidebarStates = { right: false },
}) => {
  const sidebarRef = useRef();
  const [newPageName, setNewPageName] = useState('');
  const [showNewPageInput, setShowNewPageInput] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pageToDelete, setPageToDelete] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setShowButtonSidebar(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setShowButtonSidebar]);

  const handleAddNewPage = async () => {
    if (!newPageName.trim()) {
      toast.error('الرجاء إدخال اسم للصفحة');
      return;
    }

    try {
      const pageData = {
        name: newPageName.trim(),
        title: newPageName.trim(),
        isActive: true,
        is_active: true,
        order: pages.length + 1,
      };

      const createdPage = await addPage(pageData);
      console.log('✅ تم إنشاء الصفحة:', createdPage);

      const newPage = {
        ...createdPage,
        buttons: [],
      }; 
      
      setPages((prevPages) => [...prevPages, newPage]);
      setNewPageName('');
      setShowNewPageInput(false);
      toast.success('تم إنشاء الصفحة بنجاح');
      
      // تحديث البيانات من Firestore
      const allPages = await getAllPages();
      if (allPages && Array.isArray(allPages)) {
        setPages(allPages.map(page => ({
          ...page,
          buttons: page.buttons || []
        })));
      }
    } catch (error) {
      console.error('❌ خطأ في إنشاء الصفحة:', error);
      toast.error('حدث خطأ أثناء إنشاء الصفحة');
    }
  };

  const handleDeletePage = async (pageId, event) => {
    event.stopPropagation();

    if (pages.length <= 1) {
      toast.error('لا يمكن حذف الصفحة الوحيدة');
      return;
    }

    setPageToDelete(pageId);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      await deletePage(pageToDelete);
      console.log('✅ تم حذف الصفحة من Firestore');
      
      const updatedPages = pages.filter(page => page.id !== pageToDelete);
      setPages(updatedPages);

      if (pageToDelete === currentPageId) {
        setCurrentPageId(updatedPages[0]?.id);
      }

      toast.success('تم حذف الصفحة بنجاح');
    } catch (error) {
      console.error('❌ خطأ في حذف الصفحة:', error);
      toast.error('حدث خطأ أثناء حذف الصفحة');
    } finally {
      setShowDeleteConfirm(false);
      setPageToDelete(null);
    }
  };

  return (
    <>
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 bottom-0 right-5 w-64 mt-20 bg-white dark:bg-gray-800 shadow-lg transform transition-all duration-300 ease-linear z-[9999]
          ${
            (showControls && showButtonSidebar) || (!showControls && sidebarStates?.right)
              ? 'translate-x-0'
              : 'translate-x-full opacity-0'
          }
        `}
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">
              الصفحات
            </h2>
            {showControls && (
              <button
                onClick={toggleButtonSidebar}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <FaTimes />
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`w-full flex justify-between items-center text-right p-3 rounded-lg transition-colors duration-200
                    ${
                      page.id === currentPageId
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  <button
                    className={`text-red-500 hover:text-red-700 p-2 rounded-lg
                      ${page.id === currentPageId ? 'bg-white' : 'bg-gray-200'}
                      hover:bg-red-100 transition-colors duration-200`}
                    onClick={(e) => handleDeletePage(page.id, e)}
                  >
                    <BsTrash className="w-4 h-4" />
                  </button>
                  <span 
                    className="flex-1 text-right cursor-pointer"
                    onClick={() => setCurrentPageId(page.id)}
                  >
                    {page.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {showControls && (
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {showNewPageInput ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="اسم الصفحة الجديدة"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddNewPage();
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddNewPage}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                    >
                      إضافة
                    </button>
                    <button
                      onClick={() => {
                        setShowNewPageInput(false);
                        setNewPageName('');
                      }}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowNewPageInput(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <FaPlus />
                  <span>إضافة صفحة جديدة</span>
                </button>
              )}
            </div>
          )}
        </div>
      </aside>

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white text-center">
              تأكيد الحذف
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
              هل أنت متأكد من حذف هذه الصفحة؟
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                حذف
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setPageToDelete(null);
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors duration-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ButtonSidebar;
