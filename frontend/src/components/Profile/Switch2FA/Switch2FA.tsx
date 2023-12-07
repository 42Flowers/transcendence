import CloseIcon from '@mui/icons-material/Close';
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, TextField, Typography, styled } from "@mui/material";
import React from "react";
import QRCode from 'react-qr-code';
import { useMutation, useQuery } from 'react-query';
import { fetchMfaStatus, generateSecretKey, updateMfaState } from '../../../api';
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
            queryClient.setQueryData<{ status: boolean; }>('mfa_status', {
                status: state,
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

type ActivateMfaDialogProps = {
    onClose: () => void;
    mfaStatus: boolean;
    otpUrl?: string;
}

const ActivateMfaDialog: React.FC<ActivateMfaDialogProps> = ({ onClose, otpUrl, mfaStatus, }) => {
    const activateMutation = useMfaPatchState(onClose);
    const [ code, setCode ] = React.useState<string>('');
    
    const handleEnable = React.useCallback(() => {
        activateMutation.mutate({
            state: !mfaStatus,
            code,
        });
    }, [ code ]);

    return (
        <MfaDialog
            dialogTitle="Activate Two-Factor Authentication"
            buttonText={mfaStatus ? 'Disable' : 'Enable'}
            onButtonClick={handleEnable}
            buttonLoading={activateMutation.isLoading}
            onClose={onClose}
            open={true}>

            {otpUrl && (
                <div>
                    <QRCode
                        size={256}
                        viewBox="0 0 256 256"
                        value={otpUrl} />
                </div>
            )}

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
    const mfaStatusQuery = useQuery('mfa_status', fetchMfaStatus);
    const isMfaEnabled = mfaStatusQuery.data?.status === true;

    const [isOpen, setOpen] = React.useState(false);
    
    const genSecretKey = useMutation({
        mutationFn: generateSecretKey,
        onSuccess() {
            setOpen(true);
        }
    });

    const handleOpen = React.useCallback(() => {
        if (!isMfaEnabled) {
            genSecretKey.mutate();
        } else {
            setOpen(true);
        }
    }, [ isMfaEnabled ]);

    const handleClose = React.useCallback(() => {
        genSecretKey.reset();
        setOpen(false);
    }, []);

    const isButtonLoading = genSecretKey.isLoading || mfaStatusQuery.isLoading;
    const isButtonDisabled = isButtonLoading;

    return (
        <React.Fragment>
            {
                isOpen && (
                    <ActivateMfaDialog
                        mfaStatus={isMfaEnabled}
                        onClose={handleClose}
                        otpUrl={genSecretKey.data?.url}
                    />
                )
            }

            <Button
                variant="contained"
                color="info"
                disabled={isButtonDisabled}
                onClick={handleOpen}>
                
                {
                    isButtonLoading && (
                        <React.Fragment>
                            <CircularProgress size={12} color="warning" />
                            &nbsp;
                        </React.Fragment>
                    )
                }

                {mfaStatusQuery.data?.status === true && 'Disable Two-Factor Authentication'}
                {mfaStatusQuery.data?.status === false && 'Enable Two-Factor Authentication'}
            </Button>
        </React.Fragment>
    );
};

export default Switch2FA;