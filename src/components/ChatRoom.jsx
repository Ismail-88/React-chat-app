import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import ChatHeader from './ChatHeader';
import Message from './Message';
import TypingIndicator from './TypingIndicator';
import SendMessage from './SendMessage';
import useTypingIndicator from './useTypingIndicator';

const ChatRoom = () => {
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const { typingUsers } = useTypingIndicator();
  const scroll = useRef();

  const chatInfo = {
    name: "Family Group",
    avatar: "https://via.placeholder.com/40",
    isOnline: true,
    lastSeen: "2 minutes ago",
    isTyping: typingUsers.length > 0,
    typingUsers: typingUsers.map(user => user.name),
    memberCount: 5
  };

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (QuerySnapshot) => {
      const fetchedMessages = [];
      QuerySnapshot.forEach((doc) => {
        fetchedMessages.push({ ...doc.data(), id: doc.id });
      });
      setMessages(fetchedMessages);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    scroll.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Please sign in to continue</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ChatHeader chatInfo={chatInfo} />
      
      <div className="flex-1 overflow-y-auto px-4 pt-20 pb-24" style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f0f2f5' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` 
      }}>
        {messages &&
          messages.map((message) => (
            <Message key={message.id} message={message} />
          ))}
        
        {typingUsers.length > 0 && (
          <TypingIndicator typingUsers={typingUsers} />
        )}
        
        <span ref={scroll}></span>
      </div>
      
      <SendMessage scroll={scroll} />
    </div>
  );
};

export default ChatRoom;