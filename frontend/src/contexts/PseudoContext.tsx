import { useState, createContext, } from 'react';

export const PseudoContext = createContext();

export const PseudoProvider = ({ children }) => {
  const [pseudo, setPseudo] = useState(null);
  const [value, setValue] = useState('');

  return (
    <PseudoContext.Provider value={{ pseudo, setPseudo, value, setValue }}>
      {children}
    </PseudoContext.Provider>
  );
};