/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect, useState } from 'react';

import { PerfectContext } from '../../../contexts/PerfectContext';
import { PerfectContextType } from '../Profile';


import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';

import './MatchHistory.css';

import { useQuery } from 'react-query';
import { fetchMatchHistory } from '../../../api';
import { UserAvatar } from '../../UserAvatar';

interface Game {
    game: {
        id: number;
        createdAt: string;
        score1: number;
        score2: number;
        winnerId: number;
    };
    opponent: {
        id: number;
        pseudo: string;
        avatar: string | null;
    };
}

type MatchHistoryProps = {
    userId: number;
    auth: number;
}

type Status = {
    [id: number]: string
}

const MatchHistory: React.FC<MatchHistoryProps> = ({ userId, auth }) => {
    const [matchHistory, setMatchHistory] = useState<Game[]>([]);
    const { setPerfectWin, setPerfectLose } = useContext(PerfectContext) as PerfectContextType;
    
    useEffect(() => {
        if (userId !== auth) {
            fetch(`/api/profile/${userId}/matchhistory`)
                .then(response => response.json())
                .then((data: Game[]) => {
                    setMatchHistory(data);
                    data.map(game => {
                        if ((game.game.score1 === 10 && game.game.score2 === 0) || (game.game.score1 === 0 && game.game.score2 === 10)) {
                            if (Number(userId) === game.game.winnerId) {
                                setPerfectWin(true);
                            } else {
                                setPerfectLose(true);
                            }
                        }
                    });
                })
            }
    }, [userId, auth]);

    const q = useQuery([ 'match history', userId ], fetchMatchHistory, {
        enabled: userId === auth,
        onSuccess(data) {
            setMatchHistory(data);
            data.forEach(game => {
                if ((game.game.score1 === 10 && game.game.score2 === 0) || (game.game.score1 === 0 && game.game.score2 === 10)) {
                    if (userId === game.game.winnerId) {
                        setPerfectWin(true);
                    } else {
                        setPerfectLose(true);
                    }
                }
            });
        },
    });

    return (
        <div className="matchHistory">
            <h2 className='title-mh'>Match History</h2>
            {matchHistory.length 
                ?
                <TableContainer id="table-container-mh">
                    <Table id="table-mh" aria-label="simple table">
                        <TableBody 
                            id="table-body-mh"
                        >
                            {matchHistory?.map((row) => (
                                <TableRow
                                    key={row.game.id}
                                    sx={{ 
                                        '&:last-child td, &:last-child th': { border: 0 },
                                        display: 'table',
                                        width: '100%',
                                        tableLayout: 'fixed',
                                        backgroundColor: row.game.winnerId === Number(userId) ? '#85DE89' : '#DE8585'
                                    }}
                                >
                                    <TableCell id="cell-scored-mh">
                                        {row.game.score1}
                                    </TableCell>
                                    <TableCell id="cell-dash-mh">
                                        -
                                    </TableCell>
                                    <TableCell id="cell-conceded-mh">
                                        {row.game.score2}
                                    </TableCell>
                                    <TableCell id="cell-pseudo-mh">
                                        {row.opponent.pseudo}
                                    </TableCell>
                                    <TableCell id="cell-status-mh">
                                        <div className='cell-status-div-mh'>
                                            <UserAvatar userId={row.opponent.id} avatar={row.opponent.avatar} />
                                        </div>
                                    </TableCell>
                                    <TableCell id="cell-date-mh">
                                        <div className='cell-date-div-mh'>
                                            {row.game.createdAt}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            :
                null
            }
        </div>
    )
};

export default MatchHistory;