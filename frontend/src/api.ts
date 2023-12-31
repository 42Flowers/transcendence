import axios, { RawAxiosRequestHeaders, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthenticationToken } from './storage';

export const client = axios.create({
    baseURL: import.meta.env.API_BASE_URL,
    timeout: 5000,
});

export type UserID = number | '@me';

export type AuthorizeCodeResponse = {
    token: string;
};

export type PasswordLoginResponse = {
    ticket: string;
    mfa: string[];
} & AuthorizationTokenPayload;

export type AuthorizationTokenPayload = {
    token: string;
    type: string;
    expire_at: number;
};

export interface UserProfile {
    pseudo: string;
    email: string;
    id: number;
    avatar: string;
}

type SubmitOTPResponse = AuthorizationTokenPayload;

function makeAuthorizationHeader(): RawAxiosRequestHeaders {
    const token = getAuthenticationToken();

    if (!token)
        return {};

    return {
        Authorization: `Bearer ${token}`,
    };
}

function injectAuthorizationHeader(headers: RawAxiosRequestHeaders = {}): RawAxiosRequestHeaders {
    const authorizationHeader = makeAuthorizationHeader();

    return {
        ...headers,
        ...authorizationHeader,
    };
}

function authorizedPost<P = any>(url: string, data: any, config: AxiosRequestConfig = {}) {
    return client.post<P>(url, data, {
        ...config,
        headers: injectAuthorizationHeader(config.headers ?? {}),
    });
}

function authorizedPatch<P = any>(url: string, data: any, config: AxiosRequestConfig = {}) {
    return client.patch<P>(url, data, {
        ...config,
        headers: injectAuthorizationHeader(config.headers ?? {}),
    });
}

function authorizedGet<P = any>(url: string, config: AxiosRequestConfig = {}) {
    return client.get<P>(url, {
        ...config,
        headers: injectAuthorizationHeader(config.headers ?? {}),
    });
}

async function wrapResponse<T>(resp: Promise<AxiosResponse<T>>): Promise<T> {
    const awaitedResponse = await resp;

    return awaitedResponse.data;
}

export const authorizeCode = (code: string) => wrapResponse(client.post<AuthorizeCodeResponse>('/api/v1/auth/authorize_code', { provider: 'ft', code }));
export const loginWithPassword = (email: string, password: string) => wrapResponse(client.post<PasswordLoginResponse>('/api/v1/auth/login', { email, password }));
export const submitOtp = (ticket: string, code: string) => wrapResponse(client.post<AuthorizationTokenPayload>('/api/v1/auth/mfa/otp', { ticket, code }));
export const registerUser = (payload: any) => wrapResponse(client.post('/api/v1/auth/register', payload));

export const fetchUserProfile = (profile: UserID) => wrapResponse(authorizedGet<UserProfile>(`/api/v1/users/${profile}`));

export type PatchUserProfile = Partial<Omit<UserProfile, 'id' | 'avatar'>> & { avatar?: File };

export const patchUserProfile = (profile: UserID, data: PatchUserProfile) =>
    wrapResponse(authorizedPatch<UserProfile>(`/api/v1/users/${profile}`, objectToFormData(data)));

/* ==== PROFILE ==== */
export type PublicUserProfile = {
    id: number;
    pseudo: string;
    avatar: string | null;
};

function objectToFormData(o: Record<string, Blob | string | number>): FormData {
    const formData = new FormData();

    for (const key in o) {
        const v = o[key];

        if (v instanceof Blob)
            formData.append(key, v);
        else
            formData.append(key, v.toString());
    }

    return formData;
}

export const fetchProfilePublic = (targetId: UserID) => wrapResponse(authorizedGet<PublicUserProfile>(`/api/profile/${targetId}`));

export type LadderEntry = {
    id: number;
    pseudo: string;
    avatar: string | null;
    gameParticipation: {
        opponentId: number;
        userId: number;
        gameId: number;
        game: {
            winnerId: number;
            looserId: number;
        };
    }[];
}

interface Stats {
    opponentId: number,
    userId: number,
    gameId: number,
    game: {
      id: number,
      score1: number,
      score2: number,
      winnerId: number,
      looserId: number,
      createdAt: string,
    }
}

export const fetchLadder = () => wrapResponse(authorizedGet<LadderEntry[]>('/api/profile/ladder'));
export const fetchMatchHistory = (userId: UserID) => wrapResponse(authorizedGet(`/api/profile/${userId}/matchhistory`));
export const fetchStats = (userId: UserID) => wrapResponse(authorizedGet<Stats[]>(`/api/profile/${userId}/stats`));

/* ==== CHAT ==== */
export type ChannelMessage = {
    id: number;
    authorName: string;
    authorId: number;
    content: string;
    createdAt: string;
};

export type PrivateMessage = {
    id: number;
    authorName: string;
    authorId: number;
    content: string;
    createdAt: string;
};

export type ChannelMembership = {
    userId: number;
    userName: string;
    membershipState: number;
    permissionMask: number;
    avatar: string | null;
};

export type ChannelDescription = {
    accessMask: number;
    channelId: number;
    channelName: string;
    membershipState: number;
    userPermissionMask: number;
};

export type ConversationDescription = {
    avatar: string | null;
    conversationId: number;
    targetId: number;
    targetName: string;
};

export const fetchAvailableChannels = () => wrapResponse(authorizedGet<ChannelDescription[]>(`/api/chat/get-channels`));
export const fetchAvailableDMs = () => wrapResponse(authorizedGet<ConversationDescription[]>(`/api/chat/get-conversations`));
export const fetchChannelMessages = (channelId: number) => wrapResponse(authorizedGet<ChannelMessage[]>(`/api/chat/get-channelmessages/${channelId}`));
export const fetchDmMessages = (channelId: number) => wrapResponse(authorizedGet<PrivateMessage[]>(`/api/chat/get-privatemessages/${channelId}`));
export const fetchChannelMembers = (channelId: number) => wrapResponse(authorizedGet<ChannelMembership[]>(`/api/chat/get-channelmembers/${channelId}`));
export const fetchBlockedUsers = () => wrapResponse(authorizedGet<{ blockedId: number; }[]>(`/api/chat/get-blocked-users`));

export type KickPayload = {
    channelId: number;
    targetId: number;
};

export type BanUserPayload = {
    channelId: number;
    targetId: number;
}

export type UnBanUserPayload = {
    channelId: number;
    targetId: number;
}

export type CreatePrivateChannelPayload = {
    channelName: string;
};

export const joinChannel = (payload: any) => wrapResponse(authorizedPost<ChannelDescription>('/api/chat/join-channel', payload));
//export const createChannel = (payload: any) => wrapResponse(authorizedPost(`api/chat/create-channel/`, payload));
export const createPrivateChannel = (payload: CreatePrivateChannelPayload) => wrapResponse(authorizedPost<ChannelDescription>(`api/chat/create-private-channel`, payload));
export const addDm = (payload: any) => wrapResponse(authorizedPost<ConversationDescription>(`api/chat/create-conversation`, payload));
export const quit = (payload: any) => wrapResponse(authorizedPost(`api/chat/exit-channel`, payload));
export const deleteM = (payload: any) => wrapResponse(authorizedPost(`api/chat/delete-channel`, payload));
export const inviteUser = (payload: any) => wrapResponse(authorizedPost(`api/chat/invite-user`, payload));
export const mute = (payload: any) => wrapResponse(authorizedPost(`api/chat/mute-user`, payload));
export const unmute = (payload: any) => wrapResponse(authorizedPost(`api/chat/unmute-user`, payload));
export const ban = (payload: BanUserPayload) => wrapResponse(authorizedPost(`api/chat/ban-user`, payload));
export const unban = (payload: UnBanUserPayload) => wrapResponse(authorizedPost(`api/chat/unban-user`, payload));
export const kick = (payload: KickPayload) => wrapResponse(authorizedPost(`api/chat/kick-user`, payload));
export const addAdmin = (payload: any) => wrapResponse(authorizedPost(`api/chat/add-admin`, payload));
export const removeAdmin = (payload: any) => wrapResponse(authorizedPost(`api/chat/rm-admin`, payload));
export const addPwd = (payload: any) => wrapResponse(authorizedPost(`api/chat/add-pwd`, payload));
export const changePwd = (payload: any) => wrapResponse(authorizedPost(`api/chat/change-pwd`, payload));
export const deletePwd = (payload: any) => wrapResponse(authorizedPost(`api/chat/rm-pwd`, payload));

// OLD CHAT
export const getConversations = () => wrapResponse(authorizedGet(`/api/chat/get-conversations`));

/* ==== STATUS ==== */
export type UserStatus = [
    number, /* ID */
    string, /* Username */
    string, /* Status */
];

export const fetchAvailableUsers = () => wrapResponse(authorizedGet<UserStatus[]>('/api/gateway/status'));

/* ==== FRIENDS ==== */
export const fetchIsFriended = (userId: UserID, friendId: number) => wrapResponse(authorizedGet<{ isFriended: boolean; }>(`/api/profile/${userId}/isFriendwith/${friendId}`));
export const addUser = (userId: UserID, friendId: number) => wrapResponse(authorizedPost(`/api/profile/${userId}/add/${friendId}`, ''));
export const fetchIsBlocked = (userId: UserID, friendId: number) => wrapResponse(authorizedGet<{ isBlocked: boolean; }>(`/api/profile/${userId}/isBlockWith/${friendId}`));
export const blockUser = (userId: UserID, friendId: number) => wrapResponse(authorizedPost(`/api/profile/${userId}/block/${friendId}`, ''));
export const unblockUser = (userId: UserID, friendId: number) => wrapResponse(authorizedPost(`/api/profile/${userId}/unblock/${friendId}`, ''));

// FRIEND PAGE FROM FETCH TO QUERY
export const fetchFriendsList = () => wrapResponse(authorizedGet('/api/friends'));
export const unblockUserMutation = (payload: any) => wrapResponse(authorizedPost(`api/friends/unblock`, payload));
export const blockUserMutation = (payload: any) => wrapResponse(authorizedPost(`api/friends/block`, payload));
export const deleteFriendMutation = (payload: any) => wrapResponse(authorizedPost(`api/friends/delete`, payload));
export const cancelFriendInvitation = (payload: any) => wrapResponse(authorizedPost(`api/friends/cancel`, payload));
export const declineFriendInvitation = (payload: any) => wrapResponse(authorizedPost(`api/friends/decline`, payload));
export const acceptFriendInvitation = (payload: any) => wrapResponse(authorizedPost(`api/friends/accept`, payload));

/* ==== MFA ==== */
export const generateSecretKey = () => wrapResponse(authorizedPost('/api/v1/auth/mfa/generate', ''));
export const updateMfaState = (state: boolean, code: string) => wrapResponse(authorizedPatch('/api/v1/auth/mfa', { state, code }));
export const fetchMfaStatus = () => wrapResponse(authorizedGet<{ status: boolean; }>('/api/v1/auth/mfa/status'));

/* ==== Achievements ==== */

export interface Achievement {
    id: number;
    name: string;
    description: string;
    difficulty: number;
    isHidden: boolean;
    createdAt: Date;
}

export const fetchAchievements = (userId: UserID) => wrapResponse(authorizedGet<Achievement[]>(`/api/profile/${userId}/achievements`));
