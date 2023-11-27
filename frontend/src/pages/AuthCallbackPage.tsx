import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from 'react-query';
import { authorizeCode } from '../api';
import { setAuthenticationToken } from '../storage';
import { AxiosError } from 'axios';
import DoubleAuth from '../components/DoubleAuth/DoubleAuth';

type LoginManagerProps = {
    ticket?: string;
    token?: string;
    mfa?: string[];
};

const LoginManager: React.FC<LoginManagerProps> = ({ token, ticket, mfa }) => {
    const ignore = React.useRef<boolean>(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        if (ignore.current)
            return ;
        ignore.current = true;

        if (token) {
            setAuthenticationToken(token);
            navigate('/');
        }
    }, []);

    return (
        <>
            <DoubleAuth />
        </>
    );
};

const AuthCallback: React.FC = () => {

    return <LoginManager ticket="lol" mfa={[ 'sms' ]} />

    const [ searchParams ] = useSearchParams();
    const ignore = React.useRef<boolean>(false);
    const navigate = useNavigate();
    const authorizeCodeMutation = useMutation({
        mutationFn: authorizeCode,
        onSuccess: response => {
            const { data } = response;

          
        },
    });

    React.useEffect(() => {
        if (ignore.current)
            return;

        ignore.current = true;

        const code = searchParams.get('code');

        if (!code) {
            return navigate('/auth/login');
        }

        authorizeCodeMutation.mutate(code);
    }, []);

    if (authorizeCodeMutation.isLoading) {
        return (
            <p>
                Logging in...
            </p>
        );
    }

    if (authorizeCodeMutation.isError) {
        return (
            <p>
                {(authorizeCodeMutation.error as AxiosError).message}
            </p>
        );
    }

    return null;
}

export const AuthCallbackPage: React.FC = () => {
    return (
        <AuthCallback />
    );
}