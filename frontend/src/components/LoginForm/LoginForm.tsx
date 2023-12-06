import React from 'react';
// import { IoLockClosedOutline, IoMailOutline } from 'react-icons/io5';
import { useMutation } from 'react-query';
import { loginWithPassword } from '../../api';
import { AuthReducerProps, setAuthToken, setTicketAction } from '../Auth/auth-reducer';
import MainButton from '../MainButton/MainButton';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import './LoginForm.scss';
import { Input } from '../Form/Input';
import { Link } from 'react-router-dom';

type LoginFormProps = Pick<AuthReducerProps, 'dispatch'>;

type EmailAndPassword = {
    email: string;
    password: string;
};

const LoginForm: React.FC<LoginFormProps> = ({ dispatch }) => {
	const authorizeUrl = React.useMemo(() => {
		const url = new URL('https://api.intra.42.fr/oauth/authorize');
		const { searchParams } = url;

		searchParams.append('client_id', 'u-s4t2ud-8d978e732262281f66a1efd2053be66c07e8f1ec16d7ca8e7c73c5c058f01068');
		searchParams.append('redirect_uri', 'http://localhost:5173/auth/callback');
		searchParams.append('response_type', 'code');

		return url.href;
	}, []);

	const { enqueueSnackbar } = useSnackbar();

	const loginMutation = useMutation(({ email, password }: EmailAndPassword) => loginWithPassword(email, password), {
		onSuccess(data) {
			const { ticket, token, mfa } = data;

            if ('ticket' in data) {
                dispatch(setTicketAction(ticket, mfa));
            } else if ('token' in data) {
				dispatch(setAuthToken(token));
			}
		},
		onError(error: AxiosError) {
			let message = error.message;

			if (error.response?.status === 401) {
				message = 'Invalid username or password';
			}

			enqueueSnackbar({
				message,
				variant: 'error',
				anchorOrigin: {
					horizontal: 'center',
					vertical: 'top',
				},
			});
		},
	});

	const handleOnSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
		const formData = new FormData(e.currentTarget);
		const email = formData.get('email')?.toString()!;
		const password = formData.get('password')?.toString()!;

		if (!loginMutation.isLoading) {
			loginMutation.mutate({ email, password });
		}

		e.preventDefault();
	}, []);

	return (
		<form action="#" className="login-form" onSubmit={handleOnSubmit}>
			<h2>Login</h2>
			<Input
				label="Email"
				// icon={<IoMailOutline />}
				name="email"
				type="email"
				autoComplete="email"
				required />
			<Input
				label="Password"
				// icon={<IoLockClosedOutline />}
				name="password"
				type="password"
				autoComplete="email"
				required />
			<div className="remember-forgot">
				<label className="checkbox">
					<input type="checkbox" name="remember_me" />
					<div className="checkbox-check"></div>
					Remember me
				</label>
				<a href="#">Forgot Password?</a>
			</div>
			<MainButton as="button" type="submit" buttonName="Login" loading={loginMutation.isLoading} />
			<p className="or">or</p>
			<MainButton as="a" href={authorizeUrl} buttonName="42 Account" />
			<p>
				Don't have an account ? <Link to="/auth/register" className="register-link">Register</Link>
			</p>
		</form>
	);
};

export default LoginForm;