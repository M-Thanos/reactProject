import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getPageDataByLinkId } from '../config/firestore';
import ButtonArea from './ButtonControl/ButtonPage/ButtonArea';
import { FaSpinner, FaExclamationTriangle } from 'react-icons/fa';

/**
 * صفحة عرض الصفحة المخصصة
 * تعرض الصفحة والأزرار بناءً على الرابط الفريد
 */
const PageViewPage = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [pageData, setPageData] = useState(null);
  const [error, setError] = useState(null);
  const [buttons, setButtons] = useState([]);
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [buttonPositions, setButtonPositions] = useState({});

  // useEffect الأول: جلب بيانات الصفحة
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError(null);

        // جلب بيانات الصفحة والأزرار
        console.log('🔍 جلب بيانات الصفحة للرابط:', linkId);
        const data = await getPageDataByLinkId(linkId);
        
        if (!data) {
          throw new Error('الرابط غير صالح');
        }

        setPageData(data);
        setPages(data.pages || [data.page]);
        setButtons(data.buttons || []);
        setCurrentPageId(data.page?.id);
        setButtonPositions(data.buttonPositions || {});
        console.log('✅ تم جلب بيانات الصفحة بنجاح');
        console.log('📍 مواقع الأزرار:', data.buttonPositions);
        console.log('🔘 الأزرار:', data.buttons);
        console.log('📄 جميع الصفحات:', data.pages);
      } catch (err) {
        console.error('❌ خطأ في جلب بيانات الصفحة:', err);
        setError(err.message || 'حدث خطأ في جلب البيانات');
        toast.error(err.message || 'حدث خطأ في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    if (linkId) {
      fetchPageData();
    } else {
      setError('رابط غير صالح');
      setLoading(false);
    }
  }, [linkId]);

  // useEffect الثاني: تحديث الأزرار عند تغيير الصفحة الحالية
  useEffect(() => {
    if (pages && currentPageId) {
      const currentPage = pages.find((p) => p.id === currentPageId);
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

  const { page, marketer } = pageData;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Header جميل */}
      <header className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* اسم الصفحة */}
            <div className="text-center sm:text-right">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                {page?.name || page?.title || 'صفحة تفاعلية'}
              </h1>
              <p className="text-blue-100 text-sm sm:text-base">
                استمتع بتجربة تفاعلية مخصصة
              </p>
            </div>
            
            {/* معلومات إضافية */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
              {marketer && (
                <div className="bg-white bg-opacity-20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p className="text-sm text-blue-100">من المسوق:</p>
                  <p className="font-semibold">{marketer.name}</p>
                  {marketer.discount_code && (
                    <p className="text-xs text-blue-200 mt-1">
                      كود الخصم: {marketer.discount_code}
                    </p>
                  )}
                </div>
              )}
              
              {/* أيقونة الصفحة */}
              <div className="bg-white bg-opacity-20 backdrop-blur-sm p-3 rounded-full">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* عرض الصفحة بنفس التصميم الأصلي */}
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-3 h-[calc(100vh-120px)] overflow-hidden bg-white dark:bg-gray-900">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="flex py-1 sm:py-2 md:py-3 flex-1 overflow-hidden">
            <ButtonArea
              buttons={buttons}
              setButtons={setButtons}
              pages={pages}
              currentPageId={currentPageId}
              setCurrentPageId={setCurrentPageId}
              showControls={false}
              clientButtonArea={true}
              isClientView={true}
              marketerInfo={marketer}
              providedPositions={buttonPositions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageViewPage;
