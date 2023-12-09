import { ChatContext } from "../../contexts/ChatContext";
import { useContext } from "react";
import './Chat.css';
import { ChatContextType } from "./Menu";


type Props = {
    side: string
}

const List: React.FC<Props> = ({ side }) => {
    const { chanOrDm, usersOrBanned, setCurrentChannel, setCurrentDm, currentChannel, currentDm } = useContext(ChatContext) as ChatContextType;
    // left
    const channels = [
        {
            id: 1,
            channelName: "Channel 1",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 2,
            channelName: "Channel 2",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 3,
            channelName: "Channel 3",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 1,
            channelName: "Channel 1",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 2,
            channelName: "Channel 2",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 3,
            channelName: "Channel 3",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 1,
            channelName: "Channel 1",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 2,
            channelName: "Channel 2",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 3,
            channelName: "Channel 3",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 1,
            channelName: "Channel 1",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 2,
            channelName: "Channel 2",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 3,
            channelName: "Channel 3",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 1,
            channelName: "Channel 1",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 2,
            channelName: "Channel 2",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 3,
            channelName: "Channel 3",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 1,
            channelName: "Channel 1",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 2,
            channelName: "Channel 2",
            userPermissionMask: "Item 1.3"
        },
        {
            id: 3,
            channelName: "Channel 3",
            userPermissionMask: "Item 1.3"
        },
    ];

    const directMessages = [
        {
            targetId: 1,
            targetName: "Macron",
        },
        {
            targetId: 2,
            targetName: "Poutine",
        },
        {
            targetId: 3,
            targetName: "Coluche",
        },
    ];

    // right // 0 not ban | 1 ban 
    // channel1
    const allUsers = [
        {
            userId: 1,
            name: 'Macron',
            memberShipState: 0,
        },
        {
            userId: 2,
            name: 'Poutine',
            memberShipState: 1,
        },
        {
            userId: 3,
            name: 'Coluche',
            memberShipState: 0,
        },
    ]

    return (
        side === 'left'
            ?
                chanOrDm === 'channel' 
                    ?
                        <div className="listClass">
                            {channels.map(channel => (
                                <div key={channel.id} onClick={() => setCurrentChannel(channel.id)}>
                                    <p className="listLeftClass">{channel.channelName}</p>
                                </div>
                            ))}
                        </div>
                    :
                        <div className="listClass">
                            {directMessages.map(dm => (
                                <div key={dm.targetId} onClick={() => setCurrentDm(dm.targetId)}>
                                    <p className="listLeftClass">{dm.targetName}</p>
                                </div>
                            ))}
                        </div>
            :
                usersOrBanned === 'users' 
                    ?
                        <div className="listClass">
                            {allUsers.map(user => (
                                user.memberShipState === 0 
                                    ?
                                        <div key={user.userId}>
                                            <p className="listRightClass">{user.name}</p>
                                        </div>
                                    :
                                        null
                            ))}
                        </div>
                    :
                        <div className="listClass">
                            {allUsers.map(user => (
                                user.memberShipState === 1 
                                    ?
                                        <div key={user.userId}>
                                            <p className="listRightClass">{user.name}</p>
                                        </div>
                                    :
                                        null
                            ))}
                        </div>
    );
};

export default List;