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
            <p className="pseudoProfileClass">{profileInfos.data.pseudo}</p>
            {
                (auth.user?.id !== targetId) && <FriendChoiceButtons userId={'@me'} friendId={Number(targetId)} />
            }
            <Ladder />
            <Stats userId={Number(targetId)} />
            <MatchHistory userId={Number(targetId)} />
            <Achievements userId={Number(targetId)} />
        </div>
    )
}

export default ProfilePublic;
