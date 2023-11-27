import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow 
} from '@mui/material';

import AvatarOthers from '../../AvatarOthers/AvatarOthers';

import './Ladder.css';

const Ladder: React.FC = () => {
    // function mockData(
    //     rank: number,
    //     pseudo: string,
    //     wins: number,
    //     losses: number,
    //     status: string
    // ) {
    //     return { rank, pseudo, wins, losses, status };
    // }
    
    // const rows = [
    //     mockData(1, 'ycurbill', 15, 0, 'Online'),
    //     mockData(2, 'nul1', 9, 2, 'Add'),
    //     mockData(3, 'nul2', 9, 3, 'Playing'),
    //     mockData(4, 'nul3', 5, 1, 'Online'),
    //     mockData(5, 'nul4', 4, 5, 'Offline'),
    //     mockData(6, 'nul5', 4, 5, 'Add'),
    // ];

    interface CellStyle {
        color: string,
        fontSize: string,
        fontWeight: number,
    }

    const rankNumberStyles = (index: number): CellStyle => {
        if (index === 0) {
            return { color: 'goldenrod', fontSize: '1.8em', fontWeight: 900 };
        } else if (index === 1) {
            return { color: 'silver', fontSize: '1.6em', fontWeight: 700 };
        } else if (index === 2) {
            return { color: '#CD7F32', fontSize: '1.4em', fontWeight: 500 };
        } else {
            return { color: 'black', fontSize: '1.1em', fontWeight: 300 };
        }
    };

    type User = {
        gameParticipationsCurrentUser: never[];
        wins?: number;
        losses?: number;
        avatar?: string,
        id?: number;
    };

    const tableBodyRef = useRef<HTMLTableSectionElement>(null);
    const firstRowRef = useRef<HTMLTableRowElement>(null);
    const [ladder, setLadder] = useState<User[]>([{"gameParticipationsCurrentUser": []}]);
    const { userId } = useParams();

    const calculateWinsAndLosses = (data: User[]) => {
        data.map(user => {
            user.wins = 0;
            user.losses = 0;

            user.gameParticipationsCurrentUser.forEach(game => {
                if (game.gameResult.scored > game.gameResult.conceded) {
                    user.wins++;
                } else {
                    user.losses++;
                }
            });
        })
        return data;
    };

    const calculateRanking = (data: User[]) => {
        return data.sort((a, b) => {
            if (a.wins > b.wins) {
                return -1;
            }
            if (a.wins < b.wins) {
                return 1;
            }
            return a.losses - b.losses;
        });
    };


    useEffect(() => {
        fetch(`http://localhost:3000/api/profile/${userId}/ladder`)
            .then(response => response.json())
            .then(data => {
                setLadder(calculateRanking(calculateWinsAndLosses(data)));
            }
        );

        const currentDiv = tableBodyRef.current;
        const currentFirstRow = firstRowRef.current;
        const handleScroll = () => {
            console.log(currentDiv!.scrollTop)
            if (currentDiv!.scrollTop > 0) {
                currentFirstRow!.style.borderBottom = "5px solid #9747FF";
            } else {
                currentFirstRow!.style.borderBottom = "2px solid #9747FF";
            }
        };

        if (currentDiv) {
            currentDiv.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (currentDiv) {
                currentDiv.removeEventListener("scroll", handleScroll);
            }
        };
    }, [userId]);

    return (
        <div className="ladder">
            <h2 className='title-l'>Ladder</h2>
            <TableContainer id="table-container-l">
                <Table id='table-l' aria-label="simple table">
                    <TableHead>
                        <TableRow id="head-row-l" ref={firstRowRef}>
                            <TableCell id="cell-head-rank-l"></TableCell>
                            <TableCell id="cell-head-pseudo-l"></TableCell>
                            <TableCell id="cell-head-wins-l">
                                Wins
                            </TableCell>
                            <TableCell id="cell-head-losses-l">
                                Losses
                            </TableCell>
                            <TableCell id="cell-head-avatar-l"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody id='table-body-l' ref={tableBodyRef}>
                        {ladder.map((user, index) => (
                            <TableRow key={user.id} id="row-body-l">
                                <TableCell 
                                    sx={{ 
                                        borderBottom: '1px solid #F8A38B',
                                        textShadow: '1px 1px 2px #9747FF',
                                        color: rankNumberStyles(index).color,
                                        fontSize: rankNumberStyles(index).fontSize,
                                        fontWeight: rankNumberStyles(index).fontWeight,
                                    }}
                                >
                                    {index + 1}
                                </TableCell>
                                <TableCell id="cell-pseudo-l">
                                    {user.pseudo}
                                </TableCell>
                                <TableCell id="cell-wins-l">
                                    {user.wins}
                                </TableCell>
                                <TableCell id="cell-losses-l">
                                    {user.losses}
                                </TableCell>
                                <TableCell id="cell-avatar-l">
                                    <AvatarOthers status="Online"/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
};

export default Ladder;