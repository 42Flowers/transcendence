import { useState, createContext, PropsWithChildren, } from 'react';

export interface LeaderContextType {
  smallLeader: boolean
  setSmallLeader: (smallLeader: boolean) => void;
  greatLeader: boolean
  setGreatLeader: (greatLeader: boolean) => void;
}

export interface PerfectContextType {
  perfectWin: boolean
  setPerfectWin: (perfectWin: boolean) => void;
  perfectLose: boolean
  setPerfectLose: (perfectLose: boolean) => void;
}

export const LeaderContext = createContext<LeaderContextType>(undefined as any);

export const LeaderProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [smallLeader, setSmallLeader] = useState(false);
  const [greatLeader, setGreatLeader] = useState(false);

  return (
    <LeaderContext.Provider value={{ smallLeader, setSmallLeader, greatLeader, setGreatLeader }}>
      {children}
    </LeaderContext.Provider>
  );
};