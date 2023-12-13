import React, { PropsWithChildren, } from 'react';
import { fetchUserProfile } from '../api';
import { useQuery } from 'react-query';
import get from 'lodash/get';

export type AvatarContextType = {
  avatar: string | null;
}

export const AvatarContext = React.createContext<AvatarContextType>(undefined as any);

export const AvatarProvider: React.FC<PropsWithChildren> = ({ children })=> {
  const currentUser = useQuery('@me', () => fetchUserProfile('@me'));
  const avatar = get(currentUser.data, 'avatar', null);

  return (
    <AvatarContext.Provider value={{ avatar }}> 
      {children}
    </AvatarContext.Provider>
  );
};