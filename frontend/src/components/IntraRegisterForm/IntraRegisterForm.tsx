import { Stack } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import React from 'react';
import { HiOutlineUserCircle } from "react-icons/hi2";
import { useMutation } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { PatchUserProfile, patchUserProfile } from '../../api';
import { useAuthContext } from '../../contexts/AuthContext';
import { withAuthGuard } from '../../hocs/AuthGuard';
import { Form, FormValidator } from '../Form/Form';
import { Input } from '../Form/Input';
import MainButton from '../MainButton/MainButton';
import { ChangeAvatar } from '../Profile/ChangeAvatar/ChangeAvatar';
import './IntraRegisterForm.scss';
import toString from 'lodash/toString';
import get from 'lodash/get';

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
	const [ avatarPreview, setAvatarPreview ] = React.useState<string>();
	const navigate = useNavigate();

	React.useEffect(() => {
		if (user?.pseudo !== null) {
			navigate('/');
		}
	}, [ user ]);

	const patchProfileMutation = useMutation({
		mutationFn: (data: PatchUserProfile) => patchUserProfile('@me', data),
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
				message: `${toString(get(error, 'response.data.message', get(error.message, 'message', 'Error')))}`,
				variant: 'error',
				anchorOrigin: {
					horizontal: 'center',
					vertical: 'top',
				},
			});
		},
	});

	const handleOnSubmit = async (data: Record<string, string>) => {
		if (!('pseudo' in data))
			return ;

		const { pseudo } = data;

		if (avatarPreview) {
			try {
				const r = await fetch(avatarPreview);
				const b = await r.blob();

				patchProfileMutation.mutate({
					pseudo,
					avatar: new File([ b ], 'avatar.png', {
						type: 'image/png',
					}),
				});

				return ;
			} catch {
				/* should never get there */
			}
		}

		patchProfileMutation.mutate({
			pseudo,
		});
	};

	return (
		<Stack direction="row" justifyContent="center">
			<div className="auth-container register-form" style={{height: 'auto'}}>
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

					<ChangeAvatar onCrop={avatarPreview => setAvatarPreview(avatarPreview)} />

					<MainButton buttonName="Register" loading={patchProfileMutation.isLoading} />
				</Form>
			</div>
		</Stack>
	);
};

export default withAuthGuard(IntraRegisterForm);
