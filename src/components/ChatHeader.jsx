import React from "react";

const ChatHeader = ({ chatInfo = {} }) => {
  const {
    name = "Group Chat",
    avatar = "https://via.placeholder.com/40",
    isOnline = false,
    lastSeen = null,
    isTyping = false,
    typingUsers = [],
    memberCount = 0
  } = chatInfo;

  const getStatusText = () => {
    if (isTyping && typingUsers.length > 0) {
      if (typingUsers.length === 1) {
        return `${typingUsers[0]} is typing...`;
      } else if (typingUsers.length === 2) {
        return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
      } else {
        return `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`;
      }
    }
    
    if (isOnline) {
      return "online";
    }
    
    if (lastSeen) {
      return `last seen ${lastSeen}`;
    }
    
    if (memberCount > 0) {
      return `${memberCount} members`;
    }
    
    return "offline";
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-green-600 text-white z-50 shadow-md">
      <div className="flex items-center px-4 py-3">
        {/* Back button */}
        <button className="mr-3 p-1 hover:bg-green-700 rounded-full transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Profile info */}
        <div className="flex items-center flex-1">
          <div className="relative">
            <img
              src={avatar}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-white/20"
            />
            {isOnline && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="ml-3 flex-1">
            <h2 className="font-semibold text-lg leading-tight">{name}</h2>
            <p className={`text-sm leading-tight ${
              isTyping ? 'text-green-200' : 'text-green-100'
            }`}>
              {isTyping && (
                <span className="inline-flex items-center">
                  <span className="typing-dots mr-2">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </span>
              )}
              {getStatusText()}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </button>
          
          <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>

          <button className="p-2 hover:bg-green-700 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
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
    </div>
  );
};

export default ChatHeader;