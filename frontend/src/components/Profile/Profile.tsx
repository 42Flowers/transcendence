import React, { useState, useEffect, useContext, useCallback } from "react";
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
import { useAuthContext } from "../../contexts/AuthContext";
import { fetchAddAchievementToUser, fetchProfile, fetchAddAvatar, fetchChangePseudo } from "../../api";
import { useMutation } from "react-query";

import { AxiosError } from 'axios';
import { queryClient } from "../../query-client";

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

type Achievements = {
    achievements: Achievement[]
}

interface AchievementsListContextType {
    achievementsList: UserAchievement[];
    setAchievementsList: (achievementsList: UserAchievement[]) => void;
}

type gamesParticipated = {
    winnerId: number
    looserId: number
    score1: number
    score2: number
    createdAt: Date
};
   
type Game = {
    game: gamesParticipated;
};

const Profile: React.FC = () => {
    const auth = useAuthContext();

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
    const [popupQueue, setPopupQueue] = useState<string[]>([]);
    const [isPseudoAdded, setIsPseudoAdded] = useState(false);

    const { avatar, setAvatar } = useContext(AvatarContext) as AvatarContextType;
    const { setAchievementsList } = useContext(AchievementsListContext) as AchievementsListContextType;
    const { pseudo, setPseudo } = useContext(PseudoContext) as PseudoContextType;
    const { smallLeader, greatLeader } = useContext(LeaderContext) as LeaderContextType;
    //const { perfectWin, perfectLose } = useContext(PerfectContext) as PerfectContextType; // TODO: voir avec Max

    const gamesWonFunc = ( userId: number, games: Game[] ): number => {
        let gamesWon = 0;
        games.map(game => {
            if (game.game.winnerId === userId) {
                gamesWon++;
            }
        });
        return gamesWon;
    };

    const gamesPerfectFunc = ( userId: number, games: Game[] ): string => {
        let gamePerfect = 0;
        let gameLooser = 0;
        games.map(game => {
            if (game.game.winnerId === userId && ((game.game.score1 === 10 && game.game.score2 === 0) || (game.game.score1 === 0 && game.game.score2 === 10))) {
                gamePerfect++;
            } else if (game.game.looserId === userId && ((game.game.score1 === 10 && game.game.score2 === 0) || (game.game.score1 === 0 && game.game.score2 === 10))) {
                gameLooser++;
            }
        })
        if (gamePerfect > 0) {
            return 'Perfect';
        } else if (gameLooser > 0) {
            return 'Looser';
        }
        return '';
    };

    const showPopup = ( popup: string ) => {
        setCurrentPopup(prevPopup => ({
            ...prevPopup,
            [popup]: true
        }));
        setPopupQueue(prevQueue => [...prevQueue, popup]);
    }

    const gamesWonInARowFunc = (userId: number, games: Game[]): number => {
        games.sort((a, b) => new Date(a.game.createdAt).getTime() - new Date(b.game.createdAt).getTime());

        let maxConsecutiveWins = 0;
        let currentConsecutiveWins = 0;

        games.forEach((game) => {
            if (userId === game.game.winnerId) {
                currentConsecutiveWins++;
                maxConsecutiveWins = Math.max(maxConsecutiveWins, currentConsecutiveWins);
            } else {
                currentConsecutiveWins = 0;
            }
        });

        return maxConsecutiveWins;
    };
     
     const addAchievement = useCallback(achievement => {
        return fetchAddAchievementToUser(achievement)
            .then((data) => {
                queryClient.setQueryData('achievements', old => ([ ...(old ?? []), data ]));
            })
            .catch((error) => {
                console.error(error);
            });
    }, []);

     // Only with SQLite ? For Postgresql might need to change concurrency limite or pool size
    const queue = async.queue((task, callback) => {
        addAchievement(task)
            .then(data => {
                callback(null, data);
            })
            .catch(error => {
                callback(error);
            });
    }, 1); // Set concurrency limit to 1
 
    useEffect(() => {
        const fetchData = async () => {
            const data = await fetchProfile();
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
                    queue.push({
                        achievementId: data.achievements[achievementName].id,
                    });
                };

                const gamesWon = gamesWonFunc(auth.user.id, data?.gamesParticipated);
                if (gamesWon >= 3 && data?.achievements['3 total'].users.length === 0) {
                    handleAchievement('3 total');
                }
                if (gamesWon >= 10 && data?.achievements['10 total'].users.length === 0) {
                    handleAchievement('10 total');
                }
                if (gamesWon >= 100 && data?.achievements['100 total'].users.length === 0) {
                    handleAchievement('100 total');
                }

                const gamesWonInARow = gamesWonInARowFunc(auth.user.id, data?.gamesParticipated);
                if (gamesWonInARow >= 3 && data?.achievements['3'].users.length === 0) {
                    handleAchievement('3');
                }
                if (gamesWonInARow >= 10 && data?.achievements['10'].users.length === 0) {
                    handleAchievement('10');
                }
                if (gamesWonInARow >= 100 && data?.achievements['100'].users.length === 0) {
                    handleAchievement('100');
                }

                const gameParticipations = data?.gamesParticipated.length;
                if (gameParticipations >= 1 && data?.achievements['First Game'].users.length === 0) {
                    handleAchievement('First Game');
                }
                if (gameParticipations >= 10 && data?.achievements['You\'re getting used to Pong'].users.length === 0) {
                    handleAchievement('You\'re getting used to Pong');
                }
                if (gameParticipations >= 100 && data?.achievements['You\'re playing a lot'].users.length === 0) {
                    handleAchievement('You\'re playing a lot');
                }

                if (smallLeader && data?.achievements['Small Leader'].users.length === 0 && data?.gamesParticipated.length > 0) {
                    handleAchievement('Small Leader');
                }
                if (greatLeader && data?.achievements['Great Leader'].users.length === 0 && data?.gamesParticipated.length > 0) {
                    handleAchievement('Great Leader');
                }
                
                const gamesPerfect = gamesPerfectFunc(auth.user.id, data?.gamesParticipated);
                if (gamesPerfect === 'Perfect' && data?.achievements['Perfect win'].users.length === 0) {
                    handleAchievement('Perfect win');
                }
                if (gamesPerfect === 'Looser' && data?.achievements['You\'re a looser'].users.length === 0) {
                    handleAchievement('You\'re a looser');
                }
            }
        };
        fetchData();
    }, [smallLeader, greatLeader]);

    const uploadAvatarMutation = useMutation({
        mutationFn: fetchAddAvatar,
        onError(e: AxiosError) {
            if (e.response?.status === 422) {
                alert('Only jpg, jpeg, png file. Maximum dimension 1000x1000. Maximum size 1000042 bytes');
            } else {
                alert(e.message);
            }
        },
        onSuccess(data) {
            setAvatar(`http://localhost:3000/static/${data.avatar}`)
            if (!profileInfos?.avatar) {
                showPopup('Newwww Avatar');
                addAchievement({
                    achievementId: profileInfos.achievements['Newwww Avatar'].id,
                });
            }
        }
    });

    const handleUploadAvatar = (e) => {
        e.preventDefault();

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        uploadAvatarMutation.mutate(formData);
    }

    const changeUsernameMutation = useMutation({
        mutationFn: fetchChangePseudo,
        onSuccess(data) {
            setPseudo(data.pseudo);
            if (!isPseudoAdded) {
                setIsPseudoAdded(true);
                showPopup('Newwww Pseudo');
                addAchievement({
                    achievementId: profileInfos.achievements['Newwww Pseudo'].id,
                });
            }
        },
        onError(e: AxiosError) {
            alert("Min 3 characters and maximum 10 characters, Only a to z, A to Z, 0 to 9, and '-' are allowed or pseudo already in use");
        }
    });

    const handleChangePseudo = async (e) => {
        e.preventDefault();

        const pseudo = (e.target.elements as HTMLFormControlsCollection)['outlined-basic'].value;

        changeUsernameMutation.mutate({ pseudo });
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
        {/* IF current user */}
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
                {popupQueue.length > 0 && <PopUp userId={Number(auth.user?.id)} infos={profileInfos?.achievements[popupQueue[0]]} onClose={closePopup}/>}
                <ChangeAvatar handleUploadAvatar={handleUploadAvatar} />
                <PseudoButton handleChangePseudo={handleChangePseudo} />
                <div style={{ marginTop: '1em' }}>
                    <Switch2FA />
                </div>
        {/* ELSE */}
            {/* Add friend, block, unblock */}
        {/* ENDIF */}
                <Ladder auth={Number(auth.user?.id)} />
                <Stats userId={Number(auth.user?.id)} auth={Number(auth.user?.id)} />
                <MatchHistory userId={Number(auth.user?.id)} auth={Number(auth.user?.id)} />
                <Achievements userId={Number(auth.user?.id)} auth={Number(auth.user?.id)} />
            </div>
        </>
    )
}

export default Profile;