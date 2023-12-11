import React from "react";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import { fetchProfilePublic } from "../../api";
import { useAuthContext } from "../../contexts/AuthContext";
import Stats from "../Stats/Stats";
import { UserAvatar } from "../UserAvatar";
import Achievements from "./Achievements/Achievements";
import FriendChoiceButtons from "./FriendChoiceButtons/FriendChoiceButtons";
import Ladder from "./Ladder/Ladder";
import MatchHistory from "./MatchHistory/MatchHistory";
import './Profile.css';

export interface LeaderContextType {
    smallLeader: boolean
    setSmallLeader: (smallLeader: boolean) => void;
    greatLeader: boolean
    setGreatLeader: (greatLeader: boolean) => void;
}

export interface PerfectContextType {
    perfectWin: boolean
    setPerfectWin: (perfectWin: boolean) => void;
    perfectLose: boolean
    setPerfectLose: (perfectLose: boolean) => void;
}

const ProfilePublic: React.FC = () => {

    const { targetId } = useParams();
    const auth = useAuthContext();

    const profileInfos = useQuery(['public-profile-infos', targetId], () => fetchProfilePublic(Number(targetId)));

    if (!profileInfos.isFetched || undefined === profileInfos.data)
        return null;

    return (
        <div className="Profile">
            <UserAvatar
                avatar={profileInfos.data.avatar}
                userId={profileInfos.data.id} />
            <p>{profileInfos.data.pseudo}</p>
            {
                (auth.user?.id === targetId) && <FriendChoiceButtons userId={Number(auth.user?.id)} friendId={Number(targetId)} />
            }
            <Ladder auth={Number(auth.user?.id)} />
            <Stats userId={Number(targetId)} auth={Number(auth.user?.id)} />
            <MatchHistory userId={Number(targetId)} auth={Number(auth.user?.id)} />
            <Achievements userId={Number(targetId)} />
        </div>
    )
}

export default ProfilePublic;
