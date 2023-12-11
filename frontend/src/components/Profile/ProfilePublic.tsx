import React, { useState, useEffect } from "react";
import Stats from "../Stats/Stats";
import Ladder from "./Ladder/Ladder";
import MatchHistory from "./MatchHistory/MatchHistory";
import Achievements from "./Achievements/Achievements";
import FriendChoiceButtons from "./FriendChoiceButtons/FriendChoiceButtons";
import { useAuthContext } from "../../contexts/AuthContext";
import { useParams } from "react-router-dom";
import AvatarOthers from "../AvatarOthers/AvatarOthers";
import default_avatar from '../../assets/images/default_avatar.png';
import { fetchAvailableUsers, fetchProfilePublic } from "../../api";
import { useQuery } from "react-query";
import { ProfileInfosType } from "./Profile";

import './Profile.css';
import { UserAvatar } from "../UserAvatar";

export interface AvatarContextType {
    avatar: string;
    setAvatar: (avatar: string) => void;
}

export interface PseudoContextType {
    pseudo: string
    setPseudo: (pseudo: string) => void;
}

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

interface Achievement {
    id: number;
    name: string;
    description: string;
    difficulty: number;
    isHidden: boolean;
    createdAt: Date;
}

type Achievements = {
    achievements: Achievement[]
}

const ProfilePublic: React.FC = () => {

    const { targetId } = useParams();
    const auth = useAuthContext();

    const profileInfos = useQuery(['public-profile-infos', targetId], (targetId) => fetchProfilePublic);

    return (
        <>
            {
                profileInfos.isFetched && profileInfos.data !== undefined &&
                    <div className="Profile">
                        <UserAvatar
                            avatar={profileInfos.data.avatar}
                            userId={profileInfos.data.id} />
                        <p>{profileInfos.data.pseudo}</p>
                        { Number(auth.user.id) === Number(targetId) ?
                            ''
                            :
                            <FriendChoiceButtons  userId={Number(auth.user?.id)} friendId={Number(targetId)}/>
                        }
                        <Ladder auth={Number(auth.user?.id)} />
                        <Stats userId={Number(targetId)} auth={Number(auth.user?.id)} />
                        <MatchHistory userId={Number(targetId)} auth={Number(auth.user?.id)} />
                        <Achievements userId={Number(targetId)} auth={Number(auth.user?.id)} />
                    </div>
            }
        </>
    )
}

export default ProfilePublic;
