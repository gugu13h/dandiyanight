// Authentication Context Provider
import { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const profile = userDoc.data();
            setUserProfile(profile);
            setIsAdmin(profile.role === 'admin');
          } else {
            setUserProfile(null);
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUserProfile(null);
          setIsAdmin(false);
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function register(email, password, name, mobile, address) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      name,
      email,
      mobile,
      address,
      role: 'user',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return user;
  }

  async function login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  }

  async function loginAsAdmin(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));

    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
      await signOut(auth);
      const error = new Error('Admin access is required');
      error.code = 'auth/admin-required';
      throw error;
    }

    return user;
  }

  async function logout() {
    setUserProfile(null);
    setIsAdmin(false);
    await signOut(auth);
  }

  async function resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  }

  async function refreshProfile() {
    if (currentUser) {
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const profile = userDoc.data();
        setUserProfile(profile);
        setIsAdmin(profile.role === 'admin');
      }
    }
  }

  const value = {
    currentUser,
    userProfile,
    isAdmin,
    loading,
    register,
    login,
    loginAsAdmin,
    logout,
    resetPassword,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
