/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LeaderContext } from '../../../contexts/LeaderContext';
import { LeaderContextType } from '../Profile';
import { 
    Table,
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow
} from '@mui/material';
import default_avatar from "../../../assets/images/default_avatar.png";

import AvatarOthers from '../../AvatarOthers/AvatarOthers';

import './Ladder.css';
import { fetchAvailableUsers, fetchLadder } from '../../../api';
import { useQuery } from 'react-query';
import { UserAvatar } from '../../UserAvatar';

type LadderProps = {
    auth: number;
}

type Status = {
    [id: number]: string
}

const Ladder: React.FC<LadderProps> = ({ auth }) => {
    const { setSmallLeader, setGreatLeader } = useContext(LeaderContext) as LeaderContextType;
    const [ladder, setLadder] = useState<User[]>([]);
    const [statusList, setStatusList] = useState<Status>({});
    const { userId } = useParams();

    const q = useQuery(['ladder', auth, userId, ladder, setLadder], fetchLadder, {
        onSuccess(data) {
            setLadder(calculateRanking(calculateWinsAndLosses(data)));
        },
    });

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

    type Game = {
        game: {
            winnerId: number
        }
        userId: number
    };

    type User = {
        gameParticipation: Game[]
        avatar: string
        pseudo: string
        id: number
        wins: number 
        losses: number
    };

    const tableBodyRef = useRef<HTMLTableSectionElement>(null);
    const firstRowRef = useRef<HTMLTableRowElement>(null);

    const calculateWinsAndLosses = (data: User[]) => {
        data.map(user => {
            user.wins = 0;
            user.losses = 0;

            user.gameParticipation.forEach(game => {
                if (game.game.winnerId === game.userId) {
                    user.wins++;
                } else {
                    user.losses++;
                }
            });
        })
        return data;
    };

    const calculateRanking = (data: User[]) => {
        const ranking =  data.sort((a, b) => {
            if (a.wins > b.wins) {
                return -1;
            }
            if (a.wins < b.wins) {
                return 1;
            }
            return a.losses - b.losses;
        });
        if (ranking.length >= 3 && ranking[0].id === Number(auth)) {
            setSmallLeader(true);
        } else if (ranking.length >= 10 && ranking[0].id === Number(auth)) {
            setGreatLeader(true);
        }
        return ranking;
    };

    useEffect(() => {
        const currentDiv = tableBodyRef.current;
        const currentFirstRow = firstRowRef.current;
        const handleScroll = () => {
            if (currentDiv!.scrollTop > 0) {
                currentFirstRow!.style.borderBottom = "5px solid #9747FF";
            } else {
                currentFirstRow!.style.borderBottom = "2px solid #9747FF";
            }
        };

        if (currentDiv) {
            currentDiv.addEventListener("scroll", handleScroll);

            return () => {
                currentDiv.removeEventListener("scroll", handleScroll);
            };
        }
    }, []);

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
                                    <UserAvatar
                                        avatar={user.avatar}
                                        userId={user.id} />
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