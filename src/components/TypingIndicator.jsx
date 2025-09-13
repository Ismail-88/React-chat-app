import React from "react";

const TypingIndicator = ({ typingUsers = [] }) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].name} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].name} and ${typingUsers[1].name} are typing`;
    } else {
      return `${typingUsers[0].name} and ${typingUsers.length - 1} others are typing`;
    }
  };

  return (
    <div className="flex justify-start mb-4">
      <div className="flex max-w-xs lg:max-w-md">
        <img
          className="w-8 h-8 rounded-full object-cover mr-2"
          src={typingUsers[0]?.avatar || 'https://via.placeholder.com/32'}
          alt="typing user"
        />
        
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 mb-1 px-2">{getTypingText()}</p>
          
          <div className="relative px-4 py-3 bg-gray-100 rounded-lg rounded-bl-sm border border-gray-200">
            <div className="flex items-center space-x-1">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
            
            <div className="absolute top-0 left-0 -ml-2 w-0 h-0 border-r-8 border-r-gray-100 border-t-8 border-t-transparent border-b-8 border-b-transparent"></div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #9CA3AF;
          animation: typing-bounce 1.4s infinite ease-in-out both;
        }
        
        .typing-dot:nth-child(1) {
          animation-delay: -0.32s;
        }
        
        .typing-dot:nth-child(2) {
          animation-delay: -0.16s;
        }
        
        .typing-dot:nth-child(3) {
          animation-delay: 0s;
        }
        
        @keyframes typing-bounce {
          0%, 80%, 100% {
            transform: scale(0.8) translateY(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1) translateY(-4px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;