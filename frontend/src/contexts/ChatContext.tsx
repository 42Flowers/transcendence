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
}


export const ChatContext = createContext<ChatContextType>(undefined as any);

export const ChatProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [chanOrDm, setChanOrDm] = useState('');
  const [usersOrBanned, setUsersOrBanned] = useState('');
  const [isDm, setIsDm] = useState('');
  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentDm, setCurrentDm] = useState(null);

  return (
    <ChatContext.Provider value={{ chanOrDm, setChanOrDm, usersOrBanned, setUsersOrBanned, isDm, setIsDm, currentChannel, setCurrentChannel, currentDm, setCurrentDm }}>
      {children}
    </ChatContext.Provider>
  );
};
