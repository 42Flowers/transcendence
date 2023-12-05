import React, { PropsWithChildren } from 'react';
import { getAuthenticationToken } from '../storage';
import { UserProfileResponse, fetchUserProfile } from '../api';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE' as const,
  SIGN_IN: 'SIGN_IN' as const,
  SIGN_OUT: 'SIGN_OUT' as const,
  AUTHENTICATE: 'AUTHENTICATE' as const,
  REFRESH_ACK: 'REFRESH_ACK' as const,
};

type AuthUserInfo = UserProfileResponse;

type AuthenticationState<P extends {} = AuthUserInfo > = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: null | P;
  refreshRequested: boolean;
}

const initialState: AuthenticationState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  refreshRequested: false,
};

type InitializeAction<P extends {} = {}> = {
  type: 'INITIALIZE';
  payload: P | null;
}

type SignInAction<P extends {} = {}> = {
  type: 'SIGN_IN',
  payload: P;
};

type SignOutAction = {
  type: 'SIGN_OUT';
}

type AuthenticateAction = {
  type: 'AUTHENTICATE';
  token: string;
};

type Action<P extends {} = {}> = SignInAction<P> | SignOutAction | InitializeAction<P> | AuthenticateAction;

type Handlers<P extends {} = {}> = {
  [HANDLERS.INITIALIZE]: (state: AuthenticationState<P>, action: InitializeAction<P>) => AuthenticationState<P>;
  [HANDLERS.SIGN_IN]: (state: AuthenticationState<P>, action: SignInAction<P>) => AuthenticationState<P>;
  [HANDLERS.SIGN_OUT]: (state: AuthenticationState<P>, action: SignOutAction) => AuthenticationState<P>;
  [HANDLERS.AUTHENTICATE]: (state: AuthenticationState<P>, action: AuthenticateAction) => AuthenticationState<P>;
  [HANDLERS.REFRESH_ACK]: (state: AuthenticationState<P>, action: any) => AuthenticationState<P>;
};

const handlers: Handlers = {
  [HANDLERS.INITIALIZE]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      ...(
        // if payload (user) is provided, then is authenticated
        user
          ? ({
            isAuthenticated: true,
            isLoading: false,
            user,
          })
          : ({
            isLoading: false,
          })
      )
    };
  },
  [HANDLERS.SIGN_IN]: (state, action) => {
    const user = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  [HANDLERS.SIGN_OUT]: (state) => {
    localStorage.removeItem('token');
    return {
      ...state,
      isAuthenticated: false,
      user: null,
      refreshRequested: true,
    };
  },
  [HANDLERS.REFRESH_ACK]: () => {
    return {
      ...initialState,
      refreshRequested: false,
    };
  },
  [HANDLERS.AUTHENTICATE]: (state, { token }) => {
    return {
      ...state,
      refreshRequested: true,
      token,
    };
  },
};

const reducer = (state: AuthenticationState, action: Action) => (
  handlers[action.type] ? handlers[action.type](state, action as any) : state
);

type AuthContextData = AuthenticationState & {
//   signIn: (email: string, password: string) => Promise<void>;
  authenticate: (token: string) => void;
  signOut: () => void;
};

// The role of this context is to propagate authentication state through the App tree.
export const AuthContext = React.createContext<AuthContextData>(undefined as any);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [ state, dispatch ] = React.useReducer(reducer, initialState);
  const initialized = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (state.refreshRequested) {
      initialized.current = false;
      dispatch({ type: 'REFRESH_ACK' });
      console.log('Refresh requested');
    }
  }, [ state ]);

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current || state.refreshRequested) {
      return;
    }

    initialized.current = true;

    if (getAuthenticationToken() !== null) {
      try {
        const userProfile = await fetchUserProfile('@me');
        dispatch({
          type: HANDLERS.INITIALIZE,
          payload: userProfile,
        });
        return ;
      } catch {
        
      }
    }
    dispatch({
      type: HANDLERS.INITIALIZE,
      payload: null,
    });
  };

  React.useEffect(
    () => {
      initialize();
    },
    [ initialized.current ]
  );

  const signOut = () => {
    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  const authenticate = (token: string) => {
    dispatch({
      type: HANDLERS.AUTHENTICATE,
      token,
    });
  }

  return (
    <AuthContext.Provider
      value={{
        ...state,
        authenticate,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => React.useContext(AuthContext);
