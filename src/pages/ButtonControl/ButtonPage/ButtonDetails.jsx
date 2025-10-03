import ReactDOM from 'react-dom';
import { FaImage, FaFile, FaDownload, FaVideo, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaEye, FaMusic } from 'react-icons/fa';
import { useState } from 'react';

const ImageModal = ({ imageUrl, onClose, mediaType }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]">
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
        ) : (
          <video
            controls
            autoPlay
            className="w-full h-auto max-h-[80vh] rounded-lg"
          >
            <source src={imageUrl} type="video/mp4" />
            متصفحك لا يدعم تشغيل الفيديو
          </video>
        )}
      </div>
    </div>
  );
};

const FilePreviewModal = ({ fileUrl, onClose, fileName }) => {
  const getFileType = (url) => {
    const extension = url?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'word';
    if (['xls', 'xlsx'].includes(extension)) return 'excel';
    if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
    return 'other';
  };

  const fileType = getFileType(fileUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
      <div className="w-[95vw] h-[90vh] lg:w-[80vw] absolute top-1/2 lg:left-1/2 left-[48.5%] -translate-x-1/2 -translate-y-1/2 
        bg-white dark:bg-gray-600 p-3 rounded-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-black-2 text-white cursor-pointer rounded-full p-1 px-[9px] z-10"
        >
          ✕
        </button>

        <div className="flex flex-col h-full">
          {/* عنوان الملف */}
          <div className="flex items-center justify-between p-2 border-b">
            <div className="flex items-center gap-2">
              {fileType === 'pdf' && <FaFilePdf className="text-red-500 text-xl" />}
              {fileType === 'word' && <FaFileWord className="text-blue-500 text-xl" />}
              {fileType === 'excel' && <FaFileExcel className="text-green-500 text-xl" />}
              {fileType === 'powerpoint' && <FaFilePowerpoint className="text-orange-500 text-xl" />}
              {fileType === 'other' && <FaFile className="text-gray-500 text-xl" />}
              <span className="font-medium">{fileName}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => window.open(fileUrl, '_blank')}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                <FaEye size={12} />
                فتح في نافذة جديدة
              </button>
              <a
                href={fileUrl}
                download={fileName}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
              >
                <FaDownload size={12} />
                تحميل
              </a>
            </div>
          </div>

          {/* محتوى الملف */}
          <div className="flex-1 relative mt-4">
            <iframe
              src={fileUrl}
              className="w-full h-full rounded-lg"
              style={{ minHeight: "calc(90vh - 100px)" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const MediaPreview = ({ mediaUrl, mediaType }) => {
  if (!mediaUrl) return null;

  const previewStyle = {
    maxWidth: '100px',
    maxHeight: '60px',
    objectFit: 'contain',
    borderRadius: '4px',
  };

  switch (mediaType) {
    case 'image':
      return <img src={mediaUrl} alt="معاينة" style={previewStyle} />;
    case 'video':
      return (
        <video style={previewStyle} muted>
          <source src={mediaUrl} type="video/mp4" />
        </video>
      );
    case 'audio':
      return (
        <audio controls style={{ width: '100%', height: '40px' }}>
          <source src={mediaUrl} type="audio/mpeg" />
        </audio>
      );
    default:
      return null;
  }
};

const ButtonDetails = ({ button, selectedButton, hoveredButton, pages }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  if (!(selectedButton?.id === button.id )) {
    return null;
  }
  //   console.log(selectedButton.media);

  const buttonElement = document.getElementById(`button-${button.id}`);
  if (!buttonElement) return null;

  const rect = buttonElement.getBoundingClientRect();

  const getMediaIcon = (mediaType) => {
    switch (mediaType) {
      case 'image':
        return <FaImage className="text-blue-500" />;
      case 'video':
        return <FaVideo className="text-blue-500" />;
      case 'audio':
        return <FaMusic className="text-blue-500" />;
      default:
        return <FaFile className="text-blue-500" />;
    }
  };

  const getMediaLabel = (mediaType) => {
    switch (mediaType) {
      case 'image':
        return 'الصورة';
      case 'video':
        return 'الفيديو';
      case 'audio':
        return 'الصوت';
      default:
        return 'الملف';
    }
  };

  return ReactDOM.createPortal(
    <>
      <div
        className="fixed z-[9999]"
        style={{
          top: `${rect.top - 10}px`,
          left: `${rect.left + rect.width / 2}px`,
          transform: 'translate(-50%, -100%)',
        }}
      >
        <div
          className="dark:bg-gray-800 dark:text-white bg-white text-right 
                      w-[280px] p-3 border rounded-lg shadow-xl
                      backdrop-blur-sm bg-opacity-95 dark:bg-opacity-95"
        >
          <div className="space-y-3">
            {/* اسم الزر */}
            <div className="flex justify-end gap-2 items-center border-b dark:border-gray-700 pb-2">
              <p className="text-sm font-medium">{button.name}</p>
              <p className="font-bold text-gray-600 dark:text-gray-400">
                : اسم الزر
              </p>
            </div>

            {/* نوع الوظيفة */}
            {button.type &&
              button.type !== 'empty' &&
              ((button.type === 'page' && button.target_page) ||
                (button.type === 'media' && button.media) ||
                (button.type === 'file' && button.file) ||
                (button.type === 'shape' && button.shape_details)) && (
                <div className="flex justify-end gap-2 items-center border-b dark:border-gray-700 pb-2">
                  <div className="flex items-center gap-1">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        button.type === 'media'
                          ? 'bg-purple-500'
                          : button.type === 'shape'
                          ? 'bg-green-500'
                          : 'bg-blue-500'
                      }`}
                    ></span>
                    <p className="text-sm font-medium">
                      {button.type === 'media'
                        ? 'فتح وسائط'
                        : button.type === 'shape'
                        ? 'شكل مخصص'
                        : button.type === 'file'
                        ? 'فتح ملف'
                        : 'الانتقال لصفحة'}
                    </p>
                  </div>
                  <p className="font-bold text-gray-600 dark:text-gray-400">
                    : نوع الوظيفة
                  </p>
                </div>
              )}

            {/* الصفحة المستهدفة */}
            {button.type === 'page' && button.target_page && (
              <div className="flex justify-end gap-2 items-center border-b dark:border-gray-700 pb-2">
                <p className="text-sm font-medium">
                  {pages?.find((page) => 
                    page.id === Number(button.target_page)
                  )?.name || 'صفحة غير معروفة'}
                </p>
                <p className="font-bold text-gray-600 dark:text-gray-400">
                  : الصفحة المستهدفة
                </p>
              </div>
            )}

            {/* تفاصيل الشكل المخصص */}
            {button.type === 'shape' && button.shape_details && (
              <div className="space-y-2">
                <p className="font-bold text-gray-600 dark:text-gray-400 border-b dark:border-gray-700 pb-1">
                  : تفاصيل الشكل
                </p>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: button.shape_details.background_color,
                      }}
                    ></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      :لون الخلفية
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{
                          backgroundColor: button.shape_details.text_color,
                        }}
                      ></div>
                      <p
                        className="text-sm"
                        style={{ color: button.shape_details.text_color }}
                      >
                        {button.shape_details.text || 'بدون نص'}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      :النص ولونه
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">{button.shape_details.font_size}px</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      :حجم الخط
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm">
                      {button.shape_details.border_radius}px
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      :استدارة الحواف
                    </p>
                  </div>

                  {/* إضافة الوظيفة في تفاصيل الشكل */}
                  {button.shape_details.action &&
                    button.shape_details.action.type !== 'none' && (
                      <div>
                        {button.shape_details.action.type === 'page' && (
                          <p>
                            الانتقال إلى صفحة:{' '}
                            {button.shape_details.action.target_page}
                          </p>
                        )}
                        {button.shape_details.action.type === 'media' && (
                          <button
                            onClick={() => {
                              setSelectedMedia(
                                button.shape_details.action.media_url,
                              );
                              setShowModal(true);
                            }}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center justify-center gap-2"
                          >
                            {button.shape_details.action.media_type ===
                            'image' ? (
                              <>
                                <FaImage size={12} />
                                فتح الصورة
                              </>
                            ) : button.shape_details.action.media_type ===
                              'video' ? (
                              <>
                                <FaVideo size={12} />
                                فتح الفيديو
                              </>
                            ) : (
                              <>
                                <FaFile size={12} />
                                فتح الملف
                              </>
                            )}
                          </button>
                        )}
                        {button.shape_details.action.type === 'file' && (
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-end gap-2 items-center">
                              <FaFile className="text-blue-500" />
                              <p className="font-bold text-gray-600 dark:text-gray-400">
                                : الملف المرفق
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <p
                                className="text-sm truncate w-full text-right"
                                title={button.shape_details.action.file_name}
                              >
                                {button.shape_details.action.file_name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(
                                  button.shape_details.action.file_size / 1024
                                ).toFixed(2)}{' '}
                                KB
                              </p>

                              <a
                                href={button.shape_details.action.file_url}
                                download={button.shape_details.action.file_name}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm mt-2"
                              >
                                <FaDownload size={12} />
                                تحميل الملف
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                </div>
              </div>
            )}

            {/* عرض تفاصيل الملف */}
            {button.type === 'file' && button.file && (
              <div className="flex flex-col gap-2 border-b dark:border-gray-700 pb-2">
                <div className="flex justify-end gap-2 items-center">
                  <FaFile className="text-blue-500" />
                  <p className="font-bold text-gray-600 dark:text-gray-400">
                    : الملف المرفق
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <p
                    className="text-sm truncate w-full text-right"
                    title={button.file}
                  >
                    {button.file.split('/').pop()}
                  </p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedFile({
                          url: button.file,
                          name: button.file.split('/').pop()
                        });
                        setShowFilePreview(true);
                      }}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                    >
                      <FaEye size={12} />
                      معاينة
                    </button>

                    <a
                      href={button.file}
                      download={button.file.split('/').pop()}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    >
                      <FaDownload size={12} />
                      تحميل
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* الوسائط المرفقة */}
            {button.type === 'media' && button.media && (
              <div className="flex flex-col gap-2 border-b dark:border-gray-700 pb-2">
                <div className="flex justify-end gap-2 items-center">
                  {getMediaIcon(button.media_type)}
                  <p className="font-bold text-gray-600 dark:text-gray-400">
                    : {getMediaLabel(button.media_type)} المرفق
                  </p>
                </div>

                <div className="w-full space-y-2">
                  <div className="flex justify-end">
                    <MediaPreview mediaUrl={button.media} mediaType={button.media_type} />
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMedia(button.media);
                      setShowModal(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-600 w-full text-white px-3 py-1 rounded"
                  >
                    {`عرض ${getMediaLabel(button.media_type)}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <ImageModal
          imageUrl={selectedMedia}
          onClose={() => setShowModal(false)}
          mediaType={
            button.media_type
              ? button.media_type
              : button.shape_details?.action?.media_type
          }
        />
      )}

      {showFilePreview && selectedFile && (
        <FilePreviewModal
          fileUrl={selectedFile.url}
          fileName={selectedFile.name}
          onClose={() => setShowFilePreview(false)}
        />
      )}
    </>,
    document.body,
  );
};

export default ButtonDetails;
