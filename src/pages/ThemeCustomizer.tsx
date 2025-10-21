import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Button from '../components/Button';

const ThemeCustomizer: React.FC = () => {
  const { buttonColors, updateButtonColors, resetToDefault, loading } = useTheme();
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'outline' | 'ghost' | 'gradient'>('primary');

  const handleColorChange = async (variant: string, property: string, value: string) => {
    try {
      setSaving(true);
      await updateButtonColors({
        [variant]: {
          ...buttonColors[variant as keyof typeof buttonColors],
          [property]: value,
        },
      } as any);
    } catch (error) {
      console.error('Error updating color:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('هل أنت متأكد من إعادة جميع الألوان للوضع الافتراضي؟')) {
      try {
        setResetting(true);
        await resetToDefault();
        alert('✅ تم إعادة الألوان للوضع الافتراضي');
      } catch (error) {
        alert('❌ حدث خطأ أثناء إعادة الألوان');
      } finally {
        setResetting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-boxdark-2 dark:to-boxdark p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                🎨 تخصيص ألوان الأزرار
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                قم بتخصيص ألوان الأزرار وحفظها في قاعدة البيانات
              </p>
            </div>
            <Button 
              variant="danger" 
              onClick={handleReset}
              loading={resetting}
              size="lg"
            >
              إعادة للافتراضي
            </Button>
          </div>
        </div>

        {/* Preview Section */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">معاينة مباشرة</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="gradient">Gradient</Button>
          </div>
        </div>

        {/* Color Customization */}
        <div className="bg-white dark:bg-boxdark rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">تخصيص الألوان</h2>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-strokedark pb-4">
            {(['primary', 'secondary', 'success', 'danger', 'warning', 'outline', 'ghost', 'gradient'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-boxdark-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-strokedark'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Color Pickers */}
          <div className="space-y-6">
            {activeTab === 'primary' && (
              <ColorEditor
                title="Primary Button"
                colors={buttonColors.primary}
                onChange={(property, value) => handleColorChange('primary', property, value)}
                fields={['background', 'backgroundHover', 'text']}
              />
            )}

            {activeTab === 'secondary' && (
              <ColorEditor
                title="Secondary Button"
                colors={buttonColors.secondary}
                onChange={(property, value) => handleColorChange('secondary', property, value)}
                fields={['background', 'backgroundHover', 'text']}
              />
            )}

            {activeTab === 'success' && (
              <ColorEditor
                title="Success Button"
                colors={buttonColors.success}
                onChange={(property, value) => handleColorChange('success', property, value)}
                fields={['background', 'backgroundHover', 'text']}
              />
            )}

            {activeTab === 'danger' && (
              <ColorEditor
                title="Danger Button"
                colors={buttonColors.danger}
                onChange={(property, value) => handleColorChange('danger', property, value)}
                fields={['background', 'backgroundHover', 'text']}
              />
            )}

            {activeTab === 'warning' && (
              <ColorEditor
                title="Warning Button"
                colors={buttonColors.warning}
                onChange={(property, value) => handleColorChange('warning', property, value)}
                fields={['background', 'backgroundHover', 'text']}
              />
            )}

            {activeTab === 'outline' && (
              <ColorEditor
                title="Outline Button"
                colors={buttonColors.outline}
                onChange={(property, value) => handleColorChange('outline', property, value)}
                fields={['border', 'borderHover', 'text', 'textHover']}
              />
            )}

            {activeTab === 'ghost' && (
              <ColorEditor
                title="Ghost Button"
                colors={buttonColors.ghost}
                onChange={(property, value) => handleColorChange('ghost', property, value)}
                fields={['text', 'textHover', 'backgroundHover']}
              />
            )}

            {activeTab === 'gradient' && (
              <ColorEditor
                title="Gradient Button"
                colors={buttonColors.gradient}
                onChange={(property, value) => handleColorChange('gradient', property, value)}
                fields={['background', 'text']}
              />
            )}
          </div>

          {saving && (
            <div className="mt-6 p-4 bg-primary bg-opacity-10 border border-primary rounded-lg text-center">
              <p className="text-primary font-medium">جاري الحفظ في قاعدة البيانات...</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 dark:bg-boxdark-2 rounded-xl p-6 border border-blue-200 dark:border-strokedark">
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-400 mb-3">📝 ملاحظات:</h3>
          <ul className="space-y-2 text-blue-800 dark:text-blue-300">
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>يتم حفظ التغييرات تلقائياً في قاعدة البيانات Firestore</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>التغييرات تنطبق على جميع المستخدمين في الوقت الفعلي</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>يمكنك استخدام أكواد الألوان HEX أو RGB أو linear-gradient</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2">•</span>
              <span>مثال على gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Color Editor Component
interface ColorEditorProps {
  title: string;
  colors: Record<string, string>;
  onChange: (property: string, value: string) => void;
  fields: string[];
}

const ColorEditor: React.FC<ColorEditorProps> = ({ title, colors, onChange, fields }) => {
  const getLabel = (field: string) => {
    const labels: Record<string, string> = {
      background: 'لون الخلفية',
      backgroundHover: 'لون الخلفية عند التمرير',
      text: 'لون النص',
      textHover: 'لون النص عند التمرير',
      border: 'لون الحدود',
      borderHover: 'لون الحدود عند التمرير',
    };
    return labels[field] || field;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h3>
      {fields.map((field) => (
        <div key={field} className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {getLabel(field)}
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={colors[field] || ''}
              onChange={(e) => onChange(field, e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-strokedark rounded-lg bg-white dark:bg-boxdark-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="مثال: #3C50E0 أو linear-gradient(...)"
              dir="ltr"
            />
            <div
              className="w-16 h-10 rounded-lg border-2 border-gray-300 dark:border-strokedark"
              style={{ background: colors[field] }}
            ></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ThemeCustomizer;

