import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer,
    TableRow 
} from '@mui/material';

import './MatchHistory.css';

import AvatarOthers from '../../AvatarOthers/AvatarOthers';

const MatchHistory: React.FC = () => {

    // function mockData(
    //     scored: number,
    //     conceded: number,
    //     pseudo: string,
    //     avatar: string,
    //     date: string,
    //     status: string
    // ) {
    //     return { scored, conceded, pseudo, avatar, date, status };
    // }
    
    // const rows = [
    //     mockData(3, 0, 'adversaire1', '', '09/11/01 9:34am', 'Online'),
    //     mockData(0, 3, 'adversaire2', '', '09/11/01 9:34am', 'Online'),
    //     mockData(3, 0, 'adversaire3', '', '09/11/01 9:34am', 'Offline'),
    //     mockData(0, 3, 'adversaire4', '', '09/11/01 9:34am', 'Offline'),
    //     mockData(3, 0, 'adversaire5', '', '09/11/01 9:34am', 'Playing'),
    //     mockData(3, 0, 'adversaire6', '', '09/11/01 9:34am', 'Add'),
    // ];
    const [matchHistory, setMatchHistory] = useState({"gameParticipationsCurrentUser": []});

    const { userId } = useParams();

    useEffect(() => {
        fetch(`http://localhost:3000/api/profile/${userId}/matchhistory`)
            .then(response => response.json())
            .then(data => {
                setMatchHistory(data);
            })
    }, [userId])

    interface CellStyle {
        backgroundColor: string,
    }

    const outcome = (scored: number, conceded: number): CellStyle => {
        if (scored > conceded) {
            return { backgroundColor: '#85DE89', };
        } else {
            return { backgroundColor: '#DE8585', };
        }
    }

    return (
        <div className="matchHistory">
            <h2 className='title-mh'>My Match History</h2>
            <TableContainer id="table-container-mh">
                <Table id="table-mh" aria-label="simple table">
                    <TableBody 
                        id="table-body-mh"
                    >
                        {matchHistory?.gameParticipationsCurrentUser.map((row) => (
                            <TableRow
                                key={row.id}
                                sx={{ 
                                    '&:last-child td, &:last-child th': { border: 0 },
                                    display: 'table',
                                    width: '100%',
                                    tableLayout: 'fixed',
                                    backgroundColor: outcome(row.gameResult.scored, row.gameResult.conceded).backgroundColor,
                                }}
                            >
                                <TableCell id="cell-scored-mh">
                                    {row.gameResult.scored}
                                </TableCell>
                                <TableCell id="cell-dash-mh">
                                    -
                                </TableCell>
                                <TableCell id="cell-conceded-mh">
                                    {row.gameResult.conceded}
                                </TableCell>
                                <TableCell id="cell-pseudo-mh">
                                    {row.user2.pseudo}
                                </TableCell>
                                <TableCell id="cell-status-mh">
                                    <div className='cell-status-div-mh'>
                                        <AvatarOthers status="Online" />
                                    </div>
                                </TableCell>
                                <TableCell id="cell-date-mh">
                                    <div className='cell-date-div-mh'>
                                        {row.gameResult.date}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
};

export default MatchHistory;