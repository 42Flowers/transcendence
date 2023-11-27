import { useState, createContext, } from 'react';

export const LeaderContext = createContext();

export const LeaderProvider = ({ children }) => {
  const [smallLeader, setSmallLeader] = useState(false);
  const [greatLeader, setGreatLeader] = useState(false);

  return (
    <LeaderContext.Provider value={{ smallLeader, setSmallLeader, greatLeader, setGreatLeader }}>
      {children}
    </LeaderContext.Provider>
  );
};