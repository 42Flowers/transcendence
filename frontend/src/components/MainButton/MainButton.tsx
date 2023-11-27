import React from 'react';
import './MainButton.css';

export type MainButtonProps = {
    buttonName: string;
    mode?: number;
    onClick?: ((whichButton: string) => void) | ((newMode: number) => void) | (() => void);
    icon?: React.ReactNode;
    onlyIcon?: boolean;
}

const MainButton: React.FC<MainButtonProps> = ({buttonName, mode, onClick, icon, onlyIcon=false}) => {
    return (
        <div className=''>
            {
                onlyIcon
                ? <button className='mainBtn' onClick={() => onClick && onClick(mode || 0)} > {icon}</button>
                : <button className='mainBtn' onClick={() => onClick && onClick(mode || 0)} > {icon} {buttonName} {icon}</button>
            }
        </div>
    );
};

export default MainButton;