import Achievement from './Achievement/Achievement';
import { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AchievementsListContext } from '../../../contexts/AchievementsListContext';

import './Achievements.css';
import { fetchAchievements } from '../../../api';
import { useQuery } from 'react-query';

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

type AchievementsProps = {
    userId: number;
    auth: number;
}

const Achievements: React.FC<AchievementsProps> = ({ userId, auth }) => {
    const { achievementsList, setAchievementsList } = useContext(AchievementsListContext) as AchievementsListContextType;

    const achievementsQuery = useQuery('achievements', fetchAchievements, {
        enabled: userId === auth,
        onSuccess(data) {
            setAchievementsList(data);
        }, 
    });

    useEffect(() => {
        if (userId !== auth) {
            fetch(`http://localhost:3000/api/profile/${userId}/achievements`)
                .then(response => response.json())
                .then(data => {
                    setAchievementsList(data);
                });
        }
    }, [userId, auth]);

    return (
        <div className="achievements">
            <h2 className='title-a'>Achievements</h2>
            {/* { achievementsQuery.isLoading && 'Loading...' }
            {
                achievementsQuery.isFetched && (achievementsQuery.data.map(achievement => (
                    <Achievement key={achievement.achievement.id} {...achievement.achievement} />
                )))
            } */}
            {
                (achievementsList.map(achievement => (
                    <Achievement key={achievement.achievement.id} {...achievement.achievement} />
                )))
            }
        </div>
    );
};

export default Achievements;