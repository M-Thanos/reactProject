import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

export interface ButtonColors {
  primary: {
    background: string;
    backgroundHover: string;
    text: string;
  };
  secondary: {
    background: string;
    backgroundHover: string;
    text: string;
  };
  success: {
    background: string;
    backgroundHover: string;
    text: string;
  };
  danger: {
    background: string;
    backgroundHover: string;
    text: string;
  };
  warning: {
    background: string;
    backgroundHover: string;
    text: string;
  };
  outline: {
    border: string;
    borderHover: string;
    text: string;
    textHover: string;
  };
  ghost: {
    text: string;
    textHover: string;
    backgroundHover: string;
  };
  gradient: {
    background: string;
    text: string;
  };
}

interface ThemeContextType {
  buttonColors: ButtonColors;
  loading: boolean;
  updateButtonColors: (colors: Partial<ButtonColors>) => Promise<void>;
  resetToDefault: () => Promise<void>;
  applyColors: () => void;
}

const defaultButtonColors: ButtonColors = {
  primary: {
    background: 'linear-gradient(135deg, #3C50E0 0%, #2f40c4 100%)',
    backgroundHover: 'linear-gradient(135deg, #4a5ee6 0%, #3a4fd4 100%)',
    text: '#FFFFFF',
  },
  secondary: {
    background: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    backgroundHover: 'linear-gradient(135deg, #7286a0 0%, #556579 100%)',
    text: '#FFFFFF',
  },
  success: {
    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    backgroundHover: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
    text: '#FFFFFF',
  },
  danger: {
    background: 'linear-gradient(135deg, #DC2626 0%, #b91c1c 100%)',
    backgroundHover: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    text: '#FFFFFF',
  },
  warning: {
    background: 'linear-gradient(135deg, #F59E0B 0%, #d97706 100%)',
    backgroundHover: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
    text: '#FFFFFF',
  },
  outline: {
    border: '#3C50E0',
    borderHover: '#2f40c4',
    text: '#3C50E0',
    textHover: '#2f40c4',
  },
  ghost: {
    text: '#64748B',
    textHover: '#475569',
    backgroundHover: 'rgba(100, 116, 139, 0.08)',
  },
  gradient: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
    text: '#FFFFFF',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [buttonColors, setButtonColors] = useState<ButtonColors>(defaultButtonColors);
  const [loading, setLoading] = useState(true);

  // تطبيق الألوان على CSS Variables
  const applyColors = (colors: ButtonColors = buttonColors) => {
    const root = document.documentElement;

    // Primary
    root.style.setProperty('--btn-primary-bg', colors.primary.background);
    root.style.setProperty('--btn-primary-bg-hover', colors.primary.backgroundHover);
    root.style.setProperty('--btn-primary-text', colors.primary.text);

    // Secondary
    root.style.setProperty('--btn-secondary-bg', colors.secondary.background);
    root.style.setProperty('--btn-secondary-bg-hover', colors.secondary.backgroundHover);
    root.style.setProperty('--btn-secondary-text', colors.secondary.text);

    // Success
    root.style.setProperty('--btn-success-bg', colors.success.background);
    root.style.setProperty('--btn-success-bg-hover', colors.success.backgroundHover);
    root.style.setProperty('--btn-success-text', colors.success.text);

    // Danger
    root.style.setProperty('--btn-danger-bg', colors.danger.background);
    root.style.setProperty('--btn-danger-bg-hover', colors.danger.backgroundHover);
    root.style.setProperty('--btn-danger-text', colors.danger.text);

    // Warning
    root.style.setProperty('--btn-warning-bg', colors.warning.background);
    root.style.setProperty('--btn-warning-bg-hover', colors.warning.backgroundHover);
    root.style.setProperty('--btn-warning-text', colors.warning.text);

    // Outline
    root.style.setProperty('--btn-outline-border', colors.outline.border);
    root.style.setProperty('--btn-outline-border-hover', colors.outline.borderHover);
    root.style.setProperty('--btn-outline-text', colors.outline.text);
    root.style.setProperty('--btn-outline-text-hover', colors.outline.textHover);

    // Ghost
    root.style.setProperty('--btn-ghost-text', colors.ghost.text);
    root.style.setProperty('--btn-ghost-text-hover', colors.ghost.textHover);
    root.style.setProperty('--btn-ghost-bg-hover', colors.ghost.backgroundHover);

    // Gradient
    root.style.setProperty('--btn-gradient-bg', colors.gradient.background);
    root.style.setProperty('--btn-gradient-text', colors.gradient.text);

    console.log('🎨 Colors applied:', colors);
    console.log('🎨 CSS Variables set:', {
      '--btn-primary-bg': root.style.getPropertyValue('--btn-primary-bg'),
      '--btn-primary-text': root.style.getPropertyValue('--btn-primary-text'),
    });
  };

  // تحديث الألوان في Firestore
  const updateButtonColors = async (colors: Partial<ButtonColors>) => {
    try {
      const newColors = { ...buttonColors, ...colors };
      setButtonColors(newColors);
      
      // تطبيق الألوان فوراً
      applyColors(newColors);

      const themeDocRef = doc(db, 'settings', 'theme');
      await setDoc(themeDocRef, {
        buttonColors: newColors,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Theme colors updated successfully');
    } catch (error) {
      console.error('❌ Error updating theme colors:', error);
      throw error;
    }
  };

  // إعادة الألوان للافتراضية
  const resetToDefault = async () => {
    try {
      setButtonColors(defaultButtonColors);
      
      // تطبيق الألوان الافتراضية فوراً
      applyColors(defaultButtonColors);

      const themeDocRef = doc(db, 'settings', 'theme');
      await setDoc(themeDocRef, {
        buttonColors: defaultButtonColors,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ Theme colors reset to default');
    } catch (error) {
      console.error('❌ Error resetting theme colors:', error);
      throw error;
    }
  };

  // جلب الألوان من Firestore عند التحميل
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const themeDocRef = doc(db, 'settings', 'theme');
        const themeDoc = await getDoc(themeDocRef);

        if (themeDoc.exists()) {
          const data = themeDoc.data();
          if (data.buttonColors) {
            setButtonColors(data.buttonColors);
            applyColors(data.buttonColors);
          }
        } else {
          // إنشاء المستند إذا لم يكن موجوداً
          await setDoc(themeDocRef, {
            buttonColors: defaultButtonColors,
            createdAt: new Date().toISOString(),
          });
          applyColors(defaultButtonColors);
        }
      } catch (error) {
        console.error('❌ Error fetching theme:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();

    // الاستماع للتغييرات في الوقت الفعلي
    const themeDocRef = doc(db, 'settings', 'theme');
    const unsubscribe = onSnapshot(themeDocRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.buttonColors) {
          setButtonColors(data.buttonColors);
          applyColors(data.buttonColors);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // تطبيق الألوان عند تغييرها
  useEffect(() => {
    if (!loading) {
      applyColors();
    }
  }, [buttonColors, loading]);

  const value: ThemeContextType = {
    buttonColors,
    loading,
    updateButtonColors,
    resetToDefault,
    applyColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

