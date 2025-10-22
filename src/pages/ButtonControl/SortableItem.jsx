import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsPinAngleFill } from 'react-icons/bs';
import { FcOk } from 'react-icons/fc';

export default function SortableItem({ id, button, onClick, selectedButton, showControls, buttons }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      disabled: showControls ? button.is_fixed : false,
    });

  // حساب نتيجة العملية الحسابية إذا كان الزر مرتبطاً بزر آخر
  const getCalculationResult = () => {
    if (!button.linked_buttons || !button.calculation?.enabled) {
      return null;
    }

    const linkedButton = buttons?.find((b) => b.id === button.linked_buttons);
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
        result = linkedClicks > 0 ? (buttonClicks / linkedClicks) * 100 : 0;
        break;
      default:
        result = 0;
    }

    return {
      value: result.toFixed(2),
      type: button.calculation.type,
      symbol: button.calculation.type === 'percentage' ? '%' : ''
    };
  };

  const calculationResult = getCalculationResult();

  // التحقق من وجود shape_details وتطبيق الأنماط المناسبة
  const getButtonStyles = () => {
    // دالة للتحقق من صحة اللون - تحسين التحقق من الألوان
    const isValidColor = (color) => {
      if (!color || color === '' || color === 'transparent') return false;
      // التحقق من صيغة الألوان الصحيحة
      if (typeof color !== 'string') return false;
      // التحقق من hex, rgb, rgba, أسماء الألوان
      return /^#[0-9A-Fa-f]{3,8}$|^rgb|^rgba|^hsl|^hsla|^[a-z]+$/i.test(color);
    };

    // دالة للحصول على اللون من مصادر متعددة
    const getBackgroundColor = () => {
      // للوسائط المستقلة، يجب أن يكون اللون شفاف دائماً
      if (button.type === 'standalone-media') {
        return 'transparent';
      }
      
      // الأولوية: shape_details.background_color > button.background_color > button.color > default
      const sources = [
        button.shape_details?.background_color,
        button.background_color,
        button.backgroundColor,
        button.color,
      ];
      
      for (const color of sources) {
        if (isValidColor(color)) {
          return color;
        }
      }
      
      return '#3b82f6'; // اللون الافتراضي
    };

    const getTextColor = () => {
      // الأولوية: shape_details.text_color > button.text_color > button.textColor > default
      const sources = [
        button.shape_details?.text_color,
        button.text_color,
        button.textColor,
      ];
      
      for (const color of sources) {
        if (isValidColor(color)) {
          return color;
        }
      }
      
      return '#ffffff'; // اللون الافتراضي
    };

    // الأنماط الأساسية للزر
    const backgroundColor = getBackgroundColor();
    const textColor = getTextColor();

    const defaultStyles = {
      transform: CSS.Transform.toString(transform),
      transition,
      height: '100%',
      backgroundColor: backgroundColor,
      color: textColor,
      fontSize: '14px',
      borderRadius: '4px',
      width: '100%',
      minWidth: '0',
      minHeight: '0',
      border: 'none',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxSizing: 'border-box',
      flexDirection: 'column',
      gap: '4px'
    };

    // تطبيق أنماط الشكل المخصص إذا كانت موجودة
    if (button.shape_details && button.type === 'shape') {
      const shapeStyle = button.shape_details.style || {};
      
      // تطبيق أنماط الشكل
      if (shapeStyle.clipPath) {
        defaultStyles.clipPath = shapeStyle.clipPath;
      }
      if (shapeStyle.borderRadius) {
        defaultStyles.borderRadius = shapeStyle.borderRadius;
      }
      
      if (button.shape_details.font_size) {
        defaultStyles.fontSize = `${button.shape_details.font_size}px`;
      }
      if (button.shape_details.border_radius) {
        defaultStyles.borderRadius = `${button.shape_details.border_radius}px`;
      }
    }

    // في وضع التحكم
    if (showControls) {
      const selectedStyle = {
        ...defaultStyles,
        backgroundColor: selectedButton?.id === button.id
          ? '#4ade80'
          : (button.is_fixed ? 'gray' : defaultStyles.backgroundColor),
        color: selectedButton?.id === button.id
          ? '#000'
          : (button.is_fixed ? '#fff' : defaultStyles.color),
      };
      
      // الحفاظ على clipPath في وضع التحكم إذا كان موجوداً
      if (defaultStyles.clipPath) {
        selectedStyle.clipPath = defaultStyles.clipPath;
      }
      
      return selectedStyle;
    }

    // في وضع إخفاء التحكمات - نحتفظ بالشكل الأساسي
    return defaultStyles;
  };

  // النص الأساسي للزر
  const buttonText = button.shape_details?.text || button.name || `شكل ${button.id}`;
  const isStandaloneMedia = button.type === 'standalone-media';

  const buttonStyles = getButtonStyles();
  
  return (
    <button
      ref={setNodeRef}
      style={buttonStyles}
      {...attributes}
      {...(showControls && button.is_fixed ? {} : listeners)}
      onClick={onClick}
      className={`w-full h-full flex flex-col items-center justify-center gap-1 focus:outline-none
        ${!showControls ? 'hover:opacity-90' : ''}
        ${showControls && button.is_fixed ? 'hover:bg-gray-400' : ''}
        ${showControls && selectedButton?.id === button.id ? 'font-bold' : ''}
        ${isStandaloneMedia ? 'shadow-none' : 'shadow'}`}
    >
      {/* إخفاء النص للوسائط المستقلة إلا في وضع التحكم */}
      {(!isStandaloneMedia || showControls) && (
        <div className="flex items-center justify-center gap-2">
          {(showControls && button.is_fixed && <BsPinAngleFill />) ||
            (selectedButton?.id === button.id && <FcOk />)}
          {buttonText}
        </div>
      )}
      
      {/* عرض نتيجة العملية الحسابية */}
      {calculationResult && !showControls && (
        <div className="text-xs mt-1 px-2 py-0.5 bg-black bg-opacity-20 rounded-full font-bold">
          النتيجة: {calculationResult.value}{calculationResult.symbol}
        </div>
      )}
    </button>
  );
}
