import { FaMusic } from 'react-icons/fa';

const ImageModal = ({ imageUrl, onClose, mediaType }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999999]">
        <div
          className="w-[95vw] lg:w-[50vw] absolute top-1/2 lg:left-1/2 left-[48.5%] -translate-x-1/2 -translate-y-1/2 
        bg-white dark:bg-gray-600 p-3 py-14 pb-8 rounded-lg"
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 bg-black-2 text-white cursor-pointer rounded-full p-1 px-[9px]"
          >
            ✕
          </button>
  
          {mediaType === 'image' ? (
            <img
              src={imageUrl}
              alt="صورة"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          ) : mediaType === 'video' ? (
            <video
              controls
              autoPlay
              className="w-full h-auto max-h-[80vh] rounded-lg"
            >
              <source src={imageUrl} type="video/mp4" />
              متصفحك لا يدعم تشغيل الفيديو
            </video>
          ) : mediaType === 'audio' ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <FaMusic size={64} className="text-yellow-500" />
              <audio controls className="w-full max-w-md">
                <source src={imageUrl} type="audio/mpeg" />
                متصفحك لا يدعم تشغيل الصوت
              </audio>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  export default ImageModal;