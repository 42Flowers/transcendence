import { useQuery } from 'react-query';
import { UserID, fetchAchievements } from '../../../api';
import Achievement from './Achievement/Achievement';
import map from 'lodash/map';
import './Achievements.css';

type AchievementsProps = {
    userId: UserID;
}

const AchievementsList: React.FC<AchievementsProps> = ({ userId }) => {
    const { isLoading, isError, data } = useQuery([ userId, 'achievements' ], () => fetchAchievements(userId));

    if (isLoading) {
        return 'Loading...';
    }
  
    if (isError) {
        return 'An error has occured';
    }

    return (
        map(data, achievement => (
            <Achievement key={achievement.id} {...achievement} />
        ))
    )
}

const Achievements: React.FC<AchievementsProps> = ({ userId }) => (
    <div className="achievements">
        <h2 className='title-a'>Achievements</h2>
        <AchievementsList userId={userId} />
    </div>  
);

export default Achievements;