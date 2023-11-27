import Achievement from './Achievement/Achievement';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import './Achievements.css';

const Achievements: React.FC = () => {

    // function mockData(
    //     name: string,
    //     description: string,
    //     difficulty: number,
    //     isHidden: boolean,
    // ) {
    //     return { name, description, difficulty, isHidden };
    // }
    
    // const rows = [
    //     mockData('name1', '10 wins in a row', 1, false),
    //     mockData('name22', '20 wins in a row', 2, false),
    //     mockData('name333', '100 wins in a row', 3, false),
    //     mockData('name4444', 'Won against 3 different players', 1, false),
    //     mockData('name55555', 'Abandonned when the score was 0-0', 1, true),
    // ];

    const [achievementsList, setAchievementsList] = useState([]);
    const { userId } = useParams();

    useEffect(() => {
        fetch(`http://localhost:3000/api/profile/${userId}/achievements`)
        .then(response => response.json())
        .then(data => {
            setAchievementsList(data);
        });
    }, [userId])

    return (
        <div className="achievements">
            <h2 className='title-a'>Achievements</h2>
            {achievementsList.map((achievement) => {
                console.log(achievement.achievement);
                return <Achievement {...achievement.achievement} />;
            })}
        </div>
    );
};

export default Achievements;