/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useContext } from 'react';

import { PerfectContext } from '../../../contexts/PerfectContext';
import { PerfectContextType } from '../Profile';
import { fetchAvailableUsers } from '../../../api';

import default_avatar from "../../../assets/images/default_avatar.png";

import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer,
    TableRow 
} from '@mui/material';

import './MatchHistory.css';

import AvatarOthers from '../../AvatarOthers/AvatarOthers';
import { fetchMatchHistory } from '../../../api';
import { useQuery } from 'react-query';

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
    const [statusList, setStatusList] = useState<Status>({});


    useQuery('available-users', fetchAvailableUsers, {
        onSuccess: (data) => {
            data.map(() => {
                const newStatusList: Status = {};
                data.forEach(([id, pseudo, status]) => {
                    newStatusList[id] = status;
                });
                setStatusList(newStatusList);
            });
        }
    });

    useQuery([ 'match history', userId ], fetchMatchHistory, {
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
                                            {row.opponent.avatar ?
                                                <AvatarOthers status={statusList[row.opponent.id]} avatar={`http://localhost:3000/static/${row.opponent.avatar}`} userId={row.opponent.id} />
                                                :
                                                <AvatarOthers status={statusList[row.opponent.id]} avatar={default_avatar} userId={row.opponent.id} />
                                            }
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
