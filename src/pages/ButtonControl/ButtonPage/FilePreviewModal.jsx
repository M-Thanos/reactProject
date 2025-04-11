import { FaImage, FaFile, FaDownload, FaVideo, FaFilePdf, FaFileWord, FaFileExcel, FaFilePowerpoint, FaEye } from 'react-icons/fa';

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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999999]">
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

  export default FilePreviewModal;