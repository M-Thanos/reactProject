import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Rnd } from 'react-rnd';
import SortableItem from '../SortableItem';
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
} from 'react-icons/fa';
import ButtonDetails from './ButtonDetails';
import { toast } from 'react-toastify';
import Button from '../../../components/Button';
// استبدال axios بـ Firestore
import {
  getAllButtonPositions,
  updateButtonPosition,
  addButtonPosition,
} from '../../../config/firestore';
import ImageModal from './ImageModal';
import FilePreviewModal from './FilePreviewModal';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

const GRID_SIZE = 160;
const GRID_GAP = 20;

const getFileType = (url) => {
  if (!url) return 'other';
  const extension = url.split('.').pop()?.toLowerCase();
  if (['pdf'].includes(extension)) return 'pdf';
  if (['doc', 'docx'].includes(extension)) return 'word';
  if (['xls', 'xlsx'].includes(extension)) return 'excel';
  if (['ppt', 'pptx'].includes(extension)) return 'powerpoint';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return 'image';
  if (['mp4', 'webm', 'ogg'].includes(extension)) return 'video';
  if (['mp3', 'wav'].includes(extension)) return 'audio';
  return 'other';
};

const FileIcon = ({ fileType, size = 40 }) => {
  switch (fileType) {
    case 'pdf':
      return <FaFilePdf size={size} className="text-red-500" />;
    case 'word':
      return <FaFileWord size={size} className="text-blue-500" />;
    case 'excel':
      return <FaFileExcel size={size} className="text-green-500" />;
    case 'powerpoint':
      return <FaFilePowerpoint size={size} className="text-orange-500" />;
    case 'image':
      return <FaImage size={size} className="text-blue-500" />;
    case 'video':
      return <FaVideo size={size} className="text-purple-500" />;
    case 'audio':
      return <FaMusic size={size} className="text-yellow-500" />;
    default:
      return <FaFile size={size} className="text-gray-500" />;
  }
};

const MediaPreview = ({ mediaUrl, mediaType, style }) => {
  if (!mediaUrl) return null;

  const defaultStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '4px',
  };

  const previewStyle = {
    ...defaultStyle,
    ...style,
  };

  switch (mediaType) {
    case 'image':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <img src={mediaUrl} alt="معاينة" style={previewStyle} />
        </div>
      );
    case 'video':
      return (
        <div className="w-full h-full flex items-center justify-center">
          <video
            style={previewStyle}
            controls
            muted={style?.hideControls}
            loop={style?.hideControls}
            playsInline
          >
            <source src={mediaUrl} type="video/mp4" />
          </video>
        </div>
      );
    case 'audio':
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <FaMusic size={30} className="text-yellow-500 mb-2" />
          <audio controls className="w-full" style={{ maxWidth: '100%' }}>
            <source src={mediaUrl} type="audio/mpeg" />
          </audio>
        </div>
      );
    default:
      return null;
  }
};

const FilePreview = ({ fileUrl }) => {
  if (!fileUrl) return null;
  const fileType = getFileType(fileUrl);

  return (
    <div
      className="absolute inset-0 overflow-hidden bg-white dark:bg-gray-800 flex items-center justify-center"
      style={{ borderRadius: 'inherit', zIndex: 0 }}
    >
      <div className="absolute inset-0 bg-opacity-95 dark:bg-opacity-95" />
      <div className="relative z-10">
        <FileIcon fileType={fileType} />
        <div className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {fileUrl.split('/').pop()}
        </div>
      </div>
    </div>
  );
};

export default function ButtonArea({
  pages,
  currentPageId,
  selectedButton,
  setSelectedButton,
  showControls,
  toggleControls,
  setCurrentPageId,
  originalPages,
  setButtons,
  buttons: providedButtons,
  isTimerRunning,
  clientButtonArea,
  providedPositions,
  saveAllPositions,
  hasUnsavedChanges,
  setHasUnsavedChanges,
}) {
  const [draggingButtonId, setDraggingButtonId] = useState(null);
  const [resizingButtonId, setResizingButtonId] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [positions, setPositions] = useState({});
  const [sizes, setSizes] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('buttonAreaBgColor') || '#d1d5db';
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  const buttons = providedButtons || [];
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const handleBackgroundColorChange = (color) => {
    setBackgroundColor(color);
    localStorage.setItem('buttonAreaBgColor', color);
  };

  const handleMouseEnter = (button) => {
    setHoveredButton(button);
  };

  const handleMouseLeave = () => {
    setHoveredButton(null);
  };

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isButtonClick = event.target.closest('[id^="button-"]');

      if (
        containerRef.current &&
        containerRef.current.contains(event.target) &&
        !isButtonClick
      ) {
        setSelectedButton(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setSelectedButton, containerRef]);

  // دالة مساعدة لإنشاء مواقع افتراضية للأزرار
  const createDefaultPositions = (buttons) => {
    const defaultPositions = {};
    const columns = 4; // عدد الأعمدة في الشبكة
    const spacing = 20; // المسافة بين الأزرار
    
    buttons.forEach((button, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      const buttonWidth = button.width || 160;
      const buttonHeight = button.height || 160;
      
      defaultPositions[button.id] = {
        x: col * (buttonWidth + spacing) + spacing,
        y: row * (buttonHeight + spacing) + spacing,
      };
    });
    
    return defaultPositions;
  };

  useEffect(() => {
    const fetchButtonPositions = async () => {
      if (!buttons || buttons.length === 0) {
        console.log('⚠️ لا توجد أزرار بعد');
        return;
      }

      try {
        console.log(`🔍 جلب المواقع لـ ${buttons.length} زر`);
        
        // إذا كانت المواقع ممررة من الخارج (مثل PageViewPage أو ClientViewPage)، استخدمها مباشرة
        if (providedPositions && Object.keys(providedPositions).length > 0) {
          console.log('📍 استخدام المواقع الممررة:', providedPositions);
          // التحقق من أن كل زر له موقع
          const finalPositions = { ...providedPositions };
          const defaultPositions = createDefaultPositions(buttons);
          buttons.forEach(button => {
            if (!finalPositions[button.id]) {
              finalPositions[button.id] = defaultPositions[button.id];
              console.log(`📍 إضافة موقع افتراضي للزر ${button.id}:`, defaultPositions[button.id]);
            }
          });
          setPositions(finalPositions);
          return;
        }

        // إذا كان في وضع صفحة العميل ولم تكن هناك مواقع ممررة، أنشئ مواقع افتراضية
        if (clientButtonArea) {
          console.log('📍 إنشاء مواقع افتراضية لصفحة العميل');
          const defaultPositions = createDefaultPositions(buttons);
          setPositions(defaultPositions);
          return;
        }

        const savedPositions = localStorage.getItem('buttonPositions');
        if (savedPositions) {
          const positions = JSON.parse(savedPositions);
          console.log('📍 مواقع محفوظة في localStorage:', positions);
          
          // تنظيف المواقع وإضافة مواقع افتراضية للأزرار المفقودة
          const allButtons = pages.reduce((acc, page) => {
            return [...acc, ...page.buttons];
          }, []);
          
          const cleanedPositions = {};
          const defaultPositions = createDefaultPositions(buttons);
          
          buttons.forEach(button => {
            const savedPos = positions[button.id];
            if (savedPos && allButtons.some(btn => btn.id === button.id || btn.id === Number(button.id))) {
              cleanedPositions[button.id] = savedPos;
            } else {
              // استخدام موقع افتراضي إذا لم يكن هناك موقع محفوظ
              cleanedPositions[button.id] = defaultPositions[button.id];
            }
          });
          
          setPositions(cleanedPositions);
          localStorage.setItem('buttonPositions', JSON.stringify(cleanedPositions));
          return;
        }
  
        // جلب المواقع من Firestore
        console.log('📍 جلب المواقع من Firestore...');
        const positionsFromFirestore = await getAllButtonPositions();
        const positionsData = {};
        const allButtons = pages.reduce((acc, page) => {
          return [...acc, ...page.buttons];
        }, []);
        
        positionsFromFirestore.forEach((position) => {
          const buttonId = position.buttonId || position.button;
          // فقط إضافة المواقع للأزرار الموجودة
          if (allButtons.some(btn => btn.id === buttonId || btn.id === Number(buttonId))) {
            positionsData[buttonId] = {
              x: position.x,
              y: position.y,
              id: position.id,
            };
          }
        });
  
        console.log(`📍 تم جلب ${Object.keys(positionsData).length} موقع من Firestore`);
        
        // إنشاء مواقع افتراضية ودمجها مع المواقع المحفوظة
        const defaultPositions = createDefaultPositions(buttons);
        const finalPositions = {};
        
        buttons.forEach(button => {
          if (positionsData[button.id]) {
            finalPositions[button.id] = positionsData[button.id];
          } else {
            finalPositions[button.id] = defaultPositions[button.id];
            console.log(`📍 استخدام موقع افتراضي للزر ${button.id}`);
          }
        });

        setPositions(finalPositions);
        localStorage.setItem('buttonPositions', JSON.stringify(finalPositions));
      } catch (error) {
        console.error('❌ خطأ في جلب مواقع الأزرار:', error);
        // في حالة الخطأ، استخدم مواقع افتراضية بدلاً من ترك الأزرار في (0,0)
        console.log('📍 استخدام مواقع افتراضية بسبب الخطأ');
        const defaultPositions = createDefaultPositions(buttons);
        setPositions(defaultPositions);
        toast.error('حدث خطأ أثناء تحميل مواقع الأزرار');
      }
    };
  
    fetchButtonPositions();
  }, [pages, providedPositions, buttons, clientButtonArea]);

  // تحميل أحجام الأزرار من localStorage
  useEffect(() => {
    const savedSizes = localStorage.getItem('buttonSizes');
    if (savedSizes) {
      const parsedSizes = JSON.parse(savedSizes);
      // تنظيف الأحجام: إزالة أحجام الأزرار المحذوفة
      const allButtons = pages.reduce((acc, page) => {
        return [...acc, ...page.buttons];
      }, []);
      const cleanedSizes = {};
      Object.entries(parsedSizes).forEach(([buttonId, size]) => {
        if (allButtons.some(btn => btn.id === buttonId || btn.id === Number(buttonId))) {
          cleanedSizes[buttonId] = size;
        }
      });
      setSizes(cleanedSizes);
      localStorage.setItem('buttonSizes', JSON.stringify(cleanedSizes));
    }
  }, [pages]);

  const handleClick = (button) => {
    if (!showControls) {
      // منطق النقر على الزر في وضع العرض
      const updatedButtons = buttons.map((btn) => {
        if (btn.id === button.id) {
          return { ...btn, clicks: (btn.clicks || 0) + 1 };
        }
        return btn;
      });

      // معالجة الأزرار المرتبطة
      if (button.linked_buttons) {
        const linkedButton = pages.reduce((found, page) => {
          if (found) return found;
          return page.buttons.find(btn => btn.id === Number(button.linked_buttons));
        }, null);

        if (linkedButton) {
          const targetPage = pages.find(page => 
            page.buttons.some(btn => btn.id === Number(button.linked_buttons))
          );
          
          if (targetPage) {
            setCurrentPageId(targetPage.id);
            
            setTimeout(() => {
              const buttonElement = document.getElementById(`button-${linkedButton.id}`);
              if (buttonElement) {
                buttonElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 100);
          }
        }
      }

      // معالجة الوسائط والملفات
      if ((button.type === 'media' || button.type === 'standalone-media') && button.media) {
        setSelectedMedia(button.media);
        setMediaType(button.media_type || 'image');
        setShowModal(true);
      } else if (button.type === 'file' && button.file) {
        setSelectedFile({
          url: button.file,
          name: button.file.split('/').pop(),
        });
        setShowFilePreview(true);
      } else if (button.type === 'page' && button.target_page) {
        const targetPage = pages.find(
          (page) => page.id === Number(button.target_page),
        );
        if (targetPage) {
          setCurrentPageId(targetPage.id);
        }
      } else if (button.type === 'shape' && button.shape_details?.action?.type) {
        switch (button.shape_details.action.type) {
          case 'page':
            if (button.shape_details.action.target_page) {
              const targetPage = pages.find(
                (page) => page.id === Number(button.shape_details.action.target_page)
              );
              if (targetPage) {
                setCurrentPageId(targetPage.id);
              }
            }
            break;
          case 'media':
            if (button.shape_details.action.media_url) {
              setSelectedMedia(button.shape_details.action.media_url);
              setMediaType(button.shape_details.action.media_type || 'image');
              setShowModal(true);
            }
            break;
          case 'file':
            if (button.shape_details.action.file_url) {
              setSelectedFile({
                url: button.shape_details.action.file_url,
                name: button.shape_details.action.file_name
              });
              setShowFilePreview(true);
            }
            break;
        }
      }

      // تحديث الأزرار فقط إذا كان setButtons موجوداً
      if (setButtons) {
        setButtons(updatedButtons);
      }
    } else {
      // وضع التحكم - اختيار الزر للتعديل
      setSelectedButton(button.id === selectedButton?.id ? null : button);
    }
  };

  useEffect(() => {
    if (showControls) {
      const currentPage = pages.find((page) =>
        page.buttons.some((button) => buttons.includes(button)),
      );

      if (currentPage && originalPages[currentPage.id]) {
        const originalButtons = originalPages[currentPage.id].buttons;

        const restoredButtons = buttons.map((button) => {
          const originalButton = originalButtons.find(
            (ob) => ob.id === button.id,
          );
          if (!originalButton) return button;

          return {
            ...button, // الحفاظ على التغييرات الحالية
            media: button.media || originalButton.media,
            shape_details: {
              ...originalButton.shape_details,
              ...(button.shape_details || {}),
            },
            file_details: {
              ...originalButton.file_details,
              ...(button.file_details || {}),
            },
            target_page: button.target_page || originalButton.target_page,
            // عدم إعادة تعيين style لحفظ التغييرات
          };
        });

        setButtons?.(restoredButtons);
      }
    }
  }, [showControls, originalPages]);


  return (
    <>
      <main
        ref={containerRef}
        className="relative overflow-visible mt-24 sm:mt-20 lg:mt-0 flex-1 p-2 sm:p-4 md:p-6 rounded-md mb-20"
        style={{
          height: 'calc(70vh - 5rem)',
          overflowY: 'auto',
          overflowX: 'visible',
          backgroundColor: backgroundColor,
        }}
      >
        {/* أزرار التحكم - Responsive */}
        <div className={`fixed top-20 sm:top-24 md:top-20 lg:top-4 left-1/2 transform -translate-x-1/2 z-50 flex flex-wrap gap-1 sm:gap-2 justify-center ${clientButtonArea ? 'hidden' : ''}`}>
          <Button
            onClick={() => navigate('/client')}
            disabled={isTimerRunning}
            variant="primary"
            size="sm"
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">عرض صفحة العميل</span>
            <span className="sm:hidden">العميل</span>
          </Button>
          
          <Button
            onClick={toggleControls}
            disabled={isTimerRunning}
            variant="primary"
            size="sm"
            className="text-xs sm:text-sm"
          >
            <span className="hidden sm:inline">{showControls ? 'إخفاء التحكمات' : 'إظهار التحكمات'}</span>
            <span className="sm:hidden">{showControls ? 'إخفاء' : 'إظهار'}</span>
          </Button>

          {/* قائمة المسوقين - للأدمن فقط */}
          {hasRole('admin') && (
            <Button
              onClick={() => navigate('/marketers-list')}
              disabled={isTimerRunning}
              variant="success"
              size="sm"
              className="text-xs sm:text-sm"
            >
              <span className="hidden sm:inline">قائمة المسوقين</span>
              <span className="sm:hidden">المسوقين</span>
            </Button>
          )}

          <Button
            onClick={() => setShowColorPicker(true)}
            disabled={isTimerRunning}
            variant="secondary"
            size="sm"
            className="text-xs sm:text-sm"
            title="تغيير لون الخلفية"
          >
            <span className="hidden md:inline">🎨 لون الخلفية</span>
            <span className="md:hidden">🎨</span>
          </Button>
        </div>

      <div className="relative h-full overflow-y-visible">
        <div className="relative min-h-full pb-96">
          {/* Grid Background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, transparent, transparent ${
                  GRID_SIZE - 51
                }px, rgba(0,0,0,0.15) ${GRID_SIZE - 50}px),
                repeating-linear-gradient(90deg, transparent, transparent ${
                  GRID_SIZE + GRID_GAP - 1
                }px, rgba(0,0,0,0.15) ${GRID_SIZE + GRID_GAP}px)
              `,
              backgroundSize: `${GRID_SIZE + GRID_GAP}px ${GRID_SIZE - 50}px`,
              pointerEvents: 'none',
              minHeight: '200vh',
              overflow: 'visible',
              opacity: 0.8,
            }}
          />

          <div
            className="relative button-container"
            style={{ minHeight: '200vh', overflow: 'visible' }}
          >
            {buttons.map((button, index) => {
              if (!showControls && button.is_active === false) {
                return null;
              }

              console.log(`🔑 زر ${index}: ID=${button.id}, العنوان=${button.title}`);
              
              const buttonWidth = sizes[button.id]?.width || button.width || 160;
              const buttonHeight = sizes[button.id]?.height || button.height || 160;
              const buttonX = positions[button.id]?.x || 0;
              const buttonY = positions[button.id]?.y || 0;
              
              console.log(`📍 موقع الزر ${button.id}: x=${buttonX}, y=${buttonY}`);

              return (
                <Rnd
                  key={`btn-${button.id}`}
                  size={{ width: buttonWidth, height: buttonHeight }}
                  position={{ x: buttonX, y: buttonY }}
                  onDragStop={(e, d) => {
                    if (!showControls) return;
                    console.log('🛑 إيقاف تحريك الزر:', button.id, 'الموضع:', d.x, d.y);
                    
                    const newPositions = {
                      ...positions,
                      [button.id]: { x: d.x, y: d.y }
                    };
                    
                    setPositions(newPositions);
                    localStorage.setItem('buttonPositions', JSON.stringify(newPositions));
                    setHasUnsavedChanges(true);
                  }}
                  onResize={(e, direction, ref, delta, position) => {
                    // callback فارغ - يمنع القفزات
                  }}
                  onResizeStop={(e, direction, ref, delta, position) => {
                    if (!showControls) return;
                    console.log('📏 تغيير حجم الزر:', button.id);
                    const newWidth = parseInt(ref.style.width);
                    const newHeight = parseInt(ref.style.height);

                    // نحدث الحجم فقط - الموقع يبقى ثابت
                    const newSizes = {
                      ...sizes,
                      [button.id]: { width: newWidth, height: newHeight }
                    };
                    
                    setSizes(newSizes);
                    localStorage.setItem('buttonSizes', JSON.stringify(newSizes));
                    setHasUnsavedChanges(true);
                  }}
                  disableDragging={!showControls}
                  enableResizing={showControls}
                  resizeHandles={['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw']}
                  enableUserSelectHack={false}
                  minWidth={80}
                  minHeight={40}
                  bounds="parent"
                  resizeGrid={[1, 1]}
                  dragGrid={[1, 1]}
                  style={{
                    zIndex: draggingButtonId === button.id ? 1000 : 1,
                    cursor: showControls ? 'move' : 'pointer',
                    boxShadow: draggingButtonId === button.id
                      ? '0 8px 20px rgba(0,0,0,0.2)'
                      : '0 2px 5px rgba(0,0,0,0.1)',
                    opacity: showControls && button.is_active === false ? 0.5 : 1,
                  }}
                  className={`button-rnd ${resizingButtonId === button.id ? 'is-resizing' : ''}`}
                >
                  <div
                    id={`button-${button.id}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'visible',
                    }}
                    onClick={() => handleClick(button)}
                    onMouseEnter={() => handleMouseEnter(button)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Hidden Button Indicator */}
                    {showControls && button.is_active === false && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center z-10" title="هذا الزر مخفي">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                        </svg>
                      </div>
                    )}

                    <div style={{ position: 'relative', zIndex: 1 }}>
                      <SortableItem
                        id={button.id}
                        button={button}
                        selectedButton={selectedButton}
                        buttons={buttons}
                        showControls={showControls}
                        onClick={() => handleClick(button)}
                      />
                    </div>

                    {/* Media Preview */}
                    {(button.type === 'media' || button.type === 'standalone-media') && button.media && (
                      <div
                        className={`${
                          button.type === 'standalone-media' 
                            ? 'absolute inset-0' 
                            : showControls
                            ? 'absolute left-0 right-0 bg-white dark:bg-gray-800'
                            : ''
                        } overflow-hidden`}
                        style={{
                          top: button.type === 'standalone-media' ? '0' : showControls ? '100%' : '0',
                          marginTop: button.type === 'standalone-media' ? '0' : showControls ? '8px' : '0',
                          position: button.type === 'standalone-media' ? 'absolute' : showControls ? 'absolute' : 'relative',
                        }}
                      >
                        <MediaPreview
                          mediaUrl={button.media}
                          mediaType={button.media_type}
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            objectFit: button.type === 'standalone-media' ? 'cover' : 'contain',
                            padding: 0,
                          }}
                        />
                      </div>
                    )}

                    {/* File Preview */}
                    {button.type === 'file' && button.file && (
                      <FilePreview fileUrl={button.file} />
                    )}

                    {/* Button Details */}
                    {showControls && (
                      <ButtonDetails
                        button={button}
                        selectedButton={selectedButton}
                        hoveredButton={hoveredButton}
                        pages={pages}
                      />
                    )}
                  </div>
                </Rnd>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showModal && (
        <ImageModal
          imageUrl={selectedMedia}
          onClose={() => setShowModal(false)}
          mediaType={mediaType}
        />
      )}

      {showFilePreview && selectedFile && (
        <FilePreviewModal
          fileUrl={selectedFile.url}
          fileName={selectedFile.name}
          onClose={() => setShowFilePreview(false)}
        />
      )}

      {/* Color Picker Modal */}
      {showColorPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                اختر لون الخلفية
              </h3>
              <button
                onClick={() => setShowColorPicker(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Color Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اختر اللون:
                </label>
                <div className="flex gap-3 items-center">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => handleBackgroundColorChange(e.target.value)}
                    className="w-20 h-20 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => handleBackgroundColorChange(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white font-mono"
                      placeholder="#000000"
                    />
                    <p className="text-xs text-gray-500 mt-1">اللون الحالي: {backgroundColor}</p>
                  </div>
                </div>
              </div>

              {/* Preset Colors */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ألوان جاهزة:
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {['#ffffff', '#f3f4f6', '#d1d5db', '#9ca3af', '#374151', '#1f2937', 
                    '#fee2e2', '#fef3c7', '#d1fae5', '#dbeafe', '#e0e7ff', '#fce7f3'].map((color) => (
                    <button
                      key={color}
                      onClick={() => handleBackgroundColorChange(color)}
                      className={`w-full h-10 rounded-lg border-2 ${
                        backgroundColor === color ? 'border-blue-500 shadow-lg' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <Button
                onClick={() => setShowColorPicker(false)}
                variant="primary"
                fullWidth
                className="py-2 px-4 font-semibold"
              >
                تم
              </Button>
            </div>
          </div>
        </div>
      )}
      </main>
    </>
  );
}