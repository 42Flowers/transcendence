import React, { PropsWithChildren } from 'react';
import { getAuthenticationToken } from '../storage';
import { fetchUserProfile } from '../api';

const HANDLERS = {
  INITIALIZE: 'INITIALIZE' as const,
  SIGN_IN: 'SIGN_IN' as const,
  SIGN_OUT: 'SIGN_OUT' as const
};

type AuthUserInfo = Record<string, any>;

type AuthenticationState<P extends {} = AuthUserInfo > = {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: null | P;
}

const initialState: AuthenticationState = {
  isAuthenticated: false,
  isLoading: true,
  user: null
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

type Action<P extends {} = {}> = SignInAction<P> | SignOutAction | InitializeAction<P>;

type Handlers<P extends {} = {}> = {
  [HANDLERS.INITIALIZE]: (state: AuthenticationState<P>, action: InitializeAction<P>) => AuthenticationState<P>,
  [HANDLERS.SIGN_IN]: (state: AuthenticationState<P>, action: SignInAction<P>) => AuthenticationState<P>,
  [HANDLERS.SIGN_OUT]: (state: AuthenticationState<P>, action: SignOutAction) => AuthenticationState<P>,
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
      user: null
    };
  }
};

const reducer = (state: AuthenticationState, action: Action) => (
  handlers[action.type] ? handlers[action.type](state, action as any) : state
);

type AuthContextData = AuthenticationState & {
//   signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
};

// The role of this context is to propagate authentication state through the App tree.
export const AuthContext = React.createContext<AuthContextData>(undefined as any);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [ state, dispatch ] = React.useReducer(reducer, initialState);
  const initialized = React.useRef<boolean>(false);

  const initialize = async () => {
    // Prevent from calling twice in development mode with React.StrictMode enabled
    if (initialized.current) {
      return;
    }

    initialized.current = true;

    if (true || getAuthenticationToken() !== null) {
      try {
        // const userProfile = await fetchUserProfile('@me');
        dispatch({
          type: HANDLERS.INITIALIZE,
          payload: {
            firstName: 'Test',
            lastName: 'Test2',
            avatar: 'bolosse',
            // ...userProfile.data,
          },
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
    []
  );

  const signOut = () => {
    dispatch({
      type: HANDLERS.SIGN_OUT
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthConsumer = AuthContext.Consumer;

export const useAuthContext = () => React.useContext(AuthContext);
