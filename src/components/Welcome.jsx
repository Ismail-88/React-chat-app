import React, { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

const Welcome = () => {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Generate random avatar if none provided
  const generateRandomAvatar = (seed = null) => {
    const avatarStyles = [
      'avataaars', 'big-smile', 'bottts', 'croodles-neutral', 
      'fun-emoji', 'micah', 'open-peeps', 'personas'
    ];
    const randomStyle = avatarStyles[Math.floor(Math.random() * avatarStyles.length)];
    const avatarSeed = seed || Math.random().toString(36).substring(7);
    return `https://api.dicebear.com/7.x/${randomStyle}/svg?seed=${avatarSeed}`;
  };

  // Validate URL
  const isValidUrl = (string) => {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch (_) {
      return false;
    }
  };

  // Generate a unique email from username for Firebase Auth
  const generateEmail = (username) => {
    // Remove spaces and special characters, convert to lowercase
    const cleanUsername = username.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return `${cleanUsername}@chatroom.local`;
  };

  // Check if username exists
  const checkUsernameExists = async (username) => {
    try {
      const userDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking username:", error);
      return false;
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    setIsLoading(true);
    
    try {
      // Check if username already exists
      const usernameExists = await checkUsernameExists(username);
      if (usernameExists) {
        alert("Username already exists! Please choose a different one.");
        setIsLoading(false);
        return;
      }

      // Create unique email for Firebase Auth
      const email = generateEmail(username);
      
      // Create user with email/password
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Generate avatar if not provided or invalid URL
      let userAvatar = avatar;
      if (!avatar.trim() || !isValidUrl(avatar)) {
        userAvatar = generateRandomAvatar(username.trim());
      }
      
      // Update user profile
      await updateProfile(user, {
        displayName: username.trim(),
        photoURL: userAvatar
      });
      
      // Save user info to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        username: username.trim(),
        name: username.trim(),
        avatar: userAvatar,
        lastSeen: new Date(),
        isOnline: true,
        joinedAt: new Date()
      });

      // Reserve username
      await setDoc(doc(db, 'usernames', username.toLowerCase()), {
        uid: user.uid,
        username: username.trim(),
        createdAt: new Date()
      });
      
      console.log("User registered successfully!");
      
    } catch (error) {
      console.error("Error creating account:", error);
      
      if (error.code === 'auth/email-already-in-use') {
        alert("This username is already taken. Please choose a different one.");
      } else if (error.code === 'auth/weak-password') {
        alert("Password is too weak. Please use a stronger password.");
      } else {
        alert("Failed to create account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Generate email from username
      const email = generateEmail(username);
      
      // Sign in with email/password
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Update user status to online
      await setDoc(doc(db, 'users', user.uid), {
        isOnline: true,
        lastSeen: new Date()
      }, { merge: true });
      
      console.log("User signed in successfully!");
      
    } catch (error) {
      console.error("Error signing in:", error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        alert("Invalid username or password!");
      } else if (error.code === 'auth/too-many-requests') {
        alert("Too many failed attempts. Please try again later.");
      } else {
        alert("Failed to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Get preview avatar
  const getPreviewAvatar = () => {
    if (avatar && isValidUrl(avatar)) {
      return avatar;
    }
    if (username.trim()) {
      return generateRandomAvatar(username.trim());
    }
    return generateRandomAvatar();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {isLogin ? "Welcome Back!" : "Join Chat Room"}
          </h1>
          <p className="text-gray-600">
            {isLogin ? "Sign in to continue chatting" : "Create your account to start chatting"}
          </p>
        </div>

        {/* Toggle Login/Register */}
        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-l-lg font-medium transition-colors ${
              !isLogin 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-r-lg font-medium transition-colors ${
              isLogin 
                ? 'bg-indigo-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Sign In
          </button>
        </div>

        {/* Form */}
        <form onSubmit={isLogin ? handleSignIn : handleSignUp} className="space-y-6">
          {/* Avatar Preview - Only show for sign up */}
          {!isLogin && (avatar || username) && (
            <div className="flex justify-center">
              <img 
                src={getPreviewAvatar()} 
                alt="Avatar preview" 
                className="w-16 h-16 rounded-full border-4 border-indigo-100"
                onError={(e) => {
                  e.target.src = generateRandomAvatar(username.trim());
                }}
              />
            </div>
          )}

          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="Choose a unique username"
              required
              maxLength={30}
              pattern="[a-zA-Z0-9_]+"
              title="Username can only contain letters, numbers, and underscores"
            />
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your password"
              required
              minLength={6}
            />
          </div>

          {/* Confirm Password - Only show for sign up */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                placeholder="Confirm your password"
                required
                minLength={6}
              />
            </div>
          )}

          {/* Avatar URL - Only show for sign up */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar URL (Optional)
              </label>
              <input
                type="url"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all ${
                  avatar && !isValidUrl(avatar) ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="https://example.com/avatar.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                {avatar && !isValidUrl(avatar) ? (
                  <span className="text-red-500">Invalid URL. A random avatar will be used.</span>
                ) : (
                  "Leave empty to get a random avatar"
                )}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!username.trim() || !password.trim() || (!isLogin && password !== confirmPassword) || isLoading}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isLogin ? "Signing In..." : "Creating Account..."}
              </>
            ) : (
              isLogin ? "Sign In" : "Create Account"
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            {isLogin ? (
              <>Don't have an account? <button onClick={() => setIsLogin(false)} className="text-indigo-500 hover:underline">Sign up</button></>
            ) : (
              <>Already have an account? <button onClick={() => setIsLogin(true)} className="text-indigo-500 hover:underline">Sign in</button></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;