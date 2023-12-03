import React from 'react';
import './IntraRegisterForm.scss';
import MainButton from '../MainButton/MainButton'
import { IoMailOutline } from "react-icons/io5";
import { IoLockClosedOutline } from "react-icons/io5";
import { IoPawOutline } from "react-icons/io5";
import { GiFireflake } from "react-icons/gi";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { Avatar, Button, Stack } from '@mui/material';
import { Input } from '../Form/Input';
import { Link } from 'react-router-dom';
import { Form, FormValidator } from '../Form/Form';
import { useMutation } from 'react-query';
import { registerUser } from '../../api';
import { useSnackbar } from 'notistack';
import { AxiosError } from 'axios';
import { useAuthContext } from '../../contexts/AuthContext';
import ChangeAvatar from '../Profile/ChangeAvatar/ChangeAvatar';
import default_avatar from "../../assets/images/default_avatar.png";


const intraRegisterFormValidator: FormValidator = {
	username(value: string) {
		if (value.length < 3) {
			throw new Error('Usernames must be at least 3 characters in length');
		}

		if (value.length > 32) {
			throw new Error('Usernames must be less than 32 characters');
		}
	},
};

const IntraRegisterForm: React.FC = () => {
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
				<Form validator={intraRegisterFormValidator} onSubmit={handleOnSubmit} errors={formErrors}>
					<h2>Register</h2>
					<Input
						label="Username"
						icon={<HiOutlineUserCircle />}
						name="username"
						autoComplete="off"
						type="text"
						required
					/>
					<Avatar
						alt="Avatar"
						src={default_avatar}
						sx={{
							width: '6vh',
							height: '6vh'
						}}
					/>
					<Button
						variant="text"
						sx={{ 
							fontSize: '1em', 
							marginTop: '1.5vh',
							fontWeight: '900',
							color: "#F8A38B",
						}}
						onClick={() => (document.getElementById('fileInput') as HTMLElement).click()}
					>
						CHANGE AVATAR 
					</Button>
					<input
						type="file"
						name="avatar"
						id="fileInput"
						style={{ display: 'none' }}
					/>
					<MainButton buttonName="Register" loading={registerMutation.isLoading} />
				</Form>
			</div>
		</Stack>
	);
};

export default IntraRegisterForm;
