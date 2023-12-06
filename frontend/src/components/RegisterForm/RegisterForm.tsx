import React from 'react';
import './RegisterForm.scss';
import MainButton from '../MainButton/MainButton'
// import { IoMailOutline } from "react-icons/io5";
// import { IoLockClosedOutline } from "react-icons/io5";
// import { IoPawOutline } from "react-icons/io5";
// // import { GiFireflake } from "react-icons/gi";
// import { HiOutlineUserCircle } from "react-icons/hi2";
import { Stack } from '@mui/material';
import { Input } from '../Form/Input';
import { Link } from 'react-router-dom';
import { Form, FormValidator } from '../Form/Form';
import { useMutation } from 'react-query';
import { registerUser } from '../../api';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { useAuthContext } from '../../contexts/AuthContext';

const registerFormValidator: FormValidator = {
	username(value: string) {
		if (value.length < 3) {
			throw new Error('Usernames must be at least 3 characters in length');
		}

		if (value.length > 32) {
			throw new Error('Usernames must be less than 32 characters');
		}
	},
	password(value: string, data: object) {
		if (value !== data['password_confirm']) {
			throw new Error('Passwords do not match');
		}
	},
	password_confirm(value: string, data: object) {
		if (value !== data['password']) {
			throw new Error('Passwords do not match');
		}
	},
	email(value: string) {

	}
};

const RegisterForm: React.FC = () => {
	const { enqueueSnackbar } = useSnackbar();
	const [ formErrors, setFormErrors ] = React.useState<object>({});
	const { authenticate } = useAuthContext();

	const registerMutation = useMutation(registerUser, {
		onSuccess(data, variables, context) {
			if ('token' in data) {
				/* TODO broken */
				// authenticate(data['token']);
			}

			setFormErrors({});
			/* TODO here we should login the user */
		},
		onError(error: AxiosError) {
			if (error.response?.status === 400) {
				const { errors } = (error.response.data as any);

				if (typeof errors === 'object') {
					setFormErrors(errors as object);
					return ;
				}
			}

			enqueueSnackbar({
				message: `Could not register : ${error.message}`,
				variant: 'error',
				anchorOrigin: {
					horizontal: 'center',
					vertical: 'top',
				},
			});
		},
	});

	const handleOnSubmit = React.useCallback((data: any) => {
		registerMutation.mutate(data);
	}, []);

	return (
		<Stack direction="row" justifyContent="center">
			<div className="auth-container register-form">
				<Form validator={registerFormValidator} onSubmit={handleOnSubmit} errors={formErrors}>
					<h2>Register</h2>
					<Input
						label="Username"
						// icon={<HiOutlineUserCircle />}
						name="username"
						autoComplete="off"
						type="text"
						required
						/>
					<Input
						label="Email"
						// icon={<IoMailOutline />}
						name="email"
						type="email"
						autoComplete="email"
						required
						/>
					{/* <div className="input-box">
						<select name="element" className="element">
							<option value="fire">fire</option>
							<option value="water">water</option>
							<option value="air">air</option>
							<option value="earth" selected>earth</option>
						</select>
						<label>Your favorite element:</label>
						<GiFireflake className="icon"/>
					</div> */}
					<Input
						label="Password"
						// icon={<IoLockClosedOutline />}
						name="password"
						type="password"
						required
						/>
					<Input
						label="Confirm Password"
						// icon={<IoPawOutline />}
						name="password_confirm"
						type="password"
						required
						/>
					<Stack direction="row" justifyContent="flex-start">
						<div className="remember-forgot">
							<input type="checkbox"/>I agree to the terms & conditions
						</div>
					</Stack>
					<MainButton buttonName="Register" loading={registerMutation.isLoading} />
					<p className="or">or</p>
					<MainButton buttonName="42 Account" />
					<p>
						Already have an account ? <Link to="/auth/login">Login</Link>
					</p>
				</Form>
			</div>
		</Stack>
	);
};

export default RegisterForm;