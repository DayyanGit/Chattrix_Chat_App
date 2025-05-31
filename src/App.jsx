// App.jsx
import React, { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { useUserState } from './lib/userStore';
import { useChatStore } from './lib/chatStore';
import List from './components/list/List';
import Chat from './components/chat/Chat';
import Detail from './components/detail/Detail';
import Login from './components/login/Login';

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserState();
  const { chatId,showDetail } = useChatStore();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
    });

    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);

    return () => {
      unSub();
      window.removeEventListener('resize', handleResize);
    };
  }, [fetchUserInfo]);

  if (isLoading) return <div className='loading'>Loading...</div>;

  return (
    <div className='container'>
      {currentUser ? (
        <>
          {isMobile ? (
            chatId ? (showDetail? <Detail/> : <Chat />) : <List />
          ) : (
            <>
              <List />
              {chatId && <Chat />}
              {chatId && <Detail />}
            </>
          )}

        </>
      ) : (
        <Login />
      )}
    </div>
  );
};

export default App;

