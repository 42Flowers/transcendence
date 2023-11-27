import React from 'react';
import MainButton from '../MainButton/MainButton'
import { IoMailOutline, IoLockClosedOutline } from 'react-icons/io5';
import './LoginForm.css';

const LoginForm: React.FC = () => {
	const authorizeUrl = React.useMemo(() => {
		const url = new URL('https://api.intra.42.fr/oauth/authorize');
		const { searchParams } = url;

		searchParams.append('client_id', 'u-s4t2ud-8d978e732262281f66a1efd2053be66c07e8f1ec16d7ca8e7c73c5c058f01068');
		searchParams.append('redirect_uri', 'http://localhost:5173/auth/callback');
		searchParams.append('response_type', 'code');

		return url.href;
	}, []);

	return (
		<div className="LoginForm-wrapper">
			<div className="box-popup">
				<form action="#">
					<h2>Login</h2>
					<div className="input-box">
						<label>Email</label>
						<input
						id="email"
						name="email"
						type="email"
						// autoComplete="email"
						required
						/>
						<IoMailOutline className="icon"/>
					</div>
					<div className="input-box">
						<label>Password</label>
						<input
						id="password"
						name="password"
						type="password"
						required/>
						<IoLockClosedOutline className="icon"/>
					</div>
					<div className="remember-forgot">
						<input type="checkbox" name="remember_me" />Remember me
						<a href="#">Forgot Password?</a>
					</div>
					<MainButton buttonName='Login'/>
					<div className="input-box">
					<p>or</p>
					<MainButton as="a" href={authorizeUrl} buttonName='42 Account' />
					</div>
					<p>Don't have an account ? <a href="#" className="register-link">Register</a></p>
				</form>
			</div>
		</div>
	);
};

export default LoginForm;