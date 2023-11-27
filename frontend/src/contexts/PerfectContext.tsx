import { useState, createContext, } from 'react';

export const PerfectContext = createContext();

export const PerfectProvider = ({ children }) => {
  const [perfectWin, setPerfectWin] = useState(false);
  const [perfectLose, setPerfectLose] = useState(false);

  return (
    <PerfectContext.Provider value={{ perfectWin, setPerfectWin, perfectLose, setPerfectLose }}>
      {children}
    </PerfectContext.Provider>
  );
};