import React, { InputHTMLAttributes } from 'react';
import './Input.scss';
import { useFormContext } from './Form';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon: React.ReactNode;
};

function getErrorMessage(key: string) {
    const { errors } = useFormContext();

    if (typeof errors === 'object' && key in errors) {
        return errors[key];
    }
    return '';
}

const Input: React.FC<InputProps> = ({ label, icon, name, ...inputProps }) => {
    const errorMessage = (typeof name === 'string') ? getErrorMessage(name) : '';

    return (
        <div className="input-box">
            <input
                {...inputProps}
                name={name}
                placeholder=""
                />
            <label>{label}</label>
            <span className="icon">{icon}</span>
            <span className="error-message">
                {errorMessage}
            </span>
        </div>
    );
}

export { Input };
