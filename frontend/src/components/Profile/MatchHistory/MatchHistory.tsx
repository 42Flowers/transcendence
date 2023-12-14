/* eslint-disable react-hooks/exhaustive-deps */

import map from 'lodash/map';

import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from '@mui/material';

import './MatchHistory.css';

import { useQuery } from 'react-query';
import { UserID, fetchMatchHistory } from '../../../api';
import { UserAvatar } from '../../UserAvatar';
import { useAuthContext } from '../../../contexts/AuthContext';

type MatchHistoryProps = {
    userId: UserID;
}

const MatchHistoryList: React.FC<MatchHistoryProps> = ({ userId }) => {
    const matchHistory = useQuery([ 'match history', userId ], () => fetchMatchHistory(userId));
    const auth = useAuthContext()
    const entries = map(matchHistory.data, ({ game, opponent }) => (
        <TableRow
            key={game.id}
            sx={{
                '&:last-child td, &:last-child th': { border: 0 },
                display: 'table',
                width: '100%',
                tableLayout: 'fixed',
                backgroundColor: game.winnerId === Number(auth.user?.id) ? '#85DE89' : '#DE8585'
            }}
        >
            <TableCell id="cell-scored-mh">
                {game.score1}
            </TableCell>
            <TableCell id="cell-dash-mh">
                -
            </TableCell>
            <TableCell id="cell-conceded-mh">
                {game.score2}
            </TableCell>
            <TableCell id="cell-pseudo-mh">
                {opponent.pseudo}
            </TableCell>
            <TableCell id="cell-status-mh">
                <div className='cell-status-div-mh'>
                    <UserAvatar userId={opponent.id} avatar={opponent.avatar} />
                </div>
            </TableCell>
            <TableCell id="cell-date-mh">
                <div className='cell-date-div-mh'>
                    {game.createdAt}
                </div>
            </TableCell>
        </TableRow>
    ));

    if (0 === entries.length)
        return null;

    return (
        <TableContainer id="table-container-mh">
            <Table id="table-mh" aria-label="simple table">
                <TableBody id="table-body-mh">
                    {entries}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const MatchHistory: React.FC<MatchHistoryProps> = ({ userId }) => (
    <div className="matchHistory">
        <h2 className='title-mh'>Match History</h2>
        <MatchHistoryList userId={userId} />
    </div>
);

export default MatchHistory;