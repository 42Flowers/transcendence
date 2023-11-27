import { useState, createContext, } from 'react';

export const AchievementsListContext = createContext();

export const AchievementsListProvider = ({ children }) => {
  const [achievementsList, setAchievementsList] = useState([]);

  return (
    <AchievementsListContext.Provider value={{ achievementsList, setAchievementsList }}>
      {children}
    </AchievementsListContext.Provider>
  );
};