import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import ChatHeader from './ChatHeader';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import SendMessage from './SendMessage';
import useTypingIndicator from './useTypingIndicator';

const ChatRoom = () => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const { typingUsers, handleTyping, stopTyping } = useTypingIndicator();
  const scroll = useRef();

  useEffect(() => {
    if (!user) return;

    // Set user as online when entering chat
    const setUserOnline = async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          isOnline: true,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error setting user online:', error);
      }
    };

    setUserOnline();

    // Listen for messages
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(fetchedMessages);
    });

    // Set user offline when leaving
    const handleBeforeUnload = async () => {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          lastSeen: new Date()
        });
      } catch (error) {
        console.error('Error setting user offline:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribe();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload(); // Set offline when component unmounts
    };
  }, [user]);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold mb-2">Please sign in to continue</h2>
          <p className="text-gray-600">Join the conversation with other users</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader typingUsers={typingUsers} />
      
      <div 
        className="flex-1 overflow-y-auto px-4 pt-20 pb-24" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f2f5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
        }}
      >
        {messages && messages.length > 0 ? (
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>No messages yet. Start the conversation!</p>
            </div>
          </div>
        )}
        
        {typingUsers && typingUsers.length > 0 && (
          <TypingIndicator typingUsers={typingUsers} />
        )}
        
        <span ref={scroll}></span>
      </div>
      
      <SendMessage 
        scroll={scroll} 
        onTyping={handleTyping}
        onStopTyping={stopTyping}
      />
    </div>
  );
};

export default ChatRoom;