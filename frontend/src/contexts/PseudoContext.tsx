import { useState, createContext, } from 'react';

export const PseudoContext = createContext();

export const PseudoProvider = ({ children }) => {
  const [pseudo, setPseudo] = useState(null);

  return (
    <PseudoContext.Provider value={{ pseudo, setPseudo }}>
      {children}
    </PseudoContext.Provider>
  );
};