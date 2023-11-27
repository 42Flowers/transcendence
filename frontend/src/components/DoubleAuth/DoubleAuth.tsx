import React, { useCallback, useState, useRef } from 'react';
import './DoubleAuth.css';
import MainButton from '../MainButton/MainButton'
import { IoMailOutline } from "react-icons/io5";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { BsQrCode } from "react-icons/bs";
import { FaCommentSms } from "react-icons/fa6";
import { SiLetsencrypt } from "react-icons/si";

const NO_MODE = 0;
const EMAIL_MODE = 1;
const SMS_MODE = 2;
const QRCODE_MODE = 3;
const AUTHCODE_MODE = 4;
let msgh2: string = "Two-Factor Authentication Required";

const DoubleAuth: React.FC = () => {
	const [mode, setMode] = useState(NO_MODE);


	const handleClick = useCallback((newMode: number) => {
		switch (newMode){
			case EMAIL_MODE:
				msgh2 = "Enter the code you received in your Email";
				break;
			case SMS_MODE:
				msgh2 = "Enter the code you received by SMS";
				break;
			case EMAIL_MODE:
				msgh2 = "Scan the QR Code";
				break;
			case AUTHCODE_MODE:
				msgh2 = "Open your app and enter the Code";
				break;
		}
		setMode(newMode);
	}, []);



	const [inputs, setInputs] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef(inputs.map(() => React.createRef<HTMLInputElement>()));

	const handleChange = (index: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
		const newInputs = [...inputs];
		newInputs[index] = event.target.value;
		setInputs(newInputs);
	
		// if (event.target.value.length === 1 && !isNaN(Number(event.target.value)))
		// {
		// 	newInputs[index] = event.target.value;
		// 	setInputs(newInputs);
		// }

		if (event.target.value.length === 1 && index < inputRefs.current.length - 1) {
			inputRefs.current[index + 1].current?.focus();
		}
	};

	const handleKeyDown = (index: number) => (event: React.KeyboardEvent<HTMLInputElement>) => {
		const inputValue = event.currentTarget.value;
		if (event.key === 'Backspace' && index > 0 && (inputValue.trim() === '')) {
			inputRefs.current[index - 1].current?.focus();
		}
	};
	


    if(mode === NO_MODE)
	{
		return (
			<div className="DoubleAuth-wrapper">
				<div className="box-popup">
					<form action="#">
						<h2>{msgh2}</h2>
						<div className="input-box">
							<MainButton buttonName='Email' mode={EMAIL_MODE} onClick={handleClick} icon={<IoMailOutline className="icon"/>}/>
						</div>
							<p>or</p>
						<div className="input-box">
							<MainButton buttonName='SMS' mode={SMS_MODE} onClick={handleClick} icon={<FaCommentSms className="icon"/>}/>
						</div>
							<p>or</p>
						<div className="input-box">
							<MainButton buttonName='QR Code' mode={QRCODE_MODE} onClick={handleClick} icon={<BsQrCode className="icon"/>}/>
						</div>
						<p>or</p>
						<div className="input-box">
							<MainButton buttonName='Authentication Code' mode={AUTHCODE_MODE} onClick={handleClick} icon={<SiLetsencrypt className="icon"/>}/>
						</div>
					</form>
				</div>
			</div>
		);
	}
	else {
        return (
			<div className="DoubleAuth-wrapper">
				<div className="box-popup">
				<span className="icon-close"><HiOutlineArrowCircleLeft/></span>
					<form action="#">
						<h2 className='h2bis'>{msgh2}</h2>
						<div className="input-box">
							{inputs.map((input, index) => (
								<input
									key={index}
									type="number"
									value={input}
									onChange={handleChange(index)}
									onKeyDown={handleKeyDown(index)}
									maxLength={1}
									min={0}
									max={9}
									ref={inputRefs.current[index]}
								/>
							))}
						</div>
						<div className="remember-forgot">
							<p className='pbis'>Didn't have time to receive code? <a href="#">Click here</a> to send it again</p>
						</div>
						<div className="input-box">
							<MainButton buttonName='Submit'/>
						</div>
					</form>
				</div>
			</div>
        );
	}
};

export default DoubleAuth;