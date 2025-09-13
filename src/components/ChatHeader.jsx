import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc, collection, query, onSnapshot, where } from "firebase/firestore";

const ChatHeader = ({ typingUsers = [] }) => {
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Listen for online users
    const q = query(
      collection(db, 'users'),
      where('isOnline', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = [];
      snapshot.forEach((doc) => {
        users.push(doc.data());
      });
      setOnlineUsers(users);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      // Update user status to offline before signing out (only if document exists)
      if (auth.currentUser) {
        try {
          await setDoc(doc(db, 'users', auth.currentUser.uid), {
            isOnline: false,
            lastSeen: new Date()
          }, { merge: true });
        } catch (updateError) {
          // Ignore error if document doesn't exist, just proceed with signout
          console.log("User document doesn't exist, proceeding with signout");
        }
      }
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getStatusText = () => {
    if (typingUsers && typingUsers.length > 0) {
      if (typingUsers.length === 1) {
        return `${typingUsers[0].name} is typing...`;
      } else if (typingUsers.length === 2) {
        return `${typingUsers[0].name} and ${typingUsers[1].name} are typing...`;
      } else {
        return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing...`;
      }
    }
    
    const onlineCount = onlineUsers.length;
    if (onlineCount > 0) {
      return `${onlineCount} member${onlineCount > 1 ? 's' : ''} online`;
    }
    
    return "Community Chat";
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-green-600 text-white z-50 shadow-md">
        <div className="flex items-center px-4 py-3">
          {/* Group Avatar */}
          <div className="relative mr-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center border-2 border-white/20">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            {onlineUsers.length > 0 && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-green-800">
                  {onlineUsers.length > 99 ? '99+' : onlineUsers.length}
                </span>
              </div>
            )}
          </div>
          
          {/* Chat Info */}
          <div className="flex-1">
            <h2 className="font-semibold text-lg leading-tight">Community Chat</h2>
            <p className={`text-sm leading-tight ${
              typingUsers && typingUsers.length > 0 ? 'text-green-200' : 'text-green-100'
            }`}>
              {typingUsers && typingUsers.length > 0 && (
                <span className="inline-flex items-center mr-2">
                  <span className="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </span>
              )}
              {getStatusText()}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Online Users Button */}
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-green-700 rounded-full transition-colors relative"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              {onlineUsers.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-green-800 text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {onlineUsers.length}
                </span>
              )}
            </button>

            {/* Logout Button */}
            <button 
              onClick={handleSignOut}
              className="p-2 hover:bg-red-600 rounded-full transition-colors"
              title="Sign Out"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>

        {/* Online Users Dropdown */}
        {showMenu && (
          <div className="bg-white border-t border-green-500 shadow-lg max-h-60 overflow-y-auto">
            <div className="p-3">
              <h3 className="text-green-800 font-semibold mb-2">Online Users ({onlineUsers.length})</h3>
              {onlineUsers.length > 0 ? (
                <div className="space-y-2">
                  {onlineUsers.map((user) => (
                    <div key={user.uid} className="flex items-center space-x-3">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border-2 border-green-200"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">
                          {user.name}
                          {user.uid === auth.currentUser?.uid && (
                            <span className="text-green-600 ml-1">(You)</span>
                          )}
                        </p>
                      </div>
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">No users online</p>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .typing-dots {
          display: inline-flex;
          align-items: center;
        }
        
        .typing-dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background-color: currentColor;
          margin: 0 1px;
          animation: typing 1.4s infinite ease-in-out both;
        }
        
        .typing-dots span:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-dots span:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        @keyframes typing {
          0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
};

export default ChatHeader;