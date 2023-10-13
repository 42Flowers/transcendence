import * as React from 'react';
import { useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Box from '@mui/material/Box';

import Difficulty from './Difficulty/Difficulty';

import './Achievement.css';

interface Props {
    name: string,
    description: string,
    difficulty: number,
    isHidden: boolean,
}

const Achievement: React.FC<Props> = ({ name, description, difficulty, isHidden }) => {
    return (
        <div class="achievement">
            <div className="achievement-details">
                <h2>{name}</h2>
                <Difficulty difficultyLevel={difficulty} />
            </div>
            <div className="achievement-description">
                <p>
                    Some description hfuezf f jgrhikgb zbf ejbgjrkg nrzbn rhbnr  nkj bguef nksj
                    nvfkn ezfhne e fenf hnfeohf ohouehgfou hgohgf uefouejfoezhj oejfoejf oezf Some description hfuezf f jgrhikgb zbf ejbgjrkg nrzbn rhbnr  nkj bguef nksj nvfkn ezfhne e fenf hnfeohf ohouehgfou hgohgf uefouejfoezhj oejfoejf oezf
                </p>
            </div>
        </div>
    );
};

export default Achievement;