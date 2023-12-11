/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import { useQuery } from 'react-query';
import { fetchLadder } from '../../../api';
import { UserAvatar } from '../../UserAvatar';
import './Ladder.css';

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

type UserScores = {
    id: number;
    pseudo: string;
    avatar: string | null;
    wins: number;
    losses: number;
};

const Ladder: React.FC = () => {
    const tableBodyRef = useRef<HTMLTableSectionElement>(null);
    const firstRowRef = useRef<HTMLTableRowElement>(null);

    const q = useQuery('ladder', fetchLadder);
    /* TODO maybe we should move this in the backend */

    const winsAndLosses = React.useMemo(() => map(q.data, ({ gameParticipation, id, pseudo, avatar }): UserScores => {
        return reduce(gameParticipation, ({ wins, losses, ...rest }: UserScores, { game, userId }) => {
            if (game.winnerId === userId) {
                return { wins: wins + 1, losses, ...rest };
            } else {
                return { wins, losses: losses + 1, ...rest };
            }
        }, { wins: 0, losses: 0, id, pseudo, avatar });
    }), [ q ]);

    const rankings = React.useMemo(() => winsAndLosses.sort((a, b) => {
        if (a.wins > b.wins) {
            return -1;
        }
        if (a.wins < b.wins) {
            return 1;
        }
        return a.losses - b.losses;
    }), [ winsAndLosses ]);

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
                        {map(rankings, ({ id, pseudo, wins, losses, avatar }, index) => (
                            <TableRow key={id} id="row-body-l">
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
                                    {pseudo}
                                </TableCell>
                                <TableCell id="cell-wins-l">
                                    {wins}
                                </TableCell>
                                <TableCell id="cell-losses-l">
                                    {losses}
                                </TableCell>
                                <TableCell id="cell-avatar-l">
                                    <UserAvatar
                                        avatar={avatar}
                                        userId={id} />
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