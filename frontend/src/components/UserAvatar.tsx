import React from "react";
import { fetchAvailableUsers } from "../api";
import { useQuery } from "react-query";
import find from "lodash/find";
import AvatarOthers from "./AvatarOthers/AvatarOthers";
import default_avatar from '../assets/images/default_avatar.png';

export type UserAvatarProps = {
    userId: number;
    avatar: string | null;
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ userId, avatar }) => {
    const usersQuery = useQuery(['available-users'], fetchAvailableUsers);

    const availability = React.useMemo(() => {
        const userStatus = find(usersQuery.data, status => userId === status[0]);

        if (userStatus) {
            return userStatus[2] ?? '';
        }

        return ''; /* Status not available yet */
    }, [ usersQuery, userId ]);

    return (
        <AvatarOthers
            status={availability}
            avatar={avatar ? `http://localhost:3000/static/${avatar}` : default_avatar}
            userId={userId} />
    );
};