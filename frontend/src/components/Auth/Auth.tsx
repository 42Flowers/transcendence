import React from 'react';
import { AuthMethodPicker, AuthenticationMode, AuthenticationPanel } from '../DoubleAuth/DoubleAuth';
import LoginForm from '../LoginForm/LoginForm';
import { Panel, PanelContainer } from './PanelContainer';
import { AuthReducerProps, authReducer, backToMethodPicker, initializeAuth, kAuthDefaultState, setAuthToken, setSelectedMfa, setTicketAction } from './auth-reducer';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAuthenticationToken } from '../../storage';
import { useAuthContext } from '../../contexts/AuthContext';
import { useSnackbar } from 'notistack';
import { authorizeCode } from '../../api';

type AuthManagerProps = AuthReducerProps;

type OAuthPanelProps = AuthReducerProps;

function useAuthRequest<P = any>(code: string, onSuccess: (data: P) => void) {
    const fired = React.useRef<boolean>(false);
    const [ state, setState ] = React.useState<{}>({ isLoading: true, isError: false, isSuccess: false });
    const handler = React.useCallback((data: any, err?: any) => {
        if (err) {
            setState({
                isError: true,
                isLoading: false,
                isSuccess: false,
                error: err,
            })
        } else {
            setState({
                isError: false,
                isLoading: false,
                isSuccess: true,
                data,
            });
            onSuccess(data);
        }
    }, []);

    React.useEffect(() => {
        if (!code) {
            setState({
                isError: true,
                isLoading: false,
                isSuccess: true,
                error: 'The code is invalid.'
            });
        } else {
            if (!fired.current) {
                authorizeCode(code).then(data => {
                    handler(data);
                }, err => {
                    handler(null, err);
                });
                fired.current = true;
            }
        }
    }, []);

    return state;
}

const OAuthPanel: React.FC<OAuthPanelProps> = ({ state, dispatch }) => {
    const { code } = state;
    const authRequest = useAuthRequest(code || '', data => {
        const { ticket, token, mfa } = data;

        console.log(data);

        if ('ticket' in data) {
            dispatch(setTicketAction(ticket, mfa));
        } else if ('token' in data) {
            dispatch(setAuthToken(token));
        }
    });

    if (!code) {
        return 'The code was not provided';
    }

    if (authRequest.isError) {
        return `Authorize failed: ${authRequest.error}`;
    }
    return 'Loading OAUTH OKKK';
};

const AuthManager: React.FC<AuthManagerProps> = ({ state, dispatch }) => {
    const oauthMode = !!state.code;

    return (
        <>
            <Panel index={0}>
                {!oauthMode && <LoginForm dispatch={dispatch} />}
                {oauthMode && <OAuthPanel state={state} dispatch={dispatch} />}
            </Panel>
            <Panel index={1}>
                <AuthMethodPicker
                    methods={state.mfa || []}
                    onMethodPicked={method => dispatch(setSelectedMfa(method))} />
            </Panel>
            <Panel index={2}>
                <AuthenticationPanel
                    state={state}
                    dispatch={dispatch}
                    authenticationMode={state.selectedMfa! as AuthenticationMode}
                    onBack={() => dispatch(backToMethodPicker())}/>
            </Panel>
        </>
    );
};

type AuthProps = {
    isCallbackUrl?: boolean;
};

export const Auth: React.FC<AuthProps> = ({ isCallbackUrl }) => {
    const [ state, dispatch ] = React.useReducer(authReducer, kAuthDefaultState);
    const [ searchParams ] = useSearchParams();
    const navigate = useNavigate();
    const { token, initialized } = state;
    const { isAuthenticated, authenticate } = useAuthContext();
    const ignore = React.useRef<boolean>(false);
    const { enqueueSnackbar } = useSnackbar();
    
    /**
     * Initialize the OAuth login system, check for errors
     * like the user canceled the login process on the OAuth page.
     */
    React.useEffect(() => {
        if (isCallbackUrl) {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            let errorDescription = searchParams.get('error_description');

            if (error || !code) {
                if (!code && !error)
                    errorDescription = 'Invalid OAuth code';

                enqueueSnackbar({
                    variant: 'error',
                    anchorOrigin: {
                        horizontal: 'center',
                        vertical: 'top',
                    },
                    preventDuplicate: true,
                    message: `Error: ${errorDescription || 'Could not login with 42'}`,
                });
                navigate('/auth/login');
            } else {
                dispatch(initializeAuth(code));
                return ;
            }
        }
        dispatch(initializeAuth());
    }, []);

    /**
     * If the user is already authenticated, redirect it to the main page.
     */
    React.useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, []);

    /**
     * If the token has been updated, propagate it to the core authentication system.
     */
    React.useEffect(() => {
        if (token && !ignore.current) {
            ignore.current = true;

            setAuthenticationToken(token);
            authenticate(token);
        }
    }, [ token ]);

    /**
     * Don't show the login page if we are authenticated.
     */
    if (isAuthenticated)
        return null;

    if (!initialized)
        return null;

	return (
        <PanelContainer currentIndex={state.currentPanelIndex}>
            <AuthManager state={state} dispatch={dispatch} />
        </PanelContainer>
	);
};
