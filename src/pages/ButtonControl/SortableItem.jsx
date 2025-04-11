import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BsPinAngleFill } from 'react-icons/bs';
import { FcOk } from 'react-icons/fc';

export default function SortableItem({ id, button, onClick, selectedButton, showControls }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id,
      disabled: showControls ? button.is_fixed : false,
    });

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
      className={`w-full flex items-center justify-center gap-2 py-2 px-4 rounded shadow
        ${showControls 
          ? `${button.is_fixed ? 'text-white hover:bg-gray-400' : ''} 
             ${selectedButton?.id === button.id ? 'bg-green-300 hover:bg-green-300 text-black font-bold' : ''}`
          : 'hover:opacity-90'
        } 
        focus:outline-none`}
    >
      {(showControls && button.is_fixed && <BsPinAngleFill />) ||
        (selectedButton?.id === button.id && <FcOk />)}
      {buttonText}
    </button>
  );
}
