

import React from "react";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

const Message = ({ message }) => {
  const [user] = useAuthState(auth);
  const isCurrentUser = message.uid === user.uid;

  return (
    <div className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-xs lg:max-w-md ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <img
          className={`w-8 h-8 rounded-full object-cover ${
            isCurrentUser ? 'ml-2' : 'mr-2'
          }`}
          src={message.avatar || 'https://via.placeholder.com/32'}
          alt="user avatar"
        />
        
        {/* Message bubble */}
        <div className="flex flex-col">
          {/* User name - only show for others' messages */}
          {!isCurrentUser && (
            <p className="text-xs text-gray-500 mb-1 px-2">{message.name}</p>
          )}
          
          {/* Message content */}
          <div
            className={`relative px-4 py-2 rounded-lg break-words ${
              isCurrentUser
                ? 'bg-green-500 text-white rounded-br-sm'
                : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
            }`}
          >
            <p className="text-sm">{message.text}</p>
            
            {/* Message tail */}
            <div
              className={`absolute top-0 w-0 h-0 ${
                isCurrentUser
                  ? 'right-0 -mr-2 border-l-8 border-l-green-500 border-t-8 border-t-transparent border-b-8 border-b-transparent'
                  : 'left-0 -ml-2 border-r-8 border-r-white border-t-8 border-t-transparent border-b-8 border-b-transparent'
              }`}
            />
          </div>
          
          {/* Timestamp */}
          <p className={`text-xs text-gray-400 mt-1 px-2 ${
            isCurrentUser ? 'text-right' : 'text-left'
          }`}>
            {message.createdAt?.toDate?.()?.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            }) || 'now'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Message;

// import React from "react";
// import { auth } from "../firebase";
// import { useAuthState } from "react-firebase-hooks/auth";

// const Message = ({ message }) => {
//   const [user] = useAuthState(auth);
//   return (
//     <div
//       className={`chat-bubble ${message.uid === user.uid ? "right" : ""}`}>
//       <img
//         className="chat-bubble__left"
//         src={message.avatar}
//         alt="user avatar"
//       />
//       <div className="chat-bubble__right">
//         <p className="user-name">{message.name}</p>
//         <p className="user-message">{message.text}</p>
//       </div>
//     </div>
//   );
// };

// export default Message;