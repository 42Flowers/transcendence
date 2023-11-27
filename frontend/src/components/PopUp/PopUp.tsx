import React from "react";

import MainButton from "../MainButton/MainButton";

import './PopUp.css';

interface Props {
	title: string;
    description: string;
    onClose: () => void;
}

const PopUp: React.FC<Props> = ({ title, description, onClose }) => {
    return (
        <div className="popup">
            <p style={{marginTop: '40px', }}>{title}</p>
            <p style={{margin: '40px 0', }}>{description}</p>
            <MainButton buttonName="Close" onClick={onClose}/>
        </div>
    );
};

export default PopUp;