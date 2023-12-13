import React, { PropsWithChildren } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';

export const AuthGuard: React.FC<PropsWithChildren> = ({ children }) => {
    const { isAuthenticated, user } = useAuthContext();
    const currentLocation = useLocation();

    if (isAuthenticated) {
        if (null === user?.pseudo && '/auth/intra-register' !== currentLocation.pathname) {
            return <Navigate to="/auth/intra-register" />
        }
    } else {
        return <Navigate to="/auth/login" />
    }
    return children;
}