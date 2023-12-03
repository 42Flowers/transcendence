import "./PlayPage.css";
import MainButton from "../components/MainButton/MainButton";
import { useNavigate } from "react-router-dom";
import { useCallback, useContext, useEffect, useState } from "react";
import SocketContext from "../components/Socket/Context/Context";

const SelectFriend: React.FC = () => {
    // GET USERS FRIENDS LIST (online or not ?, in game or not ?)
    // const { data, isError, isLoading, isSuccess } = useQuery('friendList', ....);
    const availableFriends = ["Charline", "Yvan", "Alexis", "Heloise"];
    let friendList = availableFriends.map((friend) => 
		<option value="text" key={ friend }>
			{ friend }
		</option>
	);
    
    return (
        <select placeholder="Select friend" name="friendList" className="friendList" >
            <option value="text" key="placeholder">Select a friend</option>
            { friendList }
        </select>
    );
}

const PlayPage: React.FC = () => {
    //const { user } = useAuthContext();
    const { SocketState } = useContext(SocketContext);
    const [waiting, setWaiting] = useState<boolean>(false);
    const navigate = useNavigate();

    const handleClick = (whichButton: string) => {
        if (whichButton === "random-normal") {
            SocketState.socket?.emit("joinRandomNormal");
            setWaiting(true);
            return ;
        }
        else if (whichButton === "friend-normal")
        {
            // navigate('/selectfriend');
                return ;
        }
        else if (whichButton === "random-special") {
            SocketState.socket?.emit("joinRandomSpecial");
            setWaiting(true);
            return ;
        }
        else if (whichButton === "friend-special")
        {
            // navigate('/selectfriend');
            return ;
        }
    }

    const handleCancel = () => {
        SocketState.socket?.emit("cancelGameSearch");
        setWaiting(false);
    };

    const launchRandomNormal = useCallback(() => {
        console.log("Launch game received");
        navigate('/game-normal');
    }, []);

    const launchRandomSpecial = useCallback(() => {
        navigate('/game-special');
    }, []);
    
    useEffect(() => {
        SocketState.socket?.on("launchRandomNormal", launchRandomNormal);
        SocketState.socket?.on("launchRandomSpecial", launchRandomSpecial);
        // SocketState.socket?.on("joinFriendMatch", joinFriendMatch)

        return () => {
            SocketState.socket?.off("launchRandomNormal", launchRandomNormal);
            SocketState.socket?.off("launchRandomSpecial", launchRandomSpecial);
            // SocketState.socket?.off("joinFriendMatch", joinFriendMatch)
        };
    }, [SocketState.socket]);



    return (
        <div className="game-modes">
            <div className="normal-mode">
                <h3>Normal</h3>
                <div className="box-pong">
                    <div className="random-choice">
                        { !waiting && <MainButton buttonName="Random" mode={0} onClick={() => { handleClick("random-normal") }}/> }
                    </div>
                    { waiting && <MainButton buttonName="X" mode={0} onClick={() => { handleCancel() }}/>}
                    <div className={`friend-choice ${waiting ? 'no-border' : ''}`}>
                        { !waiting && <SelectFriend></SelectFriend>}
                        { !waiting && <MainButton buttonName="Friend" mode={0} onClick={() => { handleClick("friend-normal") }}/> }
                    </div>
                    {/* { isSuccess && <MainButton buttonName="Friend" mode={0} onClick={() => { handleClick("friend-normal") }}/> } */}
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
                    </div>
                    {/* <div className="friend-choice"> */}
                    { waiting && <MainButton buttonName="X" mode={0} onClick={() => { handleCancel() }}/>}
                    <div className={`friend-choice ${waiting ? 'no-border' : ''}`}>
                        { !waiting && <SelectFriend></SelectFriend>}
                        { !waiting && <MainButton buttonName="Friend" mode={0} onClick={() => { handleClick("friend-special") }}/> }
                    </div>
                    <div>
                        <p style={{color: 'white', paddingTop: '-1000px'}}>
                            Use the "SPACE" key just before you hit the ball to protect the paddle and speed up the ball !
                            <br/>
                            Tips: If the ball goes too fast an unprotected paddle might break
                        </p>
                    </div>
                    {/* { isSuccess && <MainButton buttonName="Friend" mode={0} onClick={() => { handleClick("friend-special") }}/> } */}
                </div>
            </div>
        </div>
    );
};

export default PlayPage;
