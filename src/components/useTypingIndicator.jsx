import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, setDoc, onSnapshot, collection, query, where, deleteDoc, serverTimestamp } from 'firebase/firestore';

const useTypingIndicator = () => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const lastTypingTime = useRef(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Listen for typing users (excluding current user)
    const q = query(
      collection(db, 'typingStatus'),
      where('isTyping', '==', true),
      where('uid', '!=', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typing = [];
      const now = Date.now();
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        const lastUpdate = data.lastUpdate?.toMillis?.() || data.lastUpdate || 0;
        
        // Only show as typing if updated within last 5 seconds
        if (now - lastUpdate < 5000) {
          typing.push({
            uid: data.uid,
            name: data.name || 'Anonymous',
            avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name || data.uid}`
          });
        }
      });
      
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, []);

  const startTyping = async () => {
    if (!auth.currentUser) return;
    
    const now = Date.now();
    lastTypingTime.current = now;

    if (!isTyping) {
      setIsTyping(true);
    }

    try {
      await setDoc(doc(db, 'typingStatus', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName || 'Anonymous',
        avatar: auth.currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auth.currentUser.displayName || auth.currentUser.uid}`,
        isTyping: true,
        lastUpdate: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  const stopTyping = async () => {
    if (!auth.currentUser) return;
    
    setIsTyping(false);

    try {
      // Delete the typing status document to stop showing typing
      await deleteDoc(doc(db, 'typingStatus', auth.currentUser.uid));
    } catch (error) {
      console.error('Error stopping typing status:', error);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleTyping = () => {
    const now = Date.now();
    
    // Start typing if not typing or if it's been more than 1 second
    if (!isTyping || now - lastTypingTime.current > 1000) {
      startTyping();
    }
    
    lastTypingTime.current = now;

    // Reset the timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  };

  // Cleanup on unmount or user change
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (auth.currentUser) {
        stopTyping();
      }
    };
  }, []);

  // Stop typing when user signs out
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user && isTyping) {
        stopTyping();
      }
    });

    return unsubscribe;
  }, [isTyping]);

  return {
    typingUsers,
    isTyping,
    handleTyping,
    stopTyping
  };
};

export default useTypingIndicator;