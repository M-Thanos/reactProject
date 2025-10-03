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
      backgroundColor: button.color || '#ffffff',
      color: button.text_color || '#000000',
      fontSize: '16px',
      borderRadius: '4px'
    };

    // في وضع التحكم
    if (showControls) {
      return {
        ...defaultStyles,
        backgroundColor: selectedButton?.id === button.id
          ? '#4ade80'
          : (button.is_fixed ? 'gray' : button.color || '#ffffff'),
        color: selectedButton?.id === button.id
          ? '#000'
          : (button.is_fixed ? '#fff' : button.text_color || '#000000'),
      };
    }

    // في وضع إخفاء التحكمات - نحتفظ بالشكل الأساسي
    return defaultStyles;
  };

  // النص الأساسي للزر
  const buttonText = button.name || `Button ${button.id}`;

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
