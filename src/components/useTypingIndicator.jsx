import { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { doc, updateDoc, onSnapshot, collection, query, where, setDoc } from 'firebase/firestore';

const useTypingIndicator = () => {
  const [typingUsers, setTypingUsers] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const lastTypingTime = useRef(0);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'typingStatus'),
      where('isTyping', '==', true),
      where('uid', '!=', auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typing = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const now = Date.now();
        const lastUpdate = data.lastUpdate?.toMillis() || 0;
        if (now - lastUpdate < 3000) {
          typing.push(data);
        }
      });
      setTypingUsers(typing);
    });

    return () => unsubscribe();
  }, []);

  const startTyping = async () => {
    if (!auth.currentUser || isTyping) return;
    
    setIsTyping(true);
    const now = Date.now();
    lastTypingTime.current = now;

    try {
      await setDoc(doc(db, 'typingStatus', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        avatar: auth.currentUser.photoURL,
        isTyping: true,
        lastUpdate: new Date()
      }, { merge: true });
    } catch (error) {
      console.error('Error updating typing status:', error);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = async () => {
    if (!auth.currentUser || !isTyping) return;
    
    setIsTyping(false);

    try {
      await setDoc(doc(db, 'typingStatus', auth.currentUser.uid), {
        uid: auth.currentUser.uid,
        name: auth.currentUser.displayName,
        avatar: auth.currentUser.photoURL,
        isTyping: false,
        lastUpdate: new Date()
      }, { merge: true });
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
    
    if (!isTyping || now - lastTypingTime.current > 1000) {
      startTyping();
    }
    
    lastTypingTime.current = now;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      stopTyping();
    };
  }, []);

  return {
    typingUsers,
    isTyping,
    handleTyping,
    stopTyping
  };
};

export default useTypingIndicator;