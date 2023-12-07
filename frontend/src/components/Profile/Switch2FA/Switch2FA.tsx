import CloseIcon from '@mui/icons-material/Close';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography, styled } from "@mui/material";
import React from "react";
import QRCode from 'react-qr-code';
import { useMutation } from 'react-query';
import { generateSecretKey, updateMfaState } from '../../../api';
import { useSnackbar } from 'notistack';
import { queryClient } from '../../../query-client';

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

type MfaUpdateDialogProps = {
    onClose: () => void;
    open: boolean;
    isLoading: boolean;
    secretKeyUrl?: string;
    mfaEnabled: boolean;
};

type MfaDialogProps = React.PropsWithChildren<{
    onClose: () => void;
    open: boolean;
    buttonLoading: boolean;
    buttonText: string;
    dialogTitle: string;
    onButtonClick: () => void;
}>;

const MfaDialog: React.FC<MfaDialogProps> = ({ onClose, open, buttonLoading, buttonText, dialogTitle, children, onButtonClick }) => (
    <BootstrapDialog
        onClose={onClose}
        aria-labelledby="customized-dialog-title"
        open={open}
    >
        <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
            {dialogTitle}
        </DialogTitle>
        <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
            }}
        >
            <CloseIcon />
        </IconButton>
        <DialogContent dividers>
            {children}
        </DialogContent>
        <DialogActions>
            <Button onClick={onButtonClick} disabled={buttonLoading}>
                {buttonLoading ? (
                    <CircularProgress size={12} />
                ) : buttonText}
            </Button>
        </DialogActions>
    </BootstrapDialog>
);

type ActivateMfaDialogProps = {
    onClose: () => void;
    open: boolean;
}

type MfaState = {
    state: boolean;
    code: string;
};

function useMfaPatchState(closeDialog: () => void) {
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
        mutationFn: ({ state, code }: MfaState) => updateMfaState(state, code),
        onSuccess(_data, { state }) {
            enqueueSnackbar({
                variant: 'success',
                anchorOrigin: {
                    horizontal: 'center',
                    vertical: 'top',
                },
                message: `MFA successfuly ${state ? 'enabled' : 'disabled'}`,
            });
            closeDialog();
        },
        onError(err, { state }) {
            enqueueSnackbar({
                variant: 'error',
                anchorOrigin: {
                    horizontal: 'center',
                    vertical: 'top',
                },
                message: `Could not ${state ? 'enable' : 'disable'} MFA: ${err}`,
            });
        }
    });
}

const ActivateMfaDialog: React.FC = ({ onClose, open, genKeyMutation }) => {
    const { enqueueSnackbar } = useSnackbar();

    const activateMutation = useMfaPatchState(onClose);

    const [ code, setCode ] = React.useState<string>('');
    
    const handleEnable = React.useCallback(() => {
        activateMutation.mutate({
            state: true,
            code,
        });
    }, [ code ]);

    return (
        <MfaDialog
            dialogTitle="Activate Two-Factor Authentication"
            buttonText="Enable"
            onButtonClick={handleEnable}
            onClose={onClose}
            open={open}>

            {genKeyMutation.isLoading && "Loading..."}
            {!!genKeyMutation.data &&
            <div>

            <QRCode
                size={256}
                viewBox="0 0 256 256"
                value={genKeyMutation.data.url} />
                </div>}
            <TextField label="OTP code" variant="outlined" value={code} onChange={code => setCode(code.currentTarget.value)} />
            <Typography gutterBottom>
                Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus
                magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec
                ullamcorper nulla non metus auctor fringilla.
            </Typography>
        </MfaDialog>
    );
};

const Switch2FA: React.FC = () => {
    /* TODO should be retrieved from the backend */
    const isMfaEnabled = false;

    const [isOpen, setOpen] = React.useState(false);
    
    const genSecretKey = useMutation({
        mutationFn: generateSecretKey,
    });

    const handleOpen = React.useCallback(() => {
        setOpen(true);

        if (!isMfaEnabled) {
            genSecretKey.mutate();
        }
    }, []);

    const handleClose = React.useCallback(() => {
        setOpen(false);
        genSecretKey.reset();
    }, []);

    return (
        <React.Fragment>
            <ActivateMfaDialog
                open={isOpen}
                onClose={handleClose}
                genKeyMutation={genSecretKey}
                />
            <Button
                variant="contained"
                color="info"
                onClick={handleOpen}>
                Enable Two-Factor Authentication
            </Button>
        </React.Fragment>
    );
};

export default Switch2FA;