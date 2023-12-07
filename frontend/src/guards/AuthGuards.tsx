import React, { PropsWithChildren } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

export const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAuthenticated, user } = useAuthContext();
    const ignore = React.useRef<boolean>(false);
    const [ isAuthorized, setAuthorized ] = React.useState<boolean>(false);
    const navigate = useNavigate();
    const currentLocation = useLocation();

    console.log('Location', currentLocation);

    React.useEffect(() => {
        if (ignore.current)
            return ;

        ignore.current = true;

        if (isAuthenticated) {
            if (user?.pseudo === null && currentLocation.pathname !== '/auth/intra-register') {
                navigate('/auth/intra-register');
            } else {
                setAuthorized(true);
            }
        } else {
            navigate('/auth/login');
        }
    }, []);

    if (!isAuthorized)
        return null;

    return children;
}