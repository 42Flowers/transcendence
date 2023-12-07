import "./PlayPage.css";
import MainButton from "../components/MainButton/MainButton";
import { useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import SocketContext from "../components/Socket/Context/Context";
import { useQuery } from "react-query";
import { fetchAvailableUsers } from "../api";

type UserStatus = [
    id: number,
    pseudo: string,
    status: string,
]

interface SelectUserProps {
    usersList: UserStatus[];
    handleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}

const SelectUser: React.FC<SelectUserProps> = ({ usersList, handleChange }) => {
    const availableUsers = usersList.map(([ id, pseudo, status ]) => {
        if (status == "online") {
            return (
                <option value={ id } key={ id }>
                    { pseudo }
                </option>
            )
        }
    });
    
    return (
        <select placeholder="Select a user" name="userList" className="userList" onChange={handleChange}>
            <option value="-1" key="placeholder">Select a user</option>
            { availableUsers }
        </select>
    );
}

const PlayPage: React.FC = () => {
    const { SocketState } = useContext(SocketContext);
    const [waiting, setWaiting] = useState<boolean>(false);
    const [selectedUserIdNormal, setSelectedUserNormal] = useState<number | null>(null);
    const [selectedUserIdSpecial, setSelectedUserSpecial] = useState<number | null>(null);
    const navigate = useNavigate();

    const usersQuery = useQuery('available-users', fetchAvailableUsers);

    const handleClick = (whichButton: string) => {
        if (whichButton === "random-normal") {
            SocketState.socket?.emit("joinRandomNormal");
            setWaiting(true);
            return ;
        }
        else if (whichButton === "invite-normal")
        {
            SocketState.socket?.emit("inviteNormal", selectedUserIdNormal);
            console.log("Invite Normal: ", selectedUserIdNormal);
            setWaiting(true);
            return ;
        }
        else if (whichButton === "random-special") {
            SocketState.socket?.emit("joinRandomSpecial");
            setWaiting(true);
            return ;
        }
        else if (whichButton === "invite-special")
        {
            SocketState.socket?.emit("inviteSpecial", selectedUserIdSpecial);
            console.log("Invite Special: ", selectedUserIdSpecial);
            setWaiting(true);
            return ;
        }
    }

    const handleNormalSelectedUser = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUserNormal(Number(event.target.value));
    }
    
    const handleSpecialSelectedUser = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedUserSpecial(Number(event.target.value));
    }

    const handleCancel = () => {
        SocketState.socket?.emit("cancelGameSearch");
        setWaiting(false);
    };

    const launchRandomNormal = useCallback(() => {
        navigate('/game-normal');
    }, []);

    const launchRandomSpecial = useCallback(() => {
        navigate('/game-special');
    }, []);
    
    useEffect(() => {
        SocketState.socket?.on("launchRandomNormal", launchRandomNormal);
        SocketState.socket?.on("launchRandomSpecial", launchRandomSpecial);

        return () => {
            SocketState.socket?.off("launchRandomNormal", launchRandomNormal);
            SocketState.socket?.off("launchRandomSpecial", launchRandomSpecial);
        };
    }, [SocketState.socket]);

    return (
        <div className="game-modes">
            <div className="normal-mode">
                <h3>Normal</h3>
                <div className="box-pong">
                    <div className="random-choice">
                        { !waiting && <MainButton buttonName="Random" mode={0} onClick={() => { handleClick("random-normal") }}/> }
                        { waiting && <MainButton buttonName="X" mode={0} onClick={() => { handleCancel() }}/>}
                    </div>
                    <div className={`user-choice ${waiting ? 'no-border' : ''}`}>
                        { !waiting && usersQuery.isFetched && <SelectUser usersList={usersQuery.data} handleChange={handleNormalSelectedUser} />}
                        { !waiting && <MainButton buttonName="Opponent" mode={0} onClick={() => { handleClick("invite-normal") }}/> }
                    </div>
                    <div className="controls_info">
                        <p style={{color: 'white'}}>
                            Controls: use "ARROW UP" to move your paddle up and "ARROW DOWN" to move your paddle down
                        </p>
                    </div>
                </div>
            </div>
            <div className="choose">
                <h3>Choose your mode!</h3>
            </div>
            <div className="special-mode">
                <h3>Special</h3>
                <div className="box-pong">
                    <div className="random-choice">
                        { !waiting && <MainButton buttonName="Random" mode={0} onClick={() => { handleClick("random-special") }}/> }
                        { waiting && <MainButton buttonName="X" mode={0} onClick={() => { handleCancel() }}/>}
                    </div>
                    <div className={`user-choice ${waiting ? 'no-border' : ''}`}>
                        { !waiting && usersQuery.isFetched && <SelectUser usersList={usersQuery.data} handleChange={handleSpecialSelectedUser} />}
                        { !waiting && <MainButton buttonName="Opponent" mode={0} onClick={() => { handleClick("invite-special") }}/> }
                    </div>
                    <div className="controls_info">
                        <p style={{color: 'white'}}>
                            Use the "SPACE" key just before you hit the ball to protect the paddle, it will become "RED", and speed up the ball !
                            <br/>
                            Tips: If the ball goes too fast an unprotected paddle might break
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayPage;
