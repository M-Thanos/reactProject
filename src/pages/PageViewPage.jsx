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
        console.log('✅ تم جلب بيانات الصفحة بنجاح');
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

  const { page, buttons, marketer } = pageData;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* رأس الصفحة */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white py-6 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {page?.name || page?.title || 'صفحة مخصصة'}
            </h1>
            <p className="text-purple-100">
              استمتع بتجربة تفاعلية مخصصة
            </p>
            {marketer && (
              <div className="mt-4 inline-block bg-white bg-opacity-20 backdrop-blur-sm px-6 py-3 rounded-full">
                <p className="text-sm mb-1">من المسوق:</p>
                <p className="text-lg font-bold">
                  {marketer.name}
                </p>
                {marketer.discount_code && (
                  <p className="text-sm mt-1">
                    كود الخصم: {marketer.discount_code}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* منطقة العرض */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
          {/* منطقة الأزرار */}
          <div className="p-4">
            <ButtonArea
              buttons={buttons || []}
              pages={[page]}
              currentPageId={page?.id}
              setCurrentPageId={() => {}}
              isClientView={true}
              marketerInfo={marketer}
            />
          </div>
        </div>
      </div>

      {/* تذييل الصفحة */}
      <div className="mt-8 py-6 bg-gray-100 dark:bg-gray-800 text-center text-gray-600 dark:text-gray-400">
        <p>شكراً لزيارتك هذه الصفحة المخصصة</p>
        {marketer && (
          <p className="text-sm mt-2">تم تخصيص هذه الصفحة لك من قبل: {marketer.name}</p>
        )}
      </div>
    </div>
  );
};

export default PageViewPage;
