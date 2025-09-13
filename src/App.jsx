// import { auth } from "./firebase";
// import { useAuthState } from "react-firebase-hooks/auth";
// import "./index.css";
// // import NavBar from "./components/NavBar.jsx";
// import ChatBox from "./components/ChatBox.jsx";
// import Welcome from "./components/Welcome.jsx";

// function App() {
//   const [user] = useAuthState(auth);

//   return (
//     <div className="App">
//       {/* <NavBar /> */}
//       {!user ? (
//         <Welcome />
//       ) : (
//         <>
//           <ChatBox />
//         </>
//       )}
//     </div>
//   );
// }

// export default App;

import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import "./index.css";
import ChatRoom from './components/ChatRoom';
import Welcome from './components/Welcome'; // Your existing sign in component

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      {user ? (
        <ChatRoom />
      ) : (
        <Welcome />
      )}
    </div>
  );
}

export default App;