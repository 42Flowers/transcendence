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

export interface UserProfileResponse {
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

function authorizedGet<P = any>(url: string, config: AxiosRequestConfig = {}) {
    return client.get<P>(url, {
        ...config,
        headers: injectAuthorizationHeader(config.headers ?? {}),
    });
}

function wrapResponse<T>(resp: Promise<AxiosResponse<T>>): Promise<T> {
    return resp.then(e => e.data);
}

export const authorizeCode = (code: string) => wrapResponse(client.post<AuthorizeCodeResponse>('/api/v1/auth/authorize_code', { provider: 'ft', code }));
export const loginWithPassword = (email: string, password: string) => wrapResponse(client.post<PasswordLoginResponse>('/api/v1/auth/login', { email, password }));
export const submitOtp = (ticket: string, code: string) => wrapResponse(client.post<AuthorizationTokenPayload>('/api/v1/auth/mfa/otp', { ticket, code }));
export const registerUser = (payload: any) => wrapResponse(client.post('/api/v1/auth/register', payload));

export const fetchUserProfile = (profile: string) => wrapResponse(authorizedGet<UserProfileResponse>(`/api/v1/users/${profile}`));

export const fetchProfile = () => wrapResponse(authorizedGet('/api/profile'));
export const fetchAchievements = () => wrapResponse(authorizedGet('/api/profile/achievements'));
export const fetchLadder = () => wrapResponse(authorizedGet('/api/profile/ladder'));
export const fetchMatchHistory = () => wrapResponse(authorizedGet('/api/profile/matchhistory'));
export const fetchStats = () => wrapResponse(authorizedGet('/api/profile/stats'));
export const fetchAddAchievementToUser = (payload: any) => wrapResponse(authorizedPost('/api/profile/add-achievement-to-user', payload));
export const fetchAddAvatar = (payload: any) => wrapResponse(authorizedPost('/api/profile/add-avatar', payload));
export const fetchChangePseudo = (payload: any) => wrapResponse(authorizedPost('/api/profile/change-pseudo', payload));

export const getConversations = () => wrapResponse(authorizedGet(`/api/chat/get-conversations`));
