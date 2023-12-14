import sortBy from "lodash/sortBy";
import { PropsWithChildren, createContext, useState, } from 'react';
import { ChannelMessage } from '../api';
import { useSocketEvent } from '../components/Socket/Context/Context';
import { queryClient } from '../query-client';

export interface ChatContextType {
  chanOrDm: string
  setChanOrDm: (chanOrDm: string) => void;
  usersOrBanned: string
  setUsersOrBanned: (usersOrBanned: string) => void;
  isDm: boolean
  setIsDm: (isDm: boolean) => void;
  isPrivate: boolean;
  setIsPrivate: (isPrivate: boolean) => void;
  currentChannel: number 
  setCurrentChannel: (currentChannel: number) => void;
  currentDm: number
  setCurrentDm: (currentDm: number) => void;
  currentConv: number
  setCurrentConv: (currentConv: number) => void;
  currentAvatar: string | null
  setCurrentAvatar: (currentAvatar: string) => void;
  currentChannelName: string
  setCurrentChannelName: (currentChannelName: string) => void;
  myPermissionMask: number 
  setMyPermissionMask: (myPermissionMask: number) => void;
  currentAccessMask: number 
  setCurrentAccessMask: (currentAccessMask: number) => void;
  isBanned: boolean 
  setIsBanned: (isBanned: boolean ) => void;
}

interface PushedMessagePayload {
  type: 'channel' | 'conversation',
  id: number, //channelId/targetId
  authorId: number,
  authorName: string 
  message: string,
  createdAt: string,
  msgId: number,
}


export const ChatContext = createContext<ChatContextType>(undefined as any);

function useMonitorChatEvents() {
  useSocketEvent<PushedMessagePayload>('message', ({ type, id, message, msgId, ...rest }) => {
    if ('conversation' !== type)
        return ;

    const queryKey = [ 'dm-messages', id ];

    if (queryClient.getQueryData(queryKey) !== undefined) {
        queryClient.setQueryData<ChannelMessage[]>(queryKey, messages => sortBy([
            ...(messages ?? []),
            {
                id: msgId,
                content: message,
                ...rest,
            }
        ], 'id'));
    }
});

  useSocketEvent<PushedMessagePayload>('message', ({ type, id, msgId, message, ...rest }) => {
  if ('channel' !== type)
      return ;

  const queryKey = [ 'channel-messages', id ];

  if (queryClient.getQueryData(queryKey) !== undefined) {
      queryClient.setQueryData<ChannelMessage[]>(queryKey, messages => sortBy([
          ...(messages ?? []),
          {
              id: msgId,
              content: message,
              ...rest,
          }
      ], 'id'));
  }
  });
}

export const ChatProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [chanOrDm, setChanOrDm] = useState('channel');
  const [usersOrBanned, setUsersOrBanned] = useState('users');
  const [isDm, setIsDm] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
  const [isPrivate, setIsPrivate ] = useState(false);
  const [currentChannel, setCurrentChannel] = useState(0);
  const [currentDm, setCurrentDm] = useState(0);
  const [currentConv, setCurrentConv] = useState(0);
  const [currentChannelName, setCurrentChannelName] = useState('');
  const [myPermissionMask, setMyPermissionMask] = useState(0);
  const [currentAccessMask, setCurrentAccessMask] = useState(1);
  const [isBanned, setIsBanned] = useState(false);

  useMonitorChatEvents();

  return (
    <ChatContext.Provider value={{
      chanOrDm, setChanOrDm,
      usersOrBanned, setUsersOrBanned,
      isDm, setIsDm,
      currentChannel, setCurrentChannel,
      currentDm, setCurrentDm,
      currentConv, setCurrentConv,
      currentAvatar, setCurrentAvatar,
      currentChannelName, setCurrentChannelName,
      myPermissionMask, setMyPermissionMask,
      currentAccessMask, setCurrentAccessMask,
      isBanned, setIsBanned,
      isPrivate, setIsPrivate,
    }}>
      {children}
    </ChatContext.Provider>
  );
};
