import Achievement from './Achievement/Achievement';
import { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AchievementsListContext } from '../../../contexts/AchievementsListContext';

import './Achievements.css';

interface Achievement {
    id: number;
    name: string;
    description: string;
    difficulty: number;
    isHidden: boolean;
    createdAt: Date;
 }
 
 interface UserAchievement {
    userId: number;
    achievement: Achievement;
 }

interface AchievementsListContextType {
    achievementsList: UserAchievement[];
    setAchievementsList: (achievementsList: UserAchievement[]) => void;
}

const Achievements: React.FC = () => {
    const { achievementsList, setAchievementsList } = useContext(AchievementsListContext) as AchievementsListContextType;
    const { userId } = useParams();

    useEffect(() => {
        fetch(`http://localhost:3000/api/profile/${userId}/achievements`)
        .then(response => response.json())
        .then(data => {
            setAchievementsList(data);
        });
    }, [userId, setAchievementsList])

    return (
        <div className="achievements">
            <h2 className='title-a'>Achievements</h2>
            {achievementsList.map((achievement) => {
                return <Achievement key={achievement.achievement.id} {...achievement.achievement} />;
            })}
        </div>
    );
};

export default Achievements;