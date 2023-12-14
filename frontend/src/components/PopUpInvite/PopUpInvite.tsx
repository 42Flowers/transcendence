import React from "react";
import MainButton from "../MainButton/MainButton";
import './PopUpInvite.css';

interface Props {
    userName: string
    onAccept: () => void
    onDecline: () => void
}

const PopUpInvite: React.FC<Props> = ({ userName, onAccept, onDecline }) => {
    const [ time, setTime ] = React.useState<number>(16);
    
    React.useEffect(() => {
        const t = setInterval(() => {
            setTime(time => Math.max(0, time - 1));
        }, 1000);

        console.log('Effect');
        return () => {
            clearInterval(t);
        }
    }, [ setTime ]);

    React.useEffect(() => {
        if (time === 0) {
            onDecline();
        }
    }, [ time ]);
    
    return (
        <div className="popup-invite">
            <p style={{ marginTop: '40px', }}>{userName} wants to play pong against you</p>
            <MainButton buttonName="Accept" onClick={onAccept}/>
            <MainButton buttonName={`Decline (${time - 1}s)`} onClick={onDecline}/>
        </div>
    );
};

const MemoizedPopUpInvite = React.memo(PopUpInvite);

export default MemoizedPopUpInvite;