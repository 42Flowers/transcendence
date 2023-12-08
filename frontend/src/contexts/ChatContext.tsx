import { useState, createContext, } from 'react';

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [chanOrDm, setChanOrDm] = useState('');
  const [usersOrBanned, setUsersOrBanned] = useState('');
  const [isDm, setIsDm] = useState('');
  const [currentChannel, setCurrentChannel] = useState();
  const [currentDm, setCurrentDm] = useState();

  return (
    <ChatContext.Provider value={{ chanOrDm, setChanOrDm, usersOrBanned, setUsersOrBanned, isDm, setIsDm, currentChannel, setCurrentChannel, currentDm, setCurrentDm }}>
      {children}
    </ChatContext.Provider>
  );
};