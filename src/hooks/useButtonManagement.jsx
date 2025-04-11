import { useState, useEffect } from 'react';

const INITIAL_PAGES = [
  { id: 1, name: 'الصفحة الرئيسية', buttons: [] }
];

export const useButtonManagement = () => {
  const [pages, setPages] = useState(() => {
    const stored = localStorage.getItem('pages');
    return stored ? JSON.parse(stored) : INITIAL_PAGES;
  });
  
  const [currentPageId, setCurrentPageId] = useState(pages[0]?.id || null);
  const [selectedButton, setSelectedButton] = useState(null);

  useEffect(() => {
    localStorage.setItem('pages', JSON.stringify(pages));
  }, [pages]);

  const updateButton = (id, updatedValues) => {
    setPages(prevPages => 
      prevPages.map(page =>
        page.id === currentPageId
          ? {
              ...page,
              buttons: page.buttons.map(button =>
                button.id === id
                  ? { ...button, ...updatedValues }
                  : button
              )
            }
          : page
      )
    );

    if (id === selectedButton?.id) {
      setSelectedButton(prev => ({ ...prev, ...updatedValues }));
    }
  };

  return {
    pages,
    setPages,
    currentPageId,
    setCurrentPageId,
    selectedButton,
    setSelectedButton,
    updateButton
  };
};