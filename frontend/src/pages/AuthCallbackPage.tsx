import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from 'react-query';
import { authorizeCode } from '../api';
import { setAuthenticationToken } from '../storage';
import { AxiosError } from 'axios';

const AuthCallback: React.FC = () => {
    const [ searchParams ] = useSearchParams();
    const ignore = React.useRef<boolean>(false);
    const navigate = useNavigate();
    const authorizeCodeMutation = useMutation({
        mutationFn: authorizeCode,
        onSuccess: response => {
            const { data } = response;

            setAuthenticationToken(data.token);
            navigate('/');
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