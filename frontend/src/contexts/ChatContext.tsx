import { useState, createContext, PropsWithChildren, } from 'react';

export interface ChatContextType {
  chanOrDm: string
  setChanOrDm: (chanOrDm: string) => void;
  usersOrBanned: string
  setUsersOrBanned: (usersOrBanned: string) => void;
  isDm: boolean
  setIsDm: (isDm: boolean) => void;
  currentChannel: number 
  setCurrentChannel: (currentChannel: number) => void;
  currentDm: number
  setCurrentDm: (currentDm: number) => void;
  currentChannelName: string
  setCurrentChannelName: (currentChannelName: string) => void;
  myPermissionMask: number 
  setMyPermissionMask: (myPermissionMask: number) => void;
  currentAccessMask: number 
  setCurrentAccessMask: (currentAccessMask: number) => void;
}


export const ChatContext = createContext<ChatContextType>(undefined as any);

export const ChatProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [chanOrDm, setChanOrDm] = useState('channel');
  const [usersOrBanned, setUsersOrBanned] = useState('users');
  const [isDm, setIsDm] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(0);
  const [currentDm, setCurrentDm] = useState(0);
  const [currentChannelName, setCurrentChannelName] = useState('');
  const [myPermissionMask, setMyPermissionMask] = useState(0);
  const [currentAccessMask, setCurrentAccessMask] = useState(1);

  return (
    <ChatContext.Provider value={{ chanOrDm, setChanOrDm, usersOrBanned, setUsersOrBanned, isDm, setIsDm, currentChannel, setCurrentChannel, currentDm, setCurrentDm, currentChannelName, setCurrentChannelName, myPermissionMask, setMyPermissionMask, currentAccessMask, setCurrentAccessMask }}>
      {children}
    </ChatContext.Provider>
  );
};
