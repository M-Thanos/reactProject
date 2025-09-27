import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimation,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from '../SortableItem';
import {
  FaPlus,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFilePowerpoint,
  FaFile,
  FaImage,
  FaVideo,
  FaMusic,
} from 'react-icons/fa';
import { arrayMove } from '@dnd-kit/sortable';
import ButtonDetails from './ButtonDetails';
import { toast } from 'react-toastify';
import axios from 'axios';
import ImageModal from './ImageModal';
import FilePreviewModal from './FilePreviewModal';
import { useNavigate } from 'react-router-dom';

const MINIMUM_DISTANCE = 10; // المسافة الدنيا المطلوبة بين الأزرار
const GRID_SIZE = 160; // حجم ثابت للأزرار
const GRID_GAP = 20; // مسافة ثابتة بين الأزرار

const getDistance = (pos1, pos2) => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const adjustPosition = (activePos, otherPos) => {
  const dx = activePos.x - otherPos.x;
  const dy = activePos.y - otherPos.y;
  const distance = getDistance(activePos, otherPos);

  if (distance < MINIMUM_DISTANCE && distance > 0) {
    const scale = MINIMUM_DISTANCE / distance;
    return {
      x: otherPos.x + dx * scale,
      y: otherPos.y + dy * scale,
    };
  }
  return activePos;
};

const calculateDefaultGridPosition = (index, buttons) => {
  const COLUMNS = 3; // عدد ثابت من الأعمدة
  const row = Math.floor(index / COLUMNS);
  const col = index % COLUMNS;

  return {
    x: col * (GRID_SIZE + GRID_GAP),
    y: row * (GRID_SIZE - 50),
  };
};

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
      <div className="relative z-1">
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
  handleButtonClick: parentHandleButtonClick,
  setButtons,
  buttons: providedButtons,
  isTimerRunning,
  clientButtonArea,
}) {
  const [draggingButtonId, setDraggingButtonId] = useState(null);
  const [popupPosition, setPopupPosition] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);
  const [hoveredButton, setHoveredButton] = useState(null);
  const [positions, setPositions] = useState({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [mediaType, setMediaType] = useState('image');

  const buttons = providedButtons || [];

  const navigate = useNavigate();

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
        setPopupVisible(false);
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
        const response = await axios.get(
          'https://buttons-back.cowdly.com/api/button-positions/',
        );

        const positionsData = {};
        response.data.forEach((position) => {
          positionsData[position.button] = {
            x: position.x,
            y: position.y,
            id: position.id,
          };
        });

        setPositions(positionsData);
      } catch (error) {
        console.error('Error fetching button positions:', error);
        toast.error('حدث خطأ أثناء تحميل مواقع الأزرار');
      }
    };

    fetchButtonPositions();
  }, []);

  useEffect(() => {
    const savedPositions = localStorage.getItem('buttonPositions');
    if (savedPositions) {
      setPositions(JSON.parse(savedPositions));
    }
  }, []);

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

    // console.log('Updated positions:', newPositions);
    setPositions(newPositions);
    localStorage.setItem('buttonPositions', JSON.stringify(newPositions));
    setHasUnsavedChanges(true);
    setDraggingButtonId(null);
  };

  const handleDragStart = (event) => {
    setDraggingButtonId(event.active.id);
  };

  const handleButtonAction = (button) => {
    if (button.action) {
      button.action();
    } else {
      alert('لا توجد وظيفة محددة لهذا الزر!');
    }
  };

  const handleClick = (button) => {
    if (!showControls) {
      const updatedButtons = buttons.map((btn) => {
        if (btn.id === button.id) {
          if (button.type === 'shape' && button.shape_details) {
            return {
              ...btn,
              clicks: (btn.clicks || 0) + 1,
              color: button.shape_details.background_color || btn.color,
              text_color: button.shape_details.text_color || btn.text_color,
              name: button.shape_details.text || btn.name,
            };
          }
          return { ...btn, clicks: (btn.clicks || 0) + 1 };
        }
        return btn;
      });

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
            ...originalButton,
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
            style: originalButton.style,
          };
        });

        setButtons?.(restoredButtons);
      }
    }
  }, [showControls, originalPages]);

  useEffect(() => {
    if (showControls) {
      const resetButtons = buttons.map(button => ({
        ...button,
        color: button.color || '#ffffff',
        text_color: button.text_color || '#000000',
        name: button.name || `Button ${button.id}`,
      }));
      setButtons(resetButtons);
    }
  }, [showControls]);

  const saveAllPositions = async () => {
    try {
      // console.log('Saving positions for all buttons...');

      const allButtons = pages.reduce((acc, page) => {
        return [...acc, ...page.buttons];
      }, []);

      await Promise.all(
        Object.entries(positions).map(async ([buttonId, pos]) => {
          if (!pos.id) {
            console.error('Position ID is missing for button:', buttonId);
            return;
          }

          const button = allButtons.find((btn) => btn.id === Number(buttonId));
          if (!button) return;

          const positionData = {
            x: Math.round(Number(pos.x) || 0),
            y: Math.round(Number(pos.y) || 0),
            button: buttonId,
          };

          // console.log(`Saving position for button ${buttonId}:`, positionData);

          await axios.patch(
            `https://buttons-back.cowdly.com/api/button-positions/${pos.id}/`,
            positionData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            },
          );
        }),
      );

      toast.success('تم حفظ مواقع جميع الأزرار بنجاح');
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error saving button positions:', error);
      toast.error('حدث خطأ أثناء حفظ مواقع الأزرار');
    }
  };

  return (
    <main
      ref={containerRef}
      className="relative overflow-visible mt-20 lg:mt-0 flex-1 p-6 dark:bg-gray-700 bg-gray-300 rounded-md"
      style={{
        height: 'calc(70vh - 5rem)',
        overflowY: 'auto',
        overflowX: 'visible',
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
      {hasUnsavedChanges && showControls && (
<button
  onClick={saveAllPositions}
  className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md shadow-lg"
>
  حفظ المواقع
</button>

      )}
      <div className="relative h-full overflow-y-visible">
        <div className="relative min-h-full pb-96 ">
          <DndContext
            sensors={showControls ? sensors : []}
            onDragEnd={handleDragEnd}
            onDragStart={handleDragStart}
          >
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent ${
                    GRID_SIZE - 51
                  }px, rgba(0,0,0,0.1) ${GRID_SIZE - 50}px),
                  repeating-linear-gradient(90deg, transparent, transparent ${
                    GRID_SIZE + GRID_GAP - 1
                  }px, rgba(0,0,0,0.1) ${GRID_SIZE + GRID_GAP}px)
                `,
                backgroundSize: `${GRID_SIZE + GRID_GAP}px ${GRID_SIZE - 50}px`,
                pointerEvents: 'none',
                minHeight: '200vh',
                overflow: 'visible',
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

                const hasMedia = button.type === 'media' && button.media;

                return (
                  <div
                    key={button.id}
                    id={`button-${button.id}`}
                    style={{
                      width: `${button.width || 160}px`,
                      minWidth: '160px',
                      maxWidth: '300px',
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
                    {showControls && button.is_active === false && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center z-10" title="هذا الزر مخفي">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18"></path>
                        </svg>
                      </div>
                    )}
                    <div
                      style={{
                        position: 'relative',
                        zIndex: 1,
                      }}
                    >
                      <SortableItem
                        id={button.id}
                        button={button}
                        selectedButton={selectedButton}
                        buttons={buttons}
                        showControls={showControls}
                        onClick={() => handleClick(button)}
                      />
                    </div>

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

                    {button.type === 'file' && button.file && (
                      <FilePreview fileUrl={button.file} />
                    )}

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
    </main>
  );
}
 