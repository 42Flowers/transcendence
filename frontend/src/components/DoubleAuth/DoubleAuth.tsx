import React, { PropsWithChildren, useRef } from 'react';
import { Stack, styled } from '@mui/material';
import { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import { BsQrCode } from "react-icons/bs";
import { FaCommentSms } from "react-icons/fa6";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { IoMailOutline } from "react-icons/io5";
import { SiLetsencrypt } from "react-icons/si";
import { useMutation } from 'react-query';
import { AuthorizationTokenPayload, submitOtp } from '../../api';
import { AuthReducerProps, setAuthToken, setResendTime } from '../Auth/auth-reducer';
import MainButton from '../MainButton/MainButton';
import './DoubleAuth.scss';
import { useAuthContext } from '../../contexts/AuthContext';
import { setAuthenticationToken } from '../../storage';

export enum AuthenticationMode {
	Email = 'email',
	Sms = 'sms',
	QrCode = 'qrcode',
	AuthCode = 'otp',
};

type AuthenticationMethodDescriptorTable = {
	[k in typeof AuthenticationMode[keyof typeof AuthenticationMode]]: {
		icon: React.ReactNode,
		name: string;
		title: string;
		resendCode?: () => Promise<number>;
		submitCode: (payload: { ticket: string; code: string; }) => Promise<AuthorizationTokenPayload>;
	};
};

const methodsList: AuthenticationMethodDescriptorTable = {
	[AuthenticationMode.AuthCode]: {
		icon: <SiLetsencrypt className="icon" />,
		name: 'Code',
		title: 'Open your app and enter the Code',
		async submitCode({ ticket, code }) {
			return submitOtp(ticket, code);
		}
	},
	[AuthenticationMode.Sms]: {
		icon: <FaCommentSms className="icon" />,
		name: 'SMS',
		title: 'Enter the code you received by SMS',
		async submitCode(payload) {
			throw 'Not implemented';
		},
		async resendCode() {
			return Date.now() + 1000 * 10;
		},
	},
	[AuthenticationMode.QrCode]: {
		icon: <BsQrCode className="icon" />,
		name: 'QR Code',
		title: 'Open your app and enter the Code',
		async submitCode(payload) {
			throw 'Not implemented';
		},
	},
	[AuthenticationMode.Email]: {
		icon: <IoMailOutline className="icon" />,
		name: 'Email',
		title: 'Enter the code you received in your Email',
		async submitCode(payload) {
			throw 'Not implemented';
		},
		async resendCode() {
			return Date.now() + 1000 * 10;
		},
	},
};

export type AuthMethodPickerProps = {
	methods: string[];
	onMethodPicked: (method: string) => void;
};

export const AuthMethodPicker: React.FC<AuthMethodPickerProps> = ({ methods, onMethodPicked }) => {
	const methodsComponents = React.useMemo(() => {
		return Object.entries(methodsList).filter(([ key ]) => methods.includes(key)).map(([ key, { icon, name } ], index) => (
			<React.Fragment key={key}>
				{index > 0 && <div className="or">or</div>}
				<MainButton icon={icon} buttonName={name} onClick={() => onMethodPicked(key)} />
			</React.Fragment>
		));
	}, [ methods ]);

	return (
		<Stack direction="column">
			<h2>Two-Factor Authentication Required</h2>
			{methodsComponents}
		</Stack>
	);
}

export type AuthenticationPanelProps = AuthReducerProps & {
	authenticationMode: AuthenticationMode;
	onBack: () => void;
}

type ResendButtonProps = {
	onSendAgain: () => void;
	nextTryTime: number;
};

/**
 * Takes a unix-epoch time in the future in miliseconds and returns
 * the number of seconds from now to that time.
 * @param futureTime 
 */
function useCountdown(futureTime: number): number {
	const [ currentTime, setCurrentTime ] = React.useState<number>(() => Date.now());
	const isAhead = futureTime > currentTime;

	React.useEffect(() => {
		if (!isAhead)
			return ;
		const updateCurrentTime = () => setCurrentTime(() => Date.now());
		
		const tid = setInterval(updateCurrentTime, 1000);
		updateCurrentTime();

		return () => clearInterval(tid);
	}, [ isAhead ]);

	return Math.max(0, Math.floor((futureTime - currentTime) / 1000));
}

const ResendButton: React.FC<ResendButtonProps> = ({ onSendAgain, nextTryTime }) => {
	const cooldownTime = useCountdown(nextTryTime);

	const handleSendAgain = React.useCallback(() => {
		if (cooldownTime === 0) {
			onSendAgain();
		}
	}, [ onSendAgain, cooldownTime ]);

	return (
		<p className="resend-code">
			Didn't have time to receive code?
			<a href="#" onClick={handleSendAgain}>
				Send Again{cooldownTime > 0 ? ` (${cooldownTime}s)` : ''}
			</a>
		</p>
	);
}

export const AuthenticationPanel: React.FC<PropsWithChildren<AuthenticationPanelProps>> = ({ state, dispatch, authenticationMode, onBack }) => {
	const { title, submitCode, resendCode } = methodsList[authenticationMode];
	const canSendCode = typeof resendCode !== 'undefined';
	const [ code, setCode ] = React.useState<string>('');
	const [ submittedOnce, setSubmittedOnce ] = React.useState<boolean>(false);
	const { enqueueSnackbar } = useSnackbar();
	const { authenticate } = useAuthContext();

	const { ticket } = state;
	const currentMethodState = state.mfaState[authenticationMode];

	const sendAgain = React.useCallback(() => {
		dispatch(setResendTime(authenticationMode, Date.now() + 1000 * 10));
	}, []);

	const submitCodeMutation = useMutation(submitCode, {
		mutationKey: [ authenticationMode, 'submit code' ],
		onSuccess({ token }) {
			dispatch(setAuthToken(token));
		},
		onError(error: AxiosError) {
			enqueueSnackbar({
				message: 'Invalid authentication code',
				variant: 'error',
				anchorOrigin: {
					vertical: 'top',
					horizontal: 'center',
				},
			});
		},
	});

	const handleSubmit = React.useCallback((e?: React.FormEvent<HTMLFormElement>) => {
		setSubmittedOnce(true);

		submitCodeMutation.mutate({ code, ticket: ticket! });

		e?.preventDefault();
	}, [ setSubmittedOnce, code ]);

	React.useEffect(() => {
		if (!submittedOnce && code.length === 6) {
			handleSubmit();
		}
	}, [ code, submittedOnce, handleSubmit ]);

	return (
		<>
			<span className="icon-close" onClick={onBack}>
				<HiOutlineArrowCircleLeft />
			</span>
			<form action="#" onSubmit={handleSubmit}>
				<h2>{title}</h2>
				<CodeInput length={6} onChange={code => setCode(code)} />
				{
					canSendCode && (
						<ResendButton onSendAgain={sendAgain} nextTryTime={currentMethodState?.nextRetry ?? 0} />
					)
				}
				<div className="input-box">
					<MainButton as="button" type="submit" buttonName='Submit' loading={submitCodeMutation.isLoading} />
				</div>
			</form>
		</>
	);
}

type CodeInputProps = {
	length: number;
	onChange: (x: string) => void;
};

const DigitInput = styled('input')({
	'&': {
		width: '2em',
		height: '2em',
		caretColor: 'transparent',
	},
	'&:focus': {
		boxShadow: '0 0 0 4px rgba(191, 156, 232, 0.8)',
	},
});

const CodeInput: React.FC<CodeInputProps> = ({ length, onChange }) => {
	const frozenLength = React.useMemo(() => length, []);
	const [ inputs, setInputs ] = React.useState(() => new Array(frozenLength).fill(''));
	const inputRefs = useRef(inputs.map(() => React.createRef<HTMLInputElement>()));

	React.useEffect(() => {
		onChange(inputs.join(''));
	}, [ inputs ]);

	const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
		const { value } = e.target;
		const newInputs = [...inputs];
		let i;

		const transformedValue = value.trim().substring(0, frozenLength - index);

		for (i = 0; i < transformedValue.length; ++i) {
			if (!/^[0-9]+$/.test(transformedValue[i]))
				break ;

			newInputs[index + i] = transformedValue[i];
		}

		inputRefs.current[Math.min(frozenLength - 1, index + i)].current?.focus();

		if (i > 0) {
			setInputs(newInputs);
		}
	};

	const handleKeyDown = (index: number) => ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
		if (key === 'Backspace') {
			setInputs(inputs => {
				const newInputs = [...inputs];
				newInputs[index] = '';
				return newInputs;
			})
			if (index > 0) {
				inputRefs.current[index - 1].current?.focus();
			}
		} else if (key === 'ArrowLeft') {
			if (index > 0) {
				inputRefs.current[index - 1].current?.focus();
			}
		} else if (key === 'ArrowRight') {
			if (index + 1 < frozenLength) {
				inputRefs.current[index + 1].current?.focus();
			}
		}
	};

	return (
		<div className="mfa-code-input">
			{
				inputs.map((input, index) => (
					<DigitInput
						key={index}
						type="text"
						value={input}
						onChange={handleChange(index)}
						onKeyDown={handleKeyDown(index)}
						ref={inputRefs.current[index]}
					/>
				))
			}
		</div>
	);
}
