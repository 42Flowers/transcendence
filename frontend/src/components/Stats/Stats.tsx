import React, { useEffect, useState } from 'react';
// import { GiWingedSword } from "react-icons/gi";
// import { BsStars } from "react-icons/bs";
import './Stats.css';
import { UserID, fetchStats } from '../../api';
import { useQuery } from 'react-query';

interface StatsProps {
	userId: UserID;
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

const Stats: React.FC<StatsProps> = ({ userId }) => {
    const statsQuery = useQuery([ 'stats', userId ], () => fetchStats(userId));

    const streak = React.useMemo<number>(() => {
        const gameList = statsQuery.data ?? [];
        
        gameList.sort((a, b) => new Date(a.game.createdAt).getTime() - new Date(b.game.createdAt).getTime());
        let currentConsecutiveWins = 0;

        for (let game of gameList) {
            if (game.userId == game.game.winnerId) {
                currentConsecutiveWins++;
            } else {
                break ;
            }
        }

        return currentConsecutiveWins;
    }, [ statsQuery ]);

    const result = React.useMemo<WinLoss>(() => {
        const gameList = statsQuery.data ?? [];

        return gameList.reduce<WinLoss>(({ wins, losses }, game) => {
            if (game.game.winnerId === game.userId) {
                return { wins: wins + 1, losses };
            } else {
                return { wins, losses: losses + 1 };
            }
        }, { wins: 0, losses: 0 });
    }, [ statsQuery ]);

    return (
        <div className='Stats-wrapper'>
            <h2 className='title-s'>Statistics</h2>
            <div className='main'>
                <div className='statt'>
                    <p className='title'>Win streak</p>
                    <div className='middle'>{streak}</div>
                        {/* <GiWingedSword className="icon"/> */}
                    </div>
                <div className='statt'>
                    <p className='title'>Winrate</p>
                    <div className='middle'>{Math.round((result.wins / Math.max(1, (result.losses + result.wins))) * 100)}%</div>
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

export default Stats;