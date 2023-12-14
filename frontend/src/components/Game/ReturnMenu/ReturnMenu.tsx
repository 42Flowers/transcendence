import React from "react";
import MainButton from "../../MainButton/MainButton";
import { useNavigate } from 'react-router-dom';
import './ReturnMenu.css';

interface Props {
    leftName: string
    rightName: string
    leftScore: string
    rightScore: string
}

const ReturnMenu: React.FC<Props> = ({ leftName, rightName, leftScore, rightScore }) => {
    const navigate = useNavigate();

    const handleReturnMenu = () => {
        navigate('/');
	}

    if (Number(leftScore) > Number(rightScore))
    {
        return (
            <div className="returnMenu">
                <p style={{ marginTop: '40px', }} className="winner">WINNER: {leftName} with {leftScore} points</p>
                <p style={{ marginTop: '40px', }} className="looser">LOSER: {rightName} with {rightScore} points</p>
                <MainButton buttonName='Return to Menu' onClick={() => handleReturnMenu()} />
            </div>
        );
    }
    else
    {
        {
            return (
                <div className="returnMenu">
                    <p style={{ marginTop: '40px', }} className="winner">WINNER: {rightName} with {rightScore} points</p>
                    <p style={{ marginTop: '40px', }} className="looser">LOSER: {leftName} with {leftScore} points</p>
                    <MainButton buttonName='Return to Menu' onClick={() => handleReturnMenu()} />
                </div>
            );
        }
    }
};

export default ReturnMenu;