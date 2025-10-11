import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/themes/material_blue.css';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaArrowLeft, 
  FaUser,
  FaEnvelope,
  FaPhone,
  FaTag,
  FaPercentage,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
  FaCalendarAlt,
  FaClock,
} from 'react-icons/fa';
import {
  getAllMarketers,
  addMarketer,
  updateMarketer,
  deleteMarketer,
  validateDiscountCode,
} from '../config/firestore';

const MarketersListPage = () => {
  const navigate = useNavigate();
  const [marketers, setMarketers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMarketer, setEditingMarketer] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    discount_code: '',
    discount_value: 0,
    operation_type: '%',
    calculation_type: '+', // للعمليات الحسابية عند اختيار قيمة ثابتة
    is_active: true,
    start_date: '', // تاريخ بدء الكود
    end_date: '', // تاريخ انتهاء الكود
  });

  // جلب المسوقين من Firestore
  const fetchMarketers = async () => {
    try {
      setLoading(true);
      const data = await getAllMarketers();
      console.log('Firestore Marketers:', data);
      setMarketers(data || []);
    } catch (error) {
      console.error('❌ خطأ في جلب المسوقين:', error);
      toast.error('حدث خطأ في جلب البيانات');
      setMarketers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketers();
  }, []);

  // فتح نموذج إضافة/تعديل
  const handleOpenModal = (marketer = null) => {
    if (marketer) {
      setEditingMarketer(marketer);
      setFormData({
        name: marketer.name,
        email: marketer.email,
        phone: marketer.phone,
        discount_code: marketer.discount_code,
        discount_value: marketer.discount_value,
        operation_type: marketer.operation_type,
        calculation_type: marketer.calculation_type || '+',
        is_active: marketer.is_active,
        start_date: marketer.start_date || marketer.startDate || '',
        end_date: marketer.end_date || marketer.endDate || '',
      });
    } else {
      setEditingMarketer(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        discount_code: '',
        discount_value: 0,
        operation_type: '%',
        calculation_type: '+',
        is_active: true,
        start_date: '',
        end_date: '',
      });
    }
    setShowModal(true);
  };

  // إغلاق النموذج
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMarketer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      discount_code: '',
      discount_value: 0,
      operation_type: '%',
      calculation_type: '+',
      is_active: true,
      start_date: '',
      end_date: '',
    });
  };

  // حفظ المسوق
  const handleSaveMarketer = async (e) => {
    e.preventDefault();
    
    // التحقق من البيانات
    if (!formData.name || !formData.email || !formData.discount_code) {
      toast.error('الرجاء ملء جميع الحقول المطلوبة');
      return;
    }

    // التحقق من التواريخ
    if (formData.start_date && formData.end_date) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      
      if (endDate < startDate) {
        toast.error('تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء');
        return;
      }
    }

    try {
      const marketerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        discount_code: formData.discount_code.toUpperCase(),
        discountCode: formData.discount_code.toUpperCase(),
        discount_value: Number(formData.discount_value) || 0,
        discountValue: Number(formData.discount_value) || 0,
        operation_type: formData.operation_type || '%',
        operationType: formData.operation_type || '%',
        is_active: formData.is_active !== false,
        isActive: formData.is_active !== false,
        start_date: formData.start_date || null,
        startDate: formData.start_date || null,
        end_date: formData.end_date || null,
        endDate: formData.end_date || null,
      };

      // إضافة calculation_type فقط إذا كان operation_type = "fixed"
      if (formData.operation_type === 'fixed') {
        marketerData.calculation_type = formData.calculation_type || '+';
        marketerData.calculationType = formData.calculation_type || '+';
      }

      console.log('💾 حفظ بيانات المسوق:', marketerData);

      if (editingMarketer) {
        // تحديث مسوق موجود
        await updateMarketer(editingMarketer.id, marketerData);
        toast.success('تم تحديث بيانات المسوق بنجاح');
      } else {
        // إضافة مسوق جديد
        await addMarketer(marketerData);
        toast.success('تم إضافة المسوق بنجاح');
      }
      
      fetchMarketers();
      handleCloseModal();
    } catch (error) {
      console.error('❌ خطأ في حفظ المسوق:', error);
      
      // معالجة الأخطاء
      if (error.message.includes('البريد') || error.message.includes('email')) {
        toast.error('⚠️ هذا البريد الإلكتروني مسجل مسبقاً! الرجاء استخدام بريد آخر');
      } else if (error.message.includes('كود') || error.message.includes('discount')) {
        toast.error('⚠️ كود الخصم مستخدم بالفعل! الرجاء استخدام كود آخر');
      } else {
        toast.error(`خطأ: ${error.message || 'حدث خطأ أثناء حفظ البيانات'}`);
      }
    }
  };

  // حذف مسوق
  const handleDeleteMarketer = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المسوق؟')) {
      return;
    }

    try {
      await deleteMarketer(id);
      toast.success('تم حذف المسوق بنجاح');
      fetchMarketers();
    } catch (error) {
      console.error('❌ خطأ في حذف المسوق:', error);
      toast.error('حدث خطأ أثناء الحذف');
    }
  };

  // تبديل حالة التفعيل
  const handleToggleActive = async (marketer) => {
    try {
      await updateMarketer(marketer.id, {
        is_active: !marketer.is_active,
        isActive: !marketer.is_active,
      });
      toast.success(marketer.is_active ? 'تم تعطيل المسوق' : 'تم تفعيل المسوق');
      fetchMarketers();
    } catch (error) {
      console.error('❌ خطأ في تحديث الحالة:', error);
      toast.error('حدث خطأ أثناء تحديث الحالة');
    }
  };

  // التحقق من صلاحية الكود حسب التاريخ
  const getCodeStatus = (marketer) => {
    const now = new Date();
    
    // التحقق من تاريخ البدء
    if (marketer.start_date || marketer.startDate) {
      const startDate = new Date(marketer.start_date || marketer.startDate);
      if (now < startDate) {
        return { status: 'pending', text: 'لم يبدأ بعد', color: 'bg-yellow-100 text-yellow-800' };
      }
    }
    
    // التحقق من تاريخ الانتهاء
    if (marketer.end_date || marketer.endDate) {
      const endDate = new Date(marketer.end_date || marketer.endDate);
      if (now > endDate) {
        return { status: 'expired', text: 'منتهي', color: 'bg-red-100 text-red-800' };
      }
    }
    
    return { status: 'active', text: 'نشط', color: 'bg-green-100 text-green-800' };
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
      {/* الهيدر */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <FaArrowLeft />
                <span>العودة</span>
              </button>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                قائمة المسوقين
              </h1>
            </div>
            <button
              onClick={() => handleOpenModal()}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors"
            >
              <FaPlus />
              <span>إضافة مسوق جديد</span>
            </button>
          </div>
        </div>

        {/* الجدول */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : marketers.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-12 text-center">
            <FaUser className="text-6xl text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl text-gray-600 dark:text-gray-400 mb-2">
              لا يوجد مسوقين حالياً
            </h3>
            <p className="text-gray-500 dark:text-gray-500">
              قم بإضافة مسوق جديد للبدء
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-blue-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-right text-sm font-semibold">#</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">الاسم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">البريد الإلكتروني</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">الهاتف</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">كود الخصم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">قيمة الخصم</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">نوع العملية</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">تاريخ البدء</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">تاريخ الانتهاء</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">حالة الكود</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">الحالة</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {marketers.map((marketer, index) => (
                    <tr 
                      key={marketer.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        !marketer.is_active ? 'opacity-60' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-blue-500" />
                          {marketer.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-gray-500" />
                          {marketer.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-gray-500" />
                          {marketer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-3 py-1 rounded-full font-semibold">
                          {marketer.discount_code}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <span className="font-bold text-green-600 dark:text-green-400">
                          {marketer.discount_value}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        <div className="flex flex-col gap-1">
                          <span className={`px-3 py-1 rounded-full font-semibold text-center ${
                            marketer.operation_type === '%' 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                              : 'bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200'
                          }`}>
                            {marketer.operation_type === '%' ? 'نسبة مئوية' : 'قيمة ثابتة'}
                          </span>
                          {marketer.operation_type === 'fixed' && marketer.calculation_type && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-center font-bold">
                              {marketer.calculation_type === '+' && '➕ جمع'}
                              {marketer.calculation_type === '-' && '➖ طرح'}
                              {marketer.calculation_type === '*' && '✖️ ضرب'}
                              {marketer.calculation_type === '/' && '➗ قسمة'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {(marketer.start_date || marketer.startDate) ? (
                          <div className="flex items-center gap-2">
                            <FaCalendarAlt className="text-blue-500" />
                            <span>{new Date(marketer.start_date || marketer.startDate).toLocaleDateString('ar-SA')}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">غير محدد</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                        {(marketer.end_date || marketer.endDate) ? (
                          <div className="flex items-center gap-2">
                            <FaClock className="text-red-500" />
                            <span>{new Date(marketer.end_date || marketer.endDate).toLocaleDateString('ar-SA')}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">غير محدد</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {(() => {
                          const codeStatus = getCodeStatus(marketer);
                          return (
                            <span className={`px-3 py-1 rounded-full font-semibold ${codeStatus.color}`}>
                              {codeStatus.text}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleToggleActive(marketer)}
                          className="flex items-center gap-2"
                        >
                          {marketer.is_active ? (
                            <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                              <FaToggleOn className="text-2xl" />
                              <span className="font-semibold">مفعل</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-red-600 dark:text-red-400">
                              <FaToggleOff className="text-2xl" />
                              <span className="font-semibold">معطل</span>
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenModal(marketer)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors"
                            title="تعديل"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteMarketer(marketer.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* نموذج إضافة/تعديل */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 flex justify-between items-center rounded-t-lg">
              <h2 className="text-2xl font-bold">
                {editingMarketer ? 'تعديل بيانات المسوق' : 'إضافة مسوق جديد'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-2xl" />
              </button>
            </div>

            <form onSubmit={handleSaveMarketer} className="p-6 space-y-6">
              {/* الاسم */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaUser className="inline ml-2" />
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="أدخل اسم المسوق"
                  required
                />
              </div>

              {/* البريد الإلكتروني */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaEnvelope className="inline ml-2" />
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="example@email.com"
                  required
                />
              </div>

              {/* الهاتف */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaPhone className="inline ml-2" />
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  placeholder="05xxxxxxxx"
                />
              </div>

              {/* كود الخصم */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <FaTag className="inline ml-2" />
                  كود الخصم *
                </label>
                <input
                  type="text"
                  value={formData.discount_code}
                  onChange={(e) => setFormData({ ...formData, discount_code: e.target.value.toUpperCase() })}
                  className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all font-mono"
                  placeholder="DISCOUNT10"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* قيمة الخصم */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    <FaPercentage className="inline ml-2" />
                    قيمة الخصم
                  </label>
                  <input
                    type="number"
                    value={formData.discount_value}
                    onChange={(e) => setFormData({ ...formData, discount_value: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* نوع العملية */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    نوع العملية
                  </label>
                  <select
                    value={formData.operation_type}
                    onChange={(e) => setFormData({ ...formData, operation_type: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-blue-500 focus:ring focus:ring-blue-200 transition-all"
                  >
                    <option value="%">نسبة مئوية (%)</option>
                    <option value="fixed">قيمة ثابتة</option>
                  </select>
                </div>
              </div>

              {/* العملية الحسابية - تظهر فقط عند اختيار "قيمة ثابتة" */}
              {formData.operation_type === 'fixed' && (
                <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    ⚙️ العملية الحسابية
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, calculation_type: '+' })}
                      className={`px-4 py-3 rounded-lg font-bold text-xl transition-all ${
                        formData.calculation_type === '+' 
                          ? 'bg-blue-500 text-white shadow-lg scale-105' 
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'
                      }`}
                    >
                      + جمع
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, calculation_type: '-' })}
                      className={`px-4 py-3 rounded-lg font-bold text-xl transition-all ${
                        formData.calculation_type === '-' 
                          ? 'bg-blue-500 text-white shadow-lg scale-105' 
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'
                      }`}
                    >
                      - طرح
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, calculation_type: '*' })}
                      className={`px-4 py-3 rounded-lg font-bold text-xl transition-all ${
                        formData.calculation_type === '*' 
                          ? 'bg-blue-500 text-white shadow-lg scale-105' 
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'
                      }`}
                    >
                      × ضرب
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, calculation_type: '/' })}
                      className={`px-4 py-3 rounded-lg font-bold text-xl transition-all ${
                        formData.calculation_type === '/' 
                          ? 'bg-blue-500 text-white shadow-lg scale-105' 
                          : 'bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-500'
                      }`}
                    >
                      ÷ قسمة
                    </button>
                  </div>
                </div>
              )}

              {/* تواريخ البدء والانتهاء */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-700 dark:to-gray-600 p-5 rounded-lg border-2 border-green-200 dark:border-green-600">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <FaCalendarAlt className="text-green-600" />
                  فترة صلاحية الكود
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* تاريخ البدء */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FaCalendarAlt className="inline ml-2 text-green-600" />
                      Start Date / تاريخ البدء
                    </label>
                    <Flatpickr
                      value={formData.start_date}
                      onChange={(dates) => {
                        if (dates.length > 0) {
                          const date = dates[0];
                          const formattedDate = date.toISOString().split('T')[0];
                          setFormData({ ...formData, start_date: formattedDate });
                        } else {
                          setFormData({ ...formData, start_date: '' });
                        }
                      }}
                      options={{
                        dateFormat: 'Y-m-d',
                        locale: 'en',
                        allowInput: true,
                        altInput: true,
                        altFormat: 'F j, Y',
                      }}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-green-500 focus:ring focus:ring-green-200 transition-all"
                      placeholder="Select start date / اختر تاريخ البدء"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" dir="rtl">
                      اتركه فارغاً للبدء فوراً
                    </p>
                  </div>

                  {/* تاريخ الانتهاء */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      <FaClock className="inline ml-2 text-red-600" />
                      End Date / تاريخ الانتهاء
                    </label>
                    <Flatpickr
                      value={formData.end_date}
                      onChange={(dates) => {
                        if (dates.length > 0) {
                          const date = dates[0];
                          const formattedDate = date.toISOString().split('T')[0];
                          setFormData({ ...formData, end_date: formattedDate });
                        } else {
                          setFormData({ ...formData, end_date: '' });
                        }
                      }}
                      options={{
                        dateFormat: 'Y-m-d',
                        locale: 'en',
                        allowInput: true,
                        altInput: true,
                        altFormat: 'F j, Y',
                        minDate: formData.start_date || null,
                      }}
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:border-red-500 focus:ring focus:ring-red-200 transition-all"
                      placeholder="Select end date / اختر تاريخ الانتهاء"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1" dir="rtl">
                      اتركه فارغاً للاستمرار بلا نهاية
                    </p>
                  </div>
                </div>
              </div>

              {/* حالة التفعيل */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                  تفعيل المسوق
                </label>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  {editingMarketer ? 'تحديث' : 'إضافة'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketersListPage;

