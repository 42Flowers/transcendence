import { useSocketEvent } from "./components/Socket/Context/Context"
import { queryClient } from "./query-client";
import filter from 'lodash/filter';
import { UserStatus } from './api';

export type StatusChangePayload = {
    userId: number;
    username: string;
    status: string;
}

export const StatusManager: React.FC = () => {
    useSocketEvent<StatusChangePayload>('status', ({ userId, username, status }) => {
        if (queryClient.getQueryData([ 'available-users' ]) !== undefined) {
            queryClient.setQueryData<UserStatus[]>([ 'available-users' ], statusList => ([
                ...filter(statusList, status => status[0] !== userId),
                [ userId, username, status ],
            ]));
        }
    });

    return null;
}