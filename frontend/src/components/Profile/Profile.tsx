import React from "react";
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { AvatarContext } from "../../contexts/AvatarContext";
import { PseudoContext } from "../../contexts/PseudoContext";
import { AchievementsListContext } from "../../contexts/AchievementsListContext";
import { LeaderContext } from "../../contexts/LeaderContext";
import async from 'async';

import Stats from "../Stats/Stats";
import Ladder from "./Ladder/Ladder";
import MatchHistory from "./MatchHistory/MatchHistory";
import Achievements from "./Achievements/Achievements";
import Switch2FA from "./Switch2FA/Switch2FA";
import PopUp from "../PopUp/PopUp";
import PseudoButton from "./PseudoButton/PseudoButton";
import ChangeAvatar from "./ChangeAvatar/ChangeAvatar";

import './Profile.css';
import { PerfectContext } from "../../contexts/PerfectContext";

interface Props {
    onRouteChange: (route: string) => void;
}

export interface AvatarContextType {
    avatar: string;
    setAvatar: (avatar: string) => void;
}

export interface PseudoContextType {
    pseudo: string
    setPseudo: (pseudo: string) => void;
}

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

type GameResult = {
    winnerId: number
    createdAd: Date
};
   
type Game = {
    gameResult: GameResult;
};

const Profile: React.FC<Props> = () => {
    const [profileInfos, setProfileInfos] = useState(null);
    const [currentPopup, setCurrentPopup] = useState({
        'Newwww Avatar': false,
        'Newwww Pseudo': false,
        '3 total': false,
        '10 total': false,
        '100 total': false,
        'First Game': false,
        'You\'re getting used to Pong': false,
        'You\'re playing a lot': false,
        '3': false,
        '10': false,
        '100': false,
        'Small Leader': false,
        'Great Leader': false,
        'Perfect win': false,
        'You\'re a looser': false,
    });
    const [popupQueue, setPopupQueue] = useState([]);
    const [isPseudoAdded, setIsPseudoAdded] = useState(false);
    const { userId } = useParams();

    const { avatar, setAvatar } = useContext(AvatarContext) as AvatarContextType;
    const { setAchievementsList } = useContext(AchievementsListContext) as AchievementsListContextType;
    const { pseudo, setPseudo } = useContext(PseudoContext) as PseudoContextType;
    const { smallLeader, greatLeader } = useContext(LeaderContext) as LeaderContextType;
    const { perfectWin, perfectLose } = useContext(PerfectContext) as PerfectContextType;

    const gamesWonFunc = ( userId: string, games: Game[] ): number => {
        let gamesWon = 0;
        games.map(game => {
            if (game.game.winnerId == userId) {
                gamesWon++;
            }
        });
        return gamesWon;
    };

    const showPopup = (popup) => {
        setCurrentPopup(prevPopup => ({
            ...prevPopup,
            [popup]: true
        }));
        setPopupQueue(prevQueue => [...prevQueue, popup]);
    }

    const gamesWonInARowFunc = (userId: string, games): number => {
        games.sort((a, b) => new Date(a.game.createdAt).getTime() - new Date(b.game.createdAt).getTime());

        let maxConsecutiveWins = 0;
        let currentConsecutiveWins = 0;

        games.forEach((game) => {
            if (userId == game.game.winnerId) {
                currentConsecutiveWins++;
                maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins);
            } else {
                currentConsecutiveWins = 0;
            }
        });

        return maxConsecutiveWins;
    };

    const requestOptionsAchievements = useCallback((achievementName, data) => {
        console.log("2", achievementName, data);
        if (data !== undefined) {
            const requestOptionsGame = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: Number(userId), achievementId: data.achievements[achievementName].id }),
            }
            return requestOptionsGame;
        }
     }, [userId]);
     
     const addAchievement = useCallback(( requestOptions ) => {
        console.log("3", requestOptions);
        return fetch(`http://localhost:3000/api/profile/${userId}/add-achievement-to-user`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Bad Request');
                }
                return response.json();
            })
            .then((data) => {
                console.log('Success:', data);
                return fetch(`http://localhost:3000/api/profile/${userId}/achievements`)
                    .then(response => response.json())
                    .then(data => {
                       setAchievementsList(data);
                    });
            })
            .catch((error) => {
                console.error(error);
            });
     }, [userId, setAchievementsList]);

     // Only with SQLite ? For Postgresql might need to change concurrency limite or pool size
     const queue = async.queue((task, callback) => {
        addAchievement(task.requestOptions)
         .then(data => {
           callback(null, data);
         })
         .catch(error => {
           callback(error);
         });
       }, 1); // Set concurrency limit to 1
 
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`http://localhost:3000/api/profile/${userId}`);
            const data = await response.json();
            if (data.avatar !== avatar) {
                setAvatar(`http://localhost:3000/static/${data.avatar}`);
            }
            if (data.pseudo !== pseudo) {
                setPseudo(data.pseudo);
            }
            setProfileInfos(prevState => {
                if (JSON.stringify(data) !== JSON.stringify(prevState)) {
                    return data;
                }
                return prevState;
            });
            if (data.achievements["Newwww Pseudo"].users.length > 0) {
                setIsPseudoAdded(true);
            }

            if (data !== null) {
                const handleAchievement = (achievementName: string) => {
                    showPopup(achievementName);
                    const requestOptions = requestOptionsAchievements(achievementName, data);
                    queue.push({ requestOptions });
                };

                const gamesWon = gamesWonFunc(userId, data?.gamesParticipated);
                if (gamesWon >= 3 && data?.achievements['3 total'].users.length === 0) {
                    handleAchievement('3 total');
                }
                if (gamesWon >= 10 && data?.achievements['10 total'].users.length === 0) {
                    handleAchievement('10 total');
                }
                if (gamesWon >= 100 && data?.achievements['100 total'].users.length === 0) {
                    handleAchievement('100 total');
                }

                const gamesWonInARow = gamesWonInARowFunc(userId, data?.gamesParticipated);
                if (gamesWonInARow >= 3 && data?.achievements['3'].users.length === 0) {
                    handleAchievement('3');
                }
                if (gamesWonInARow >= 3 && data?.achievements['10'].users.length === 0) {
                    handleAchievement('10');
                }
                if (gamesWonInARow >= 3 && data?.achievements['100'].users.length === 0) {
                    handleAchievement('100');
                }

                const gameParticipations = data?.gamesParticipated.length;
                let inc = 0;
                if (gameParticipations >= 1 && data?.achievements['First Game'].users.length === 0) {
                    inc++;
                    console.log("inc", inc);
                    handleAchievement('First Game');
                }
                if (gameParticipations >= 10 && data?.achievements['You\'re getting used to Pong'].users.length === 0) {
                    handleAchievement('You\'re getting used to Pong');
                }
                if (gameParticipations >= 100 && data?.achievements['You\'re playing a lot'].users.length === 0) {
                    handleAchievement('You\'re playing a lot');
                }

                // if (smallLeader && data?.achievements['Small Leader'].users.length === 0) {
                //     handleAchievement('Small Leader');
                // }
                // if (greatLeader && data?.achievements['Great Leader'].users.length === 0) {
                //     handleAchievement('Great Leader');
                // }

                // if (perfectWin && data?.achievements['Perfect win'].users.length === 0) {
                //     handleAchievement('Perfect win');
                // }
                // if (perfectLose && data?.achievements['You\'re a looser'].users.length === 0) {
                //     handleAchievement('You\'re a looser');
                // }
                //TODO: New level, Level 21, You like to talk?, Chatterbox
            }
        };
        fetchData();
    }, []);

    const handleUploadAvatar = (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        console.log(file);
        const formData = new FormData();
        formData.append('file', file);

        const requestOptions = {
            method: 'POST',
            body: formData
        }

        fetch(`http://localhost:3000/api/profile/${userId}/add-avatar`, requestOptions)
            .then(response =>  {
                if (response.status === 422) {
                    throw new Error('Only jpg, jpeg, png file. Maximum dimension 1000x1000. Maximum size 1000042 bytes');
                }
                return response.json();
            })
            .then(data => {
                setAvatar(`http://localhost:3000/static/${data.avatar}`)
                if (!profileInfos?.avatar) {
                    showPopup('Newwww Avatar');
                    const requestOptions2 = requestOptionsAchievements("Newwww Avatar", profileInfos);
                    addAchievement(requestOptions2);
                }
            })
            .catch(error => {
                alert(error);
            });
    }

    const handleChangePseudo = async (e) => {
        e.preventDefault();

        const pseudo = (e.target.elements as HTMLFormControlsCollection)['outlined-basic'].value;
        const data = { pseudo: pseudo };

        fetch(`http://localhost:3000/api/profile/${userId}/change-pseudo`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Min 3 characters and maximum 32 characters, no special characters except '-' or pseudo already in use");
            }
            return response.json();
        })
        .then(result => {
            setPseudo(result.pseudo);
            if (!isPseudoAdded) {
                setIsPseudoAdded(true);
                showPopup('Newwww Pseudo');
                const requestOptions = requestOptionsAchievements("Newwww Pseudo", profileInfos);
                addAchievement(requestOptions);
            }
        })
        .catch(error => {
            alert(error);
        });
    }

    const closePopup = () => {
        setPopupQueue(prevQueue => {
            const firstItem = prevQueue[0];
            setCurrentPopup(prevPopup => ({
                ...prevPopup,
                [firstItem]: false
            }));
            return prevQueue.slice(1)
        });
    };

    return (
        <>
            <div className="overlay" style={{ display: currentPopup['Newwww Avatar'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['Newwww Pseudo'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['3 total'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['10 total'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['100 total'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['First Game'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['You\'re getting used to Pong'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['You\'re playing a lot'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['3'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['10'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['100'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['Small Leader'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['Great Leader'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['Perfect win'] ? 'block': 'none' }}></div>
            <div className="overlay" style={{ display: currentPopup['You\'re a looser'] ? 'block': 'none' }}></div>
            <div className="Profile">
                {popupQueue.length > 0 && <PopUp userId={Number(userId)} infos={profileInfos?.achievements[popupQueue[0]]} onClose={closePopup}/>}
                <ChangeAvatar handleUploadAvatar={handleUploadAvatar} />
                <PseudoButton handleChangePseudo={handleChangePseudo} />
                <Switch2FA />
                <Ladder />
                <Stats />
                <MatchHistory />
                <Achievements />
            </div>
        </>
    )
}

export default Profile;