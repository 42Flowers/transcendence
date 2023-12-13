import React from 'react';
import { TextField } from '@mui/material';
import { Button } from "@mui/material";

type PseudoButtonProps = {
    currentPseudo: string;
    onChangePseudo: (newPseudo: string) => void;
};

const PseudoButton: React.FC<PseudoButtonProps> = ({ onChangePseudo, currentPseudo }) => {
    const handleChangePseudo = React.useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
    
        onChangePseudo(formData.get('username')!.toString());
    }, [ onChangePseudo ]);

    return (
        <form onSubmit={handleChangePseudo}>
            <div>
                <TextField
                    name="username"
                    label={currentPseudo}
                    autoComplete="off"
                    InputLabelProps={{
                        style: { 
                            color: '#7638C7', 
                            fontSize: '1em', 
                        }
                    }}
                    variant="outlined"
                    placeholder={currentPseudo}
                    sx={{
                        color: '#9747FF',
                        marginTop: '3vh',
                        width: '35vw',
                        minWidth: '200px',
                        maxWidth: '300px',
                        '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                            borderRadius: '20px',
                            border: '3px solid #9747FF',
                            },
                            '&:hover fieldset': {
                                border: '4px solid #7638C7'
                            },
                            '&.Mui-focused fieldset': {
                                border: '4px solid #7638C7'
                            },
                        },
                    }}
                />
            </div>
            <div>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{ 
                        fontSize: '1em', 
                        marginTop: '1.5vh',
                        fontWeight: '900',
                    }}
                >
                    CHANGE PSEUDO
                </Button>
            </div>
        </form>
    )
};

export default PseudoButton;