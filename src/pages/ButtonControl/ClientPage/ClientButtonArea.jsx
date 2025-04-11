import { useState, useEffect } from 'react';
import ButtonArea from '../ButtonPage/ButtonArea';
import ButtonSidebar from '../ButtonPage/ButtonSidebar';
import ButtonLeftSidebar from '../ButtonPage/ButtonLeftSidebar';
import { AiOutlineMenu } from 'react-icons/ai';

export default function ClientButtonArea() {
  const [pages, setPages] = useState([]);
  const [currentPageId, setCurrentPageId] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);
  const [buttons, setButtons] = useState([]);
  const [originalPages, setOriginalPages] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState({});
  const [sidebarStates, setSidebarStates] = useState({
    left: false,
    right: false
  });

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const savedPages = localStorage.getItem('pages');
        if (savedPages) {
          const parsedPages = JSON.parse(savedPages);
          setPages(parsedPages);
          setOriginalPages(parsedPages);
          
          if (parsedPages.length > 0) {
            setCurrentPageId(parsedPages[0].id);
            setButtons(parsedPages[0].buttons || []);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, []);

  // Update buttons when page changes
  useEffect(() => {
    if (pages && currentPageId) {
      const currentPage = pages.find((page) => page.id === currentPageId);
      if (currentPage) {
        setButtons(currentPage.buttons || []);
      }
    }
  }, [currentPageId, pages]);

  const handleButtonClick = async (buttonId, executeCallback = true) => {
    const button = buttons.find((b) => b.id === buttonId);
    if (!button) return;

    if (button.link) {
      const linkedPage = pages.find((page) => page.id === button.link);
      if (linkedPage) {
        setCurrentPageId(button.link);
      }
    }

    if (button.timer && executeCallback) {
      setIsTimerRunning(prev => ({ ...prev, [buttonId]: true }));
      setTimeout(() => {
        setIsTimerRunning(prev => ({ ...prev, [buttonId]: false }));
      }, button.timer * 1000);
    }
  };

  const handleSetButtons = (newButtons) => {
    setButtons(newButtons);
    const updatedPages = pages.map(page => {
      if (page.id === currentPageId) {
        return { ...page, buttons: newButtons };
      }
      return page;
    });
    setPages(updatedPages);
  };

  const toggleSidebarState = (side) => {
    setSidebarStates(prev => ({
      ...prev,
      [side]: !prev[side]
    }));
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* Simple Navigation Controls */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <button
          onClick={() => toggleSidebarState('right')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg"
        >
          <AiOutlineMenu className="inline mr-2" />
          {sidebarStates.right ? 'إخفاء القائمة اليمنى' : 'إظهار القائمة اليمنى'}
        </button>
        <button
          onClick={() => toggleSidebarState('left')}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg"
        >
          <AiOutlineMenu className="inline mr-2" />
          {sidebarStates.left ? 'إخفاء القائمة اليسرى' : 'إظهار القائمة اليسرى'}
        </button>
      </div>

      <div className="flex flex-1 gap-3 overflow-hidden">
        {/* Left Sidebar */}
        <div className={`${sidebarStates.left ? 'w-64 flex-shrink-0' : 'w-0'} transition-all duration-300`}>
          <ButtonSidebar
            pages={pages}
            setPages={setPages}
            setCurrentPageId={setCurrentPageId}
            currentPageId={currentPageId}
            showControls={false}
            sidebarStates={sidebarStates}
          />
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          <div className="flex py-3">
            {pages.find((page) => page.id === currentPageId) &&
            pages.find((page) => page.id === currentPageId).buttons ? (
              <ButtonArea
                pages={pages}
                currentPageId={currentPageId}
                selectedButton={selectedButton}
                setSelectedButton={setSelectedButton}
                showControls={false}
                setCurrentPageId={setCurrentPageId}
                originalPages={originalPages}
                handleButtonClick={handleButtonClick}
                setButtons={handleSetButtons}
                buttons={buttons}
                isTimerRunning={isTimerRunning}
                clientButtonArea={true}
              />
            ) : (
              <p className="text-center text-gray-500">
                لا توجد بيانات لعرضها!
              </p>
            )}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className={`${sidebarStates.right ? 'w-64 flex-shrink-0' : 'w-0'} transition-all duration-300`}>
          <ButtonLeftSidebar
            pages={pages}
            setPages={setPages}
            setCurrentPageId={setCurrentPageId}
            selectedButton={selectedButton}
            showControls={false}
            sidebarStates={sidebarStates}
          />
        </div>
      </div>
    </div>
  );
}
