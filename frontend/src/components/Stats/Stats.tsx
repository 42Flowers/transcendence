import React, { useEffect, useState } from 'react';
// import { GiWingedSword } from "react-icons/gi";
// import { BsStars } from "react-icons/bs";
import './Stats.css';
import { fetchStats } from '../../api';
import { useQuery } from 'react-query';

interface StatsProps {
	userId: number;
    auth: number;
}

interface WinLoss {
    wins: number;
    losses: number;
 }

interface Stats {
    opponentId: number,
    userId: number,
    gameId: number,
    game: {
      id: number,
      score1: number,
      score2: number,
      winnerId: number,
      looserId: number,
      createdAt: string,
    }
}

const Stats: React.FC<StatsProps> = ({ userId, auth }) => {
    const [result, setResult] = useState<WinLoss | null>(null);
    const [streak, setGamesWonInARowFunc] = useState<number | null>(null);

    useEffect(() => {
        if (userId !== auth) {
            fetch(`http://localhost:3000/api/profile/${userId}/stats`)
                .then(response => response.json())
                .then(data => {
                    setResult(calculateWinsAndLosses(data));
                    setGamesWonInARowFunc(gamesWonInARowFunc(data));
                }
            );
        }
    }, [userId, auth]);

    const q = useQuery([ 'stats', userId ], fetchStats, {
        enabled: userId === auth,
        onSuccess(data) {
            console.log("HEY2", userId, auth);
            setResult(calculateWinsAndLosses(data));
            setGamesWonInARowFunc(gamesWonInARowFunc(data));
        }, 
    });

    const gamesWonInARowFunc = (gameList: Stats[]): number => {
        gameList.sort((a, b) => new Date(a.game.createdAt).getTime() - new Date(b.game.createdAt).getTime());
        let currentConsecutiveWins = 0;

        gameList.forEach((game) => {
            if (game.userId == game.game.winnerId) {
                currentConsecutiveWins++;
            } else {
                currentConsecutiveWins = 0;
            }
        });

        return currentConsecutiveWins;
    };

    const calculateWinsAndLosses = (gameList: Stats[]): WinLoss => {
        let wins = 0;
        let losses = 0;

        gameList.forEach(game => {
            if (game.game.winnerId === game.userId) {
                wins++;
            } else {
                losses++;
            }
        });
        return {
            wins,
            losses,
        }
    };

    if (result && result.wins !== 0 && result.losses !== 0)
    {
        return  (
            <div className='Stats-wrapper'>
                <h2 className='title-s'>Statistics</h2>
                <div className='main'>
                    <div className='statt'>
                        <p className='title'>Win streak</p>
                        <div className='middle'>{streak}</div>
                            {/* <GiWingedSword className="icon"/> */}
                        </div>
                    <div className='statt'>
                        <p className='title'>Ratio</p>
                        <div className='middle'>{Math.round((result.wins / result.losses) * 100) / 100}</div>
                            <div className='score'>
                                <p className='win'>Wins: <span>{result.wins}</span></p>
                                <p className='lose'>Losses: <span>{result.losses}</span></p>
                            </div>
                            {/* <BsStars className="icon"/> */}
                    </div>
                </div>
            </div>
        );
    }

    else if (result && (result.wins == 0 || result.losses == 0))
    {
        return  (
            <div className='Stats-wrapper'>
                <h2 className='title-s'>Statistics</h2>
                <div className='main'>
                    <div className='statt'>
                        <p className='title'>Win streak</p>
                        <div className='middle'>{streak}</div>
                            {/* <GiWingedSword className="icon"/> */}
                        </div>
                    <div className='statt'>
                        <p className='title'>Ratio</p>
                        <div className='middle'>0</div>
                            <div className='score'>
                                <p className='win'>Wins: <span>{result.wins}</span></p>
                                <p className='lose'>Losses: <span>{result.losses}</span></p>
                            </div>
                            {/* <BsStars className="icon"/> */}
                    </div>
                </div>
            </div>
        );
    }

    else if (!result)
    {
        return  (
            <div className='Stats-wrapper'>
                <h2 className='title-s'>Statistics</h2>
                <div className='main'>
                    <div className='statt'>
                        <p className='title'>Win streak</p>
                        <div className='middle'>0</div>
                        {/* <GiWingedSword className="icon"/> */}
                    </div>
                    <div className='statt'>
                        <p className='title'>Ratio</p>
                        <div className='middle'>0</div>
                        <div className='score'>
                            <p className='win'>Wins: <span>0</span></p>
                            <p className='lose'>Losses: <span>0</span></p>
                        </div>
                        {/* <BsStars className="icon"/> */}
                    </div>
                </div>
            </div>
        );
    }
}

export default Stats;