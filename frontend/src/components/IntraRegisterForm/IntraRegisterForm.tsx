import { Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import React from 'react';
import { HiOutlineUserCircle } from "react-icons/hi2";
import { useMutation } from 'react-query';
import { PatchUserProfile, completeRegister, patchUserProfile } from '../../api';
import { useAuthContext } from '../../contexts/AuthContext';
import { Form, FormValidator } from '../Form/Form';
import { Input } from '../Form/Input';
import MainButton from '../MainButton/MainButton';
import './IntraRegisterForm.scss';
import { withAuthGuard } from '../../hocs/AuthGuard';
import { useNavigate } from 'react-router-dom';
import ChangeAvatar from '../Profile/ChangeAvatar/ChangeAvatar';

const intraRegisterFormValidator: FormValidator = {
	username(value: string) {
		if (value.length < 3) {
			throw new Error('Usernames must be at least 3 characters in length');
		}

		if (value.length > 10) {
			throw new Error('Usernames must be less or equal to 10 characters');
		}
	},
};

const IntraRegisterForm: React.FC = () => {
	const { enqueueSnackbar } = useSnackbar();
	const [ formErrors, setFormErrors ] = React.useState<object>({});
	const { isAuthenticated, user, signIn } = useAuthContext();
	const [ avatar, setAvatar ] = React.useState<File>();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (user?.pseudo !== null) {
			navigate('/');
		}
	}, [ user ]);

	const completeRegisterMutation = useMutation({
		mutationFn: completeRegister,
		onSuccess(data) {
			enqueueSnackbar({
				message: `Nice to meet you, ${data.pseudo} !`,
				variant: 'success',
				anchorOrigin: {
					horizontal: 'center',
					vertical: 'top',
				},
			});

			signIn(data);
		},
		onError(error: AxiosError) {
			enqueueSnackbar({
				message: `${error.message}`,
				variant: 'error',
				anchorOrigin: {
					horizontal: 'center',
					vertical: 'top',
				},
			});
		},
	});

	const handleOnSubmit = React.useCallback((data: Record<string, string>) => {
		const formData = new FormData();

		for (const k in data) {
			formData.append(k, data[k]);
		}

		if (avatar) {
			formData.append('avatar', avatar!);

			completeRegisterMutation.mutate(formData);
		}
	}, [ avatar ]);

	const handleChangeAvatar = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setAvatar(e.currentTarget.files?.[0]);
	}, [ setAvatar ]);

	return (
		<Stack direction="row" justifyContent="center">
			<div className="auth-container register-form" style={{height:'auto'}}>
				<Form validator={intraRegisterFormValidator} onSubmit={handleOnSubmit} errors={formErrors}>
					<h2>Register</h2>
					<p>
						Welcome to transcendence !
						Let's choose a username to begin. Choose it carefully, you can change it later but it is better if you can pick a super cool name, right ;)
					</p>
					<Input
						label="Username"
						icon={<HiOutlineUserCircle />}
						name="pseudo"
						autoComplete="off"
						maxLength={10}
						minLength={3}
						type="text"
						required
					/>
					<ChangeAvatar handleUploadAvatar={handleChangeAvatar} />
					{/* <Avatar
						alt="Avatar"
						src={default_avatar}
						sx={{
							width: '6vh',
							height: '6vh'
						}}
					/> */}
					{/* <Button
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
					/> */}
					<MainButton buttonName="Register" loading={completeRegisterMutation.isLoading} />
				</Form>
			</div>
		</Stack>
	);
};

export default withAuthGuard(IntraRegisterForm);
