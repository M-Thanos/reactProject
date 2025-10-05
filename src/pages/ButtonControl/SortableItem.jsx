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
    // الأنماط الأساسية للزر
    const defaultStyles = {
      transform: CSS.Transform.toString(transform),
      transition,
      height: button.height,
      backgroundColor: button.background_color || button.color || '#3b82f6',
      color: button.text_color || '#ffffff',
      fontSize: '14px',
      borderRadius: '4px',
      width: button.width || 160,
      minWidth: '80px',
      minHeight: '40px'
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
      
      // تطبيق الألوان من shape_details إذا كانت موجودة
      if (button.shape_details.background_color) {
        defaultStyles.backgroundColor = button.shape_details.background_color;
      }
      if (button.shape_details.text_color) {
        defaultStyles.color = button.shape_details.text_color;
      }
      if (button.shape_details.font_size) {
        defaultStyles.fontSize = `${button.shape_details.font_size}px`;
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

  return (
    <button
      ref={setNodeRef}
      style={getButtonStyles()}
      {...attributes}
      {...(showControls && button.is_fixed ? {} : listeners)}
      onClick={onClick}
      className={`w-full flex flex-col items-center justify-center gap-1 py-2 px-4 rounded shadow focus:outline-none
        ${showControls 
          ? `${button.is_fixed ? 'text-white hover:bg-gray-400' : ''} 
             ${selectedButton?.id === button.id ? 'bg-green-300 hover:bg-green-300 text-black font-bold' : ''}`
          : 'hover:opacity-90'
        }`}
    >
      <div className="flex items-center justify-center gap-2">
        {(showControls && button.is_fixed && <BsPinAngleFill />) ||
          (selectedButton?.id === button.id && <FcOk />)}
        {buttonText}
      </div>
      
      {/* عرض نتيجة العملية الحسابية */}
      {calculationResult && !showControls && (
        <div className="text-xs mt-1 px-2 py-0.5 bg-black bg-opacity-20 rounded-full font-bold">
          النتيجة: {calculationResult.value}{calculationResult.symbol}
        </div>
      )}
    </button>
  );
}
