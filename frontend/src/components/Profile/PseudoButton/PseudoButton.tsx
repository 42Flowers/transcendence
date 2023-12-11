import { useContext } from "react";
import { TextField } from "@mui/material";
import { PseudoContext } from "../../../contexts/PseudoContext";
import { PseudoContextType } from "../Profile";

type PseudoButtonProps = {
    handleChangePseudo: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
};

const PseudoButton: React.FC<PseudoButtonProps> = ({ handleChangePseudo }) => {
    const { pseudo, value, setValue } = useContext(PseudoContext) as PseudoContextType;

    return (
        <form onSubmit={handleChangePseudo}>
            <TextField 
                id="outlined-basic" 
                label="Change pseudo"
                InputLabelProps={{
                    style: { 
                        color: '#7638C7', 
                        fontSize: '1em', 
                    }
                }}
                variant="outlined"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder={`${pseudo ?? ''}`}
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
        </form>
    )
};

export default PseudoButton;