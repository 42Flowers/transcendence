import React, { PropsWithChildren } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAuthenticated } = useAuthContext();
    const ignore = React.useRef<boolean>(false);
    const [ isAuthorized, setAuthorization ] = React.useState<boolean>(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (ignore.current)
            return ;

        ignore.current = true;

        if (isAuthenticated) {
            setAuthorization(true);
        } else {
            navigate('/auth/login');
        }
    }, []);

    if (!isAuthorized)
        return null;

    return children;
}