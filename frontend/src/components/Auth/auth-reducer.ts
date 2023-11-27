import { AuthenticationMode } from "../DoubleAuth/DoubleAuth";

export type IAuthState = {
    token?: string;
    ticket?: string;
    mfa?: string[];
    selectedMfa?: string;

    currentPanelIndex: number;

    mfaState: {
	    [k in typeof AuthenticationMode[keyof typeof AuthenticationMode]]?: {
            nextRetry: number;
        };
    };
}

export interface IAuthAction {
    type: string;
}

export interface ISetTicketAction {
    type: 'SET_TICKET';
    ticket: string;
    mfa: string[];
}

export interface ISetSelectedMfa {
    type: 'SET_SELECTED_MFA';
    selectedMfa: string;
}

export interface ISetMfaStateAction {
    type: 'SET_MFA_STATE';
    mfa: string;
    mfaState: any;
}

export interface ISetAuthTokenAction {
    type: 'SET_AUTH_TOKEN';
    token: string;
}

export interface ISetResendTime {
    type: 'SET_MFA_RESEND_TIME';
    authMode: AuthenticationMode;
    resendTime: number;
}

export const setTicketAction = (ticket: string, mfa: string[]) => ({ type: 'SET_TICKET', ticket, mfa });

export const setSelectedMfa = (selectedMfa: string) => ({ type: 'SET_SELECTED_MFA', selectedMfa });

export const backToMethodPicker = () => ({ type: 'BACK_TO_PICKER' });

export const setMfaState = (mfa: string, mfaState: any) => ({ type: 'SET_MFA_STATE', mfa, mfaState });

export const setResendTime = (authMode: AuthenticationMode, resendTime: number) => ({ type: 'SET_MFA_RESEND_TIME', authMode, resendTime });

export const setAuthToken = (token: string) => ({ type: 'SET_AUTH_TOKEN', token });

function patchState<T>(state: T, patch: Partial<T>): T {
    return {
        ...state,
        ...patch,
    };
}

export function authReducer(state: IAuthState, action: IAuthAction): IAuthState {
    const { type } = action;
    
    if ('SET_TICKET' === type) {
        const { ticket, mfa } = action as ISetTicketAction;

        return patchState(state, {
            ticket, mfa, currentPanelIndex: 1,
        });
    } else if ('SET_SELECTED_MFA' === type) {
        const { selectedMfa } = action as ISetSelectedMfa;

        return patchState(state, {
            currentPanelIndex: 2,
            selectedMfa,
        });
    } else if ('BACK_TO_PICKER' === type) {
        return patchState(state, {
            currentPanelIndex: 1,
        });
    } else if ('SET_MFA_STATE' === type) {
        const { mfa, mfaState } = action as ISetMfaStateAction;

        return patchState(state, {
            [mfa]: mfaState,
        });
    } else if ('SET_MFA_RESEND_TIME' === type) {
        const { authMode, resendTime } = action as ISetResendTime;

        return patchState(state, {
            mfaState: patchState(state.mfaState, {
                [authMode]: patchState(state.mfaState[authMode], {
                    nextRetry: resendTime,
                }),
            }),
        });
    } else if ('SET_AUTH_TOKEN' === type) {
        const { token } = action as ISetAuthTokenAction;

        return patchState(state, {
            token,
        });
    }
    return state;
}

export const kAuthDefaultState: IAuthState = {
    currentPanelIndex: 0,
    mfaState: {},
};

export type AuthReducerProps = {
    state: IAuthState,
    dispatch: React.Dispatch<IAuthAction>,
};
