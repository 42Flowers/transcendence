import React from 'react';

interface IFormContext {
    errors?: Record<string, string>;
}

type FormProps = React.PropsWithChildren<{
    validator?: FormValidator;
    errors?: {
        [k: string]: string;
    };
    onSubmit?: (data: any) => void;
}>;

const FormContext = React.createContext<IFormContext>({});

export type FormValidator = Record<string, (value: string, data: object) => void>;

const Form: React.FC<FormProps> = ({ children, validator, errors, onSubmit }) => {
    const [ formState, setFormState ] = React.useState<IFormContext>({});

    const handleSubmit = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        const formData = new FormData(e.currentTarget);
        const rawFormData: Record<string, string> = [...formData.entries()].reduce((obj, [ key, value ]) => ({ ...obj, [key]: value }), {});
        const errors: Record<string, string> = {};

        e.preventDefault();
        if (typeof validator !== 'undefined') {
            for (const key of Object.keys(rawFormData)) {
                if (key in validator) {
                    try {
                        validator[key](rawFormData[key], rawFormData);
                    } catch (e) {
                        errors[key] = (e as Error).message;
                    }
                }
            }

            setFormState(oldState => ({
                ...oldState,
                errors,
            }));
        }

        if (Object.keys(errors).length === 0) {
            if (onSubmit) {
                onSubmit(rawFormData);
            }
        }
    }, [ validator, onSubmit ]);

    return (
        <FormContext.Provider value={{ ...formState, errors: { ...(formState.errors ?? {}), ...(errors ?? {}) } }}>
            <form onSubmit={handleSubmit}>
                {children}
            </form>
        </FormContext.Provider>
    );
}

export const useFormContext = () => React.useContext(FormContext);

export { Form };