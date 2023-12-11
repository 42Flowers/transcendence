import { useState, createContext, PropsWithChildren, } from 'react';
import default_avatar from "../assets/images/default_avatar.png";

export type AvatarContextType = {
  avatar: string;
  setAvatar: (avatar: string) => void;
}

export const AvatarContext = createContext<AvatarContextType>(undefined as any);

export const AvatarProvider: React.FC<PropsWithChildren> = ({ children })=> {
  const [ avatar, setAvatar ] = useState<string>(default_avatar);

  return (
    <AvatarContext.Provider value={{ avatar, setAvatar }}> 
      {children}
    </AvatarContext.Provider>
  );
};