import React, { useState } from "react";
import { auth, db } from "../firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const SendMessage = ({ scroll, onTyping, onStopTyping }) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!message.trim() || isSending) return;

    setIsSending(true);
    
    // Stop typing indicator
    if (onStopTyping) {
      onStopTyping();
    }

    const messageToSend = message.trim();
    setMessage(""); // Clear input immediately for better UX

    try {
      const { uid, displayName, photoURL } = auth.currentUser;
      
      await addDoc(collection(db, "messages"), {
        text: messageToSend,
        name: displayName || "Anonymous",
        avatar: photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${displayName || uid}`,
        createdAt: serverTimestamp(),
        uid,
        timestamp: Date.now() // For immediate sorting while serverTimestamp is null
      });

      // Scroll to bottom after sending
      setTimeout(() => {
        scroll.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Restore message if sending failed
      setMessage(messageToSend);
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Trigger typing indicator when user types
    if (value.trim() && onTyping) {
      onTyping();
    } else if (!value.trim() && onStopTyping) {
      onStopTyping();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
      <form onSubmit={sendMessage} className="flex items-end space-x-3">
        {/* Message Input */}
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-3 border border-gray-300 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent max-h-32"
            placeholder="Type a message..."
            rows="1"
            style={{
              minHeight: '48px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}
            disabled={isSending}
          />
          
          {/* Emoji Button */}
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            onClick={() => {
              // You can add emoji picker functionality here
              setMessage(prev => prev + '😊');
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!message.trim() || isSending}
          className="w-12 h-12 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-full flex items-center justify-center transition-colors flex-shrink-0"
        >
          {isSending ? (
            <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default SendMessage;



// import React, { useState } from "react";
// import { auth, db } from "../firebase";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";
// import useTypingIndicator from "./useTypingIndicator";

// const SendMessage = ({ scroll }) => {
//   const [message, setMessage] = useState("");
//   const { handleTyping, stopTyping } = useTypingIndicator();

//   const sendMessage = async (event) => {
//     event.preventDefault();
//     if (message.trim() === "") {
//       alert("Enter valid message");
//       return;
//     }

//     stopTyping();

//     const { uid, displayName, photoURL } = auth.currentUser;
//     await addDoc(collection(db, "messages"), {
//       text: message,
//       name: displayName,
//       avatar: photoURL,
//       createdAt: serverTimestamp(),
//       uid,
//     });
//     setMessage("");
//     scroll.current.scrollIntoView({ behavior: "smooth" });
//   };

//   const handleInputChange = (e) => {
//     setMessage(e.target.value);
    
//     if (e.target.value.trim()) {
//       handleTyping();
//     } else {
//       stopTyping();
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === 'Backspace' && !message.trim()) {
//       stopTyping();
//     }
//   };

//   return (
//     <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
//       <form onSubmit={sendMessage} className="flex items-center space-x-3">
//         <label htmlFor="messageInput" hidden>
//           Enter Message
//         </label>
        
//         <div className="flex-1 relative">
//           <input
//             id="messageInput"
//             name="messageInput"
//             type="text"
//             className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
//             placeholder="Type a message..."
//             value={message}
//             onChange={handleInputChange}
//             onKeyDown={handleKeyDown}
//             onBlur={stopTyping}
//           />
          
//           <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
//             <button
//               type="button"
//               className="text-gray-400 hover:text-gray-600 focus:outline-none"
//             >
//               📎
//             </button>
//             <button
//               type="button"
//               className="text-gray-400 hover:text-gray-600 focus:outline-none"
//             >
//               😊
//             </button>
//           </div>
//         </div>
        
//         <button
//           type="submit"
//           disabled={!message.trim()}
//           className={`p-3 rounded-full transition-colors duration-200 ${
//             message.trim()
//               ? 'bg-green-500 hover:bg-green-600 text-white'
//               : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//           }`}
//         >
//           <svg
//             className="w-5 h-5"
//             fill="currentColor"
//             viewBox="0 0 20 20"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//           </svg>
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SendMessage;





// import React, { useState } from "react";
// import { auth, db } from "../firebase";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// const SendMessage = ({ scroll }) => {
//   const [message, setMessage] = useState("");

//   const sendMessage = async (event) => {
//     event.preventDefault();
//     if (message.trim() === "") {
//       alert("Enter valid message");
//       return;
//     }
//     const { uid, displayName, photoURL } = auth.currentUser;
//     await addDoc(collection(db, "messages"), {
//       text: message,
//       name: displayName,
//       avatar: photoURL,
//       createdAt: serverTimestamp(),
//       uid,
//     });
//     setMessage("");
//     scroll.current.scrollIntoView({ behavior: "smooth" });
//   };

//   return (
//     <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3">
//       <form onSubmit={(event) => sendMessage(event)} className="flex items-center space-x-3">
//         <label htmlFor="messageInput" hidden>
//           Enter Message
//         </label>
        
//         {/* Message input */}
//         <div className="flex-1 relative">
//           <input
//             id="messageInput"
//             name="messageInput"
//             type="text"
//             className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-500"
//             placeholder="Type a message..."
//             value={message}
//             onChange={(e) => setMessage(e.target.value)}
//           />
          
//           {/* Emoji/attachment icons (optional) */}
//           <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//             <button
//               type="button"
//               className="text-gray-400 hover:text-gray-600 focus:outline-none"
//             >
//               😊
//             </button>
//           </div>
//         </div>
        
//         {/* Send button */}
//         <button
//           type="submit"
//           disabled={!message.trim()}
//           className={`p-3 rounded-full transition-colors duration-200 ${
//             message.trim()
//               ? 'bg-green-500 hover:bg-green-600 text-white'
//               : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//           }`}
//         >
//           <svg
//             className="w-5 h-5"
//             fill="currentColor"
//             viewBox="0 0 20 20"
//             xmlns="http://www.w3.org/2000/svg"
//           >
//             <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
//           </svg>
//         </button>
//       </form>
//     </div>
//   );
// };

// export default SendMessage;


// import React, { useState } from "react";
// import { auth, db } from "../firebase";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// const SendMessage = ({ scroll }) => {
//   const [message, setMessage] = useState("");

//   const sendMessage = async (event) => {
//     event.preventDefault();
//     if (message.trim() === "") {
//       alert("Enter valid message");
//       return;
//     }
//     const { uid, displayName, photoURL } = auth.currentUser;
//     await addDoc(collection(db, "messages"), {
//       text: message,
//       name: displayName,
//       avatar: photoURL,
//       createdAt: serverTimestamp(),
//       uid,
//     });
//     setMessage("");
//     scroll.current.scrollIntoView({ behavior: "smooth" });
//   };
//   return (
//     <form onSubmit={(event) => sendMessage(event)} className="send-message">
//       <label htmlFor="messageInput" hidden>
//         Enter Message
//       </label>
//       <input
//         id="messageInput"
//         name="messageInput"
//         type="text"
//         className="form-input__input"
//         placeholder="type message..."
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//       />
//       <button type="submit">Send</button>
//     </form>
//   );
// };

// export default SendMessage;


// import React, { useState } from "react";
// import { auth, db } from "../firebase";
// import { addDoc, collection, serverTimestamp } from "firebase/firestore";

// const SendMessage = ({ scroll }) => {
//   const [message, setMessage] = useState("");
//   const [isFocused, setIsFocused] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   const sendMessage = async (event) => {
//     event.preventDefault();
//     if (message.trim() === "") {
//       alert("Enter valid message");
//       return;
//     }
    
//     setIsLoading(true);
//     try {
//       const { uid, displayName, photoURL } = auth.currentUser;
//       await addDoc(collection(db, "messages"), {
//         text: message,
//         name: displayName,
//         avatar: photoURL,
//         createdAt: serverTimestamp(),
//         uid,
//       });
//       setMessage("");
//       scroll.current.scrollIntoView({ behavior: "smooth" });
//     } catch (error) {
//       console.error("Error sending message:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleKeyPress = (event) => {
//     if (event.key === 'Enter' && !event.shiftKey) {
//       event.preventDefault();
//       sendMessage(event);
//     }
//   };

//   return (
//     <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent px-3 py-4 sm:px-6 sm:py-6 backdrop-blur-sm">
//       <div className="max-w-4xl mx-auto">
//         <div className="relative">
//           <div className={`
//             relative flex items-center bg-white rounded-2xl sm:rounded-full shadow-lg border-2 transition-all duration-300 ease-in-out overflow-hidden
//             ${isFocused 
//               ? 'border-blue-500 shadow-2xl shadow-blue-500/20 sm:scale-105' 
//               : 'border-gray-200 hover:border-gray-300 hover:shadow-xl'
//             }
//           `}>
            
//             {/* Animated gradient background */}
//             <div className={`
//               absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 transition-opacity duration-300
//               ${isFocused ? 'opacity-100' : 'opacity-0'}
//             `} />
            
//             {/* Message input */}
//             <div className="relative flex-1 px-4 py-3 sm:px-6 sm:py-4">
//               <textarea
//                 id="messageInput"
//                 name="messageInput"
//                 rows="1"
//                 className="w-full bg-transparent text-gray-800 placeholder-gray-500 text-base sm:text-lg font-medium focus:outline-none resize-none max-h-32 leading-relaxed"
//                 placeholder="Type your message..."
//                 value={message}
//                 onChange={(e) => {
//                   setMessage(e.target.value);
//                   // Auto-resize textarea
//                   e.target.style.height = 'auto';
//                   e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
//                 }}
//                 onKeyPress={handleKeyPress}
//                 onFocus={() => setIsFocused(true)}
//                 onBlur={() => setIsFocused(false)}
//                 disabled={isLoading}
//                 style={{ minHeight: '24px' }}
//               />
              
//               {/* Character count indicator */}
//               {message.length > 0 && (
//                 <div className="absolute bottom-1 right-2 text-xs text-gray-400">
//                   {message.length}
//                 </div>
//               )}
//             </div>

//             {/* Send button - Mobile optimized */}
//             <button
//               onClick={sendMessage}
//               disabled={message.trim() === "" || isLoading}
//               className={`
//                 relative m-2 flex items-center justify-center min-w-12 min-h-12 sm:px-6 sm:py-3 rounded-full font-semibold text-white transition-all duration-300 ease-in-out transform touch-manipulation
//                 ${message.trim() === "" || isLoading
//                   ? 'bg-gray-300 cursor-not-allowed scale-95 opacity-50'
//                   : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 active:scale-95 shadow-lg hover:shadow-xl'
//                 }
//               `}
//             >
//               <div className="flex items-center space-x-2">
//                 <span className="hidden sm:inline">{isLoading ? 'Sending...' : 'Send'}</span>
//                 {isLoading ? (
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 ) : (
//                   <svg 
//                     className="w-5 h-5 sm:w-4 sm:h-4 transition-transform duration-200"
//                     fill="none" 
//                     stroke="currentColor" 
//                     viewBox="0 0 24 24"
//                   >
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
//                   </svg>
//                 )}
//               </div>
              
//               {/* Button glow effect */}
//               {message.trim() && !isLoading && (
//                 <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-20 blur animate-pulse" />
//               )}
//             </button>
//           </div>

//           {/* Typing indicator dots */}
//           {isFocused && message.length > 0 && !isLoading && (
//             <div className="flex justify-center mt-2 sm:mt-3">
//               <div className="flex space-x-1">
//                 <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
//                 <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
//                 <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Quick actions - Mobile optimized */}
//         <div className="flex justify-center mt-3 sm:mt-4 space-x-3 sm:space-x-4">
//           <button className="p-3 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200 touch-manipulation">
//             <svg className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
//             </svg>
//           </button>
          
//           <button className="p-3 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200 touch-manipulation">
//             <svg className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
//             </svg>
//           </button>
          
//           <button className="p-3 sm:p-2 rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors duration-200 touch-manipulation">
//             <svg className="w-5 h-5 sm:w-5 sm:h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1a3 3 0 000-6h-1m4 6V4a3 3 0 013 3v4M9 10v8a3 3 0 003 3h1a3 3 0 003-3v-2" />
//             </svg>
//           </button>
//         </div>

//         {/* Safe area padding for mobile devices */}
//         <div className="h-safe-area-inset-bottom sm:h-0" />
//       </div>
//     </div>
//   );
// };

// export default SendMessage;