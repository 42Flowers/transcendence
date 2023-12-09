import axios, { RawAxiosRequestHeaders, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getAuthenticationToken } from './storage';

export const client = axios.create({
    baseURL: 'http://localhost:3000/',
    timeout: 5000,
});

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

function wrapResponse<T>(resp: Promise<AxiosResponse<T>>): Promise<T> {
    const artificialDelay = 2000;

    if (artificialDelay > 0) {
        return new Promise((resolve, reject) => setTimeout(() => {
            resp.then(e => resolve(e.data)).catch(err => reject(err));
        }, artificialDelay));
    }

    return resp.then(e => e.data);
}

export const authorizeCode = (code: string) => wrapResponse(client.post<AuthorizeCodeResponse>('/api/v1/auth/authorize_code', { provider: 'ft', code }));
export const loginWithPassword = (email: string, password: string) => wrapResponse(client.post<PasswordLoginResponse>('/api/v1/auth/login', { email, password }));
export const submitOtp = (ticket: string, code: string) => wrapResponse(client.post<AuthorizationTokenPayload>('/api/v1/auth/mfa/otp', { ticket, code }));
export const registerUser = (payload: any) => wrapResponse(client.post('/api/v1/auth/register', payload));

export const fetchUserProfile = (profile: number | '@me') => wrapResponse(authorizedGet<UserProfile>(`/api/v1/users/${profile}`));

export type PatchUserProfile = Partial<Exclude<UserProfile, 'id' | 'avatar'>>;

export const patchUserProfile = (profile: '@me' | number, data: Partial<PatchUserProfile>) =>
    wrapResponse(authorizedPatch<UserProfile>(`/api/v1/users/${profile}`, data));

/* ==== PROFILE ==== */
export const fetchProfile = () => wrapResponse(authorizedGet('/api/profile'));
export const fetchAchievements = () => wrapResponse(authorizedGet('/api/profile/achievements'));
export const fetchLadder = () => wrapResponse(authorizedGet('/api/profile/ladder'));
export const fetchMatchHistory = () => wrapResponse(authorizedGet('/api/profile/matchhistory'));
export const fetchStats = () => wrapResponse(authorizedGet('/api/profile/stats'));
export const fetchAddAchievementToUser = (payload: any) => wrapResponse(authorizedPost('/api/profile/add-achievement-to-user', payload));
export const fetchAddAvatar = (payload: any) => wrapResponse(authorizedPost('/api/profile/add-avatar', payload));
export const fetchChangePseudo = (payload: any) => wrapResponse(authorizedPost('/api/profile/change-pseudo', payload));

/* ==== CHAT ==== */
export const fetchAvailableChannels = () => wrapResponse(authorizedGet(`/api/chat/get-channels`));
export const fetchAvailableDMs = () => wrapResponse(authorizedGet(`/api/chat/get-conversations`));
export const fetchChannelMembers = (channelId: number) => wrapResponse(authorizedGet(`/api/chat/get-channelmembers/${channelId}`));
export const fetchChannelMessages = (channelId: number) => wrapResponse(authorizedGet(`/api/chat/get-channelmessages/${channelId}`));
export const fetchDmMessages = (channelId: number) => wrapResponse(authorizedGet(`/api/chat/get-privatemessages/${channelId}`));
export const fetchBlockedUsers = () => wrapResponse(authorizedGet(`/api/chat/get-blocked-users`));

export const joinChannel = (payload: any) => wrapResponse(authorizedPost(`api/chat/join-channel/`, payload));
//export const createChannel = (payload: any) => wrapResponse(authorizedPost(`api/chat/create-channel/`, payload));
export const addDm = (payload: any) => wrapResponse(authorizedPost(`api/chat/create-conversation/`, payload));
export const quit = (payload: any) => wrapResponse(authorizedPost(`api/chat/exit-channel/`, payload));

// OLD CHAT
export const getConversations = () => wrapResponse(authorizedGet(`/api/chat/get-conversations`));

/* ==== STATUS ==== */
export const fetchAvailableUsers = () => wrapResponse(authorizedGet('/api/gateway/status'));

/* ==== FRIENDS ==== */
export const fetchIsFriended = (userId: number, friendId: number) => wrapResponse(authorizedGet<{ isFriended: boolean; }>(`/api/profile/${userId}/isFriendwith/${friendId}`));
export const addUser = (userId: number, friendId: number) => wrapResponse(authorizedPost(`api/profile/${userId}/add/${friendId}`, ''));
export const fetchIsBlocked = (userId: number, friendId: number) => wrapResponse(authorizedGet<{ isBlocked: boolean; }>(`/api/profile/${userId}/isBlockWith/${friendId}`));
export const blockUser = (userId: number, friendId: number) => wrapResponse(authorizedPost(`/api/profile/${userId}/block/${friendId}`, ''));
export const unblockUser = (userId: number, friendId: number) => wrapResponse(authorizedPost(`/api/profile/${userId}/unblock/${friendId}`, ''));

/* ==== MFA ==== */
export const generateSecretKey = () => wrapResponse(authorizedPost('/api/v1/auth/mfa/generate', ''));
export const updateMfaState = (state: boolean, code: string) => wrapResponse(authorizedPatch('/api/v1/auth/mfa', { state, code }));
export const fetchMfaStatus = () => wrapResponse(authorizedGet<{ status: boolean; }>('/api/v1/auth/mfa/status'));
