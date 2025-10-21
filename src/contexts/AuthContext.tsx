import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export type UserRole = 'admin' | 'user' | 'designer';

export interface UserData {
  uid: string;
  email: string;
  role: UserRole;
  displayName?: string;
}

interface AuthContextType {
  currentUser: User | null;
  userData: UserData | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, role: UserRole, displayName?: string) => Promise<void>;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get user data from Firestore
  const fetchUserData = async (user: User) => {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData({
          uid: user.uid,
          email: user.email || '',
          role: data.role || 'user',
          displayName: data.displayName || user.displayName || ''
        });
      } else {
        // If user document doesn't exist, create one with default role
        const defaultUserData: UserData = {
          uid: user.uid,
          email: user.email || '',
          role: 'user',
          displayName: user.displayName || ''
        };
        await setDoc(userDocRef, {
          email: user.email,
          role: 'user',
          displayName: user.displayName || '',
          createdAt: new Date().toISOString()
        });
        setUserData(defaultUserData);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await fetchUserData(result.user);
  };

  // Logout function
  const logout = async () => {
    await signOut(auth);
    setUserData(null);
  };

  // Register function
  const register = async (email: string, password: string, role: UserRole = 'user', displayName?: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    // Create user document in Firestore
    const userDocRef = doc(db, 'users', result.user.uid);
    await setDoc(userDocRef, {
      email: email,
      role: role,
      displayName: displayName || '',
      createdAt: new Date().toISOString()
    });
    
    await fetchUserData(result.user);
  };

  // Check if user has specific role(s)
  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!userData) return false;
    
    if (Array.isArray(roles)) {
      return roles.includes(userData.role);
    }
    
    return userData.role === roles;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserData(user);
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    login,
    logout,
    register,
    hasRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

