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
import { fetchAvailableUsers } from "../../api";
import { useQuery } from "react-query";
import { ProfileInfosType } from "./Profile";

import './Profile.css';

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

    const [profileInfos, setProfileInfos] = useState<ProfileInfosType | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [status, setStatus] = useState<string>('');
    const { userId } = useParams();
    const auth = useAuthContext();

    useQuery('available-users', fetchAvailableUsers, {
        onSuccess: (data) => {
            data.map(([ id, pseudo, status ]) => {
                if (Number(userId) === id) {
                    setStatus(status);
                }
            });
        }
    });
 
    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(`http://localhost:3000/api/profile/${userId}`);
            if (!response.ok) {
                if (response.status === 404) {
                    setError('User not found');
                } else {
                    setError('An error occurred');
                }
                return;
            }
            const data = await response.json();
            setProfileInfos(prevState => {
                if (JSON.stringify(data) !== JSON.stringify(prevState)) {
                    return data;
                }
                return prevState;
            });
        };
        fetchData();
    }, [userId, auth]);

    if (error) {
        return <p>Error: {error}</p>;
    }
      
    if (!profileInfos) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <div className="Profile">
                {profileInfos?.avatar ?
                    <AvatarOthers status={status} avatar={`http://localhost:3000/static/${profileInfos.avatar}`} userId={profileInfos.id} />
                    :
                    <AvatarOthers status={status} avatar={default_avatar} userId={profileInfos?.id} />
                }                
                <p>{profileInfos?.pseudo}</p>
                { Number(auth.user?.id) === Number(userId) ?
                    ''
                    :
                    <FriendChoiceButtons  userId={Number(auth.user?.id)} friendId={Number(userId)}/>
                }
                <Ladder auth={Number(auth.user?.id)} />
                <Stats userId={Number(userId)} auth={Number(auth.user?.id)} />
                <MatchHistory userId={Number(userId)} auth={Number(auth.user?.id)} />
                <Achievements userId={Number(userId)} auth={Number(auth.user?.id)} />
            </div>
        </>
    )
}

export default ProfilePublic;