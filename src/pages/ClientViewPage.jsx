import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getMarketerByLinkId, getAllPagesWithButtons } from '../config/firestore';
import ButtonArea from './ButtonControl/ButtonPage/ButtonArea';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

/**
 * صفحة العرض الخاصة بالعملاء
 * تعرض المحتوى بناءً على الرابط الفريد للمسوق
 */
const ClientViewPage = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [marketer, setMarketer] = useState(null);
  const [error, setError] = useState(null);
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [buttons, setButtons] = useState([]);

  useEffect(() => {
    const fetchMarketerAndData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب بيانات المسوق بواسطة linkId
        console.log('🔍 جلب بيانات المسوق للرابط:', linkId);
        const marketerData = await getMarketerByLinkId(linkId);
        
        if (!marketerData) {
          throw new Error('الرابط غير صالح');
        }

        // التحقق من حالة المسوق
        if (!marketerData.is_active && !marketerData.isActive) {
          throw new Error('هذا الرابط غير مفعل حالياً');
        }

        // التحقق من تواريخ الصلاحية
        const now = new Date();
        
        if (marketerData.start_date || marketerData.startDate) {
          const startDate = new Date(marketerData.start_date || marketerData.startDate);
          if (now < startDate) {
            throw new Error(`هذا الرابط سيكون متاحاً في ${startDate.toLocaleDateString('ar-SA')}`);
          }
        }
        
        if (marketerData.end_date || marketerData.endDate) {
          const endDate = new Date(marketerData.end_date || marketerData.endDate);
          if (now > endDate) {
            throw new Error(`هذا الرابط انتهت صلاحيته في ${endDate.toLocaleDateString('ar-SA')}`);
          }
        }

        setMarketer(marketerData);

        // جلب الصفحات والأزرار
        console.log('📄 جلب الصفحات والأزرار...');
        const pagesData = await getAllPagesWithButtons();
        
        if (pagesData && pagesData.length > 0) {
          // تنسيق البيانات
          const formattedPages = pagesData.map((page) => ({
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
          if (formattedPages.length > 0) {
            setCurrentPageId(formattedPages[0].id);
            setButtons(formattedPages[0].buttons || []);
          }
        }

        console.log('✅ تم جلب البيانات بنجاح');
      } catch (err) {
        console.error('❌ خطأ في جلب البيانات:', err);
        setError(err.message || 'حدث خطأ في جلب البيانات');
        toast.error(err.message || 'حدث خطأ في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (linkId) {
      fetchMarketerAndData();
    } else {
      setError('رابط غير صالح');
      setLoading(false);
    }
  }, [linkId]);

  // تحديث الأزرار عند تغيير الصفحة
  useEffect(() => {
    if (pages && currentPageId) {
      const currentPage = pages.find((page) => page.id === currentPageId);
      if (currentPage) {
        setButtons(currentPage.buttons || []);
      }
    }
  }, [currentPageId, pages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-blue-500 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            جاري التحميل...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            يرجى الانتظار قليلاً
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            عذراً!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* رأس الصفحة - صفحة العميل */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              مرحباً بك في صفحة العميل
            </h1>
            <p className="text-green-100">
              استمتع بتجربة تسوق مخصصة لك
            </p>
            {marketer?.discount_code && (
              <div className="mt-4 inline-block bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
                <p className="text-sm mb-1">كود الخصم الخاص بك:</p>
                <p className="text-2xl font-bold tracking-wider">
                  {marketer.discount_code}
                </p>
                <p className="text-sm mt-1">
                  خصم {marketer.discount_value}{marketer.operation_type === '%' ? '%' : ' ريال'}
                </p>
                <p className="text-xs mt-2 opacity-80">
                  من المسوق: {marketer.name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* منطقة العرض */}
      <div className="max-w-7xl mx-auto p-4">
        {pages.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            {/* تبديل الصفحات إذا كان هناك أكثر من صفحة */}
            {pages.length > 1 && (
              <div className="bg-gray-100 dark:bg-gray-700 p-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex flex-wrap gap-2 justify-center">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setCurrentPageId(page.id)}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        currentPageId === page.id
                          ? 'bg-blue-500 text-white shadow-lg scale-105'
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-500'
                      }`}
                    >
                      {page.title || page.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* منطقة الأزرار */}
            <div className="p-4">
              <ButtonArea
                buttons={buttons}
                pages={pages}
                currentPageId={currentPageId}
                setCurrentPageId={setCurrentPageId}
                isClientView={true}
                marketerInfo={marketer}
              />
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-12 text-center">
            <h3 className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              لا يوجد محتوى متاح حالياً
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              يرجى المحاولة لاحقاً
            </p>
          </div>
        )}
      </div>

      {/* تذييل الصفحة */}
      <div className="mt-8 py-6 bg-gray-100 dark:bg-gray-800 text-center text-gray-600 dark:text-gray-400">
        <p>شكراً لزيارتك صفحة العميل</p>
        <p className="text-sm mt-2">تم تخصيص هذه الصفحة لك من قبل: {marketer?.name}</p>
        <p className="text-xs mt-1 opacity-70">للاستفسارات: {marketer?.email}</p>
      </div>
    </div>
  );
};

export default ClientViewPage;

