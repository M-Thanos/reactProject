import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
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
import axios from 'axios';
import ImageModal from './ImageModal';
import FilePreviewModal from './FilePreviewModal';
import { useNavigate } from 'react-router-dom';

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
}) {
  const [draggingButtonId, setDraggingButtonId] = useState(null);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [positions, setPositions] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 1,
      },
    }),
  );

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

  useEffect(() => {
    const fetchButtonPositions = async () => {
      try {
        const savedPositions = localStorage.getItem('buttonPositions');
        if (savedPositions) {
          const positions = JSON.parse(savedPositions);
          // تنظيف المواقع: إزالة مواقع الأزرار المحذوفة
          const allButtons = pages.reduce((acc, page) => {
            return [...acc, ...page.buttons];
          }, []);
          const cleanedPositions = {};
          Object.entries(positions).forEach(([buttonId, pos]) => {
            if (allButtons.some(btn => btn.id === Number(buttonId))) {
              cleanedPositions[buttonId] = pos;
            }
          });
          setPositions(cleanedPositions);
          localStorage.setItem('buttonPositions', JSON.stringify(cleanedPositions));
          return;
        }
  
        const response = await axios.get('https://buttons-api-production.up.railway.app/api/button-positions/');
        const positionsData = {};
        const allButtons = pages.reduce((acc, page) => {
          return [...acc, ...page.buttons];
        }, []);
        
        response.data.forEach((position) => {
          // فقط إضافة المواقع للأزرار الموجودة
          if (allButtons.some(btn => btn.id === Number(position.button))) {
            positionsData[position.button] = {
              x: position.x,
              y: position.y,
              id: position.id,
            };
          }
        });
  
        setPositions(positionsData);
        localStorage.setItem('buttonPositions', JSON.stringify(positionsData));
      } catch (error) {
        console.error('Error fetching button positions:', error);
        toast.error('حدث خطأ أثناء تحميل مواقع الأزرار');
      }
    };
  
    fetchButtonPositions();
  }, [pages]);

  const handleDragEnd = async (event) => {
    const { active, delta } = event;
    if (!active) return;

    const currentPosition = positions[active.id] || { x: 0, y: 0 };
    const mainRect = containerRef.current.getBoundingClientRect();

    const newX = Math.round(currentPosition.x + delta.x);
    const newY = Math.round(currentPosition.y + delta.y);

    const maxY = Math.max(mainRect.height * 2, 2000);
    const finalX = Math.round(
      Math.max(0, Math.min(newX, mainRect.width - 100)),
    );
    const finalY = Math.round(Math.max(0, Math.min(newY, maxY)));

    const newPositions = {
      ...positions,
      [active.id]: {
        ...positions[active.id],
        x: finalX,
        y: finalY,
      },
    };

    setPositions(newPositions);
    localStorage.setItem('buttonPositions', JSON.stringify(newPositions));
    setHasUnsavedChanges(true);
    setDraggingButtonId(null);
  };

  const handleDragStart = (event) => {
    setDraggingButtonId(event.active.id);
  };

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
      if (button.type === 'media' && button.media) {
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

      setButtons(updatedButtons);
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

  const saveAllPositions = async () => {
    try {
      const allButtons = pages.reduce((acc, page) => {
        return [...acc, ...page.buttons];
      }, []);

      // تنظيف المواقع قبل الحفظ: إزالة مواقع الأزرار المحذوفة
      const cleanedPositions = {};
      const positionsToCreate = [];
      
      Object.entries(positions).forEach(([buttonId, pos]) => {
        const button = allButtons.find((btn) => btn.id === Number(buttonId));
        if (button) {
          if (pos.id) {
            // موقع موجود في قاعدة البيانات
            cleanedPositions[buttonId] = pos;
          } else {
            // موقع جديد يحتاج إنشاء
            positionsToCreate.push({ buttonId, pos });
          }
        }
      });

      console.log('All buttons:', allButtons);
      console.log('Current positions:', positions);
      console.log('Cleaned positions to save:', cleanedPositions);
      console.log('Positions to create:', positionsToCreate);


      // إنشاء المواقع الجديدة أولاً
      for (const { buttonId, pos } of positionsToCreate) {
        try {
          const positionData = {
            x: Math.round(Number(pos.x) || 0),
            y: Math.round(Number(pos.y) || 0),
            button: buttonId,
          };

          console.log(`Creating new position for button ${buttonId}:`, positionData);

          const createResponse = await axios.post(
            'https://buttons-api-production.up.railway.app/api/button-positions/',
            positionData,
            {
              headers: {
                'Content-Type': 'application/json',
              },
              timeout: 10000,
            },
          );

          console.log(`New position created for button ${buttonId}:`, createResponse.data);
          
          // إضافة الموقع الجديد إلى cleanedPositions
          cleanedPositions[buttonId] = {
            ...pos,
            id: createResponse.data.id
          };
        } catch (error) {
          console.error(`Failed to create position for button ${buttonId}:`, error);
          throw new Error(`فشل في إنشاء موقع للزر ${buttonId}`);
        }
      }

      // تحديث الـ state والـ localStorage بالمواقع المحدثة
      setPositions(cleanedPositions);
      localStorage.setItem('buttonPositions', JSON.stringify(cleanedPositions));

      // محاولة الحفظ مع معالجة الأخطاء لكل زر
      const saveResults = await Promise.allSettled(
        Object.entries(cleanedPositions).map(async ([buttonId, pos]) => {
          const positionData = {
            x: Math.round(Number(pos.x) || 0),
            y: Math.round(Number(pos.y) || 0),
            button: buttonId,
          };

          console.log(`Saving position for button ${buttonId}:`, positionData);

          try {
            const response = await axios.patch(
              `https://buttons-api-production.up.railway.app/api/button-positions/${pos.id}/`,
              positionData,
              {
                headers: {
                  'Content-Type': 'application/json',
                },
                timeout: 10000, // 10 seconds timeout
              },
            );

            console.log(`Position saved successfully for button ${buttonId}:`, response.data);
            return { buttonId, success: true, data: response.data };
          } catch (error) {
            console.error(`Failed to save position for button ${buttonId}:`, error);
            
            // محاولة إنشاء موقع جديد إذا فشل التحديث
            try {
              console.log(`Attempting to create new position for button ${buttonId}`);
              const createResponse = await axios.post(
                'https://buttons-api-production.up.railway.app/api/button-positions/',
                positionData,
                {
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  timeout: 10000,
                },
              );
              
              console.log(`New position created for button ${buttonId}:`, createResponse.data);
              return { buttonId, success: true, data: createResponse.data, created: true };
            } catch (createError) {
              console.error(`Failed to create position for button ${buttonId}:`, createError);
              return { buttonId, success: false, error: createError };
            }
          }
        }),
      );

      // فحص النتائج
      const failedSaves = saveResults.filter(result => 
        result.status === 'rejected' || (result.status === 'fulfilled' && !result.value.success)
      );

      if (failedSaves.length > 0) {
        console.error('Some positions failed to save:', failedSaves);
        throw new Error(`${failedSaves.length} من الأزرار فشل في حفظ مواقعها`);
      }

      toast.success('تم حفظ مواقع جميع الأزرار بنجاح');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving button positions:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      
      if (error.response?.status === 404) {
        toast.error('خطأ: لم يتم العثور على موقع الزر في قاعدة البيانات');
      } else if (error.response?.status === 500) {
        toast.error('خطأ في الخادم: يرجى المحاولة مرة أخرى');
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        toast.error('خطأ في الاتصال بالخادم: تحقق من اتصال الإنترنت');
      } else {
        toast.error(`حدث خطأ أثناء حفظ مواقع الأزرار: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative overflow-visible mt-20 lg:mt-0 flex-1 p-6 rounded-md"
      style={{
        height: 'calc(70vh - 5rem)',
        overflowY: 'auto',
        overflowX: 'visible',
        backgroundColor: backgroundColor,
      }}
    >
      <button
        onClick={() => navigate('/client')}
        disabled={isTimerRunning}
        className={`fixed top-4 left-4 lg:left-[19rem] z-50 text-white px-4 py-2 rounded-md shadow-lg ${
          isTimerRunning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } ${clientButtonArea ? 'hidden' : ''}`}
      >
        عرض صفحة العميل
      </button>
      
      <button
        onClick={toggleControls}
        disabled={isTimerRunning}
        className={`fixed top-4 left-49 lg:left-[30rem] z-50 text-white px-4 py-2 rounded-md shadow-lg ${
          isTimerRunning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        } ${clientButtonArea ? 'hidden' : ''}`}
      >
        {showControls ? 'إخفاء التحكمات' : 'إظهار التحكمات'}
      </button>

      <button
        onClick={() => navigate('/marketers-list')}
        disabled={isTimerRunning}
        className={`fixed top-4 left-[190px] lg:left-[41rem] z-50 text-white px-4 py-2 rounded-md shadow-lg ${
          isTimerRunning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-green-500 hover:bg-green-800'
        } ${clientButtonArea ? 'hidden' : ''}`}
      >
        قائمة المسوقين
      </button>

      <button
        onClick={() => setShowColorPicker(true)}
        disabled={isTimerRunning}
        className={`fixed top-4 left-[310px] lg:left-[52rem] z-50 text-white px-4 py-2 rounded-md shadow-lg ${
          isTimerRunning
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-purple-500 hover:bg-purple-600'
        } ${clientButtonArea ? 'hidden' : ''}`}
        title="تغيير لون الخلفية"
      >
        🎨 لون الخلفية
      </button>
      
      {hasUnsavedChanges && showControls && (
        <button
          onClick={saveAllPositions}
          className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-lg"
        >
          حفظ المواقع
        </button>
      )}

      <div className="relative h-full overflow-y-visible">
        <div className="relative min-h-full pb-96">
          <DndContext
            sensors={showControls ? sensors : []}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
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
              className="relative"
              style={{ minHeight: '200vh', overflow: 'visible' }}
            >
              {buttons.map((button) => {
                if (!showControls && button.is_active === false) {
                  return null;
                }

                return (
                  <div
                    key={button.id}
                    id={`button-${button.id}`}
                    style={{
                      width: `${button.width || 160}px`,
                      minWidth: '160px',
                      position: 'absolute',
                      transform: positions[button.id]
                        ? `translate(${positions[button.id].x}px, ${
                            positions[button.id].y
                          }px)`
                        : 'none',
                      zIndex: draggingButtonId === button.id ? 1000 : 1,
                      transition:
                        draggingButtonId === button.id
                          ? 'transform 0.05s linear'
                          : 'transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)',
                      cursor: showControls
                        ? draggingButtonId === button.id
                          ? 'grabbing'
                          : 'grab'
                        : 'pointer',
                      boxShadow:
                        draggingButtonId === button.id
                          ? '0 8px 20px rgba(0,0,0,0.2)'
                          : '0 2px 5px rgba(0,0,0,0.1)',
                      touchAction: showControls ? 'none' : 'auto',
                      overflow: 'visible',
                      opacity: showControls && button.is_active === false ? 0.5 : 1,
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
                    {button.type === 'media' && button.media && (
                      <div
                        className={`${
                          showControls
                            ? 'absolute left-0 right-0 bg-white dark:bg-gray-800'
                            : ''
                        } overflow-hidden`}
                        style={{
                          top: showControls ? '100%' : '0',
                          marginTop: showControls ? '8px' : '0',
                          position: showControls ? 'absolute' : 'relative',
                        }}
                      >
                        <MediaPreview
                          mediaUrl={button.media}
                          mediaType={button.media_type}
                          style={{
                            position: 'relative',
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
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
                );
              })}
            </div>
          </DndContext>
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
              <button
                onClick={() => setShowColorPicker(false)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
              >
                تم
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}