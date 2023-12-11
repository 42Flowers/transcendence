import React from "react";
import MainButton from "../MainButton/MainButton";
import './PopUpInvite.css';

interface Props {
    userName: string
    onAccept: () => void
    onDecline: () => void
}

const PopUpInvite: React.FC<Props> = ({ userName, onAccept, onDecline }) => {

    return (
        <div className="popup-invite">
            <p style={{ marginTop: '40px', }}>{userName} wants to play pong against you</p>
            <MainButton buttonName="Accept" onClick={onAccept}/>
            <MainButton buttonName="Decline" onClick={onDecline}/>
        </div>
    );
};

const MemoizedPopUpInvite = React.memo(PopUpInvite);

export default MemoizedPopUpInvite;