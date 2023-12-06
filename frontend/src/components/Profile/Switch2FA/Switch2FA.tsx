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

const MfaUpdateDialog: React.FC = ({ onClose, open, isLoading, secretKeyUrl }) => {
    const { enqueueSnackbar } = useSnackbar();
    
    const activateMutation = useMutation({
        mutationFn: ({ state, code }: { state: boolean; code: string; }) => updateMfaState(state, code),
        onSuccess() {
            enqueueSnackbar({
                variant: 'success',
                anchorOrigin: {
                    horizontal: 'center',
                    vertical: 'top',
                },
                message: `MFA successfuly enabled`,
            });
            onClose();
        },
        onError(err) {
            enqueueSnackbar({
                variant: 'error',
                anchorOrigin: {
                    horizontal: 'center',
                    vertical: 'top',
                },
                message: `Could not enable MFA: ${err}`,
            });
        }
    });

    const [ code, setCode ] = React.useState<string>('');
    
    const handleEnable = React.useCallback(() => {
        activateMutation.mutate({
            state: true,
            code,
        });
    }, [ code ]);

    return (
        <BootstrapDialog
            onClose={onClose}
            aria-labelledby="customized-dialog-title"
            open={open}
        >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
                Activate Two-Factor Authentication
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
                {isLoading && "Loading..."}
                {!!secretKeyUrl &&
                <div>

                <QRCode
                    size={256}
                    viewBox="0 0 256 256"
                    value={secretKeyUrl} />
                    </div>}
                <TextField label="OTP code" variant="outlined" value={code} onChange={code => setCode(code.currentTarget.value)} />
                <Typography gutterBottom>
                    Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus
                    magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec
                    ullamcorper nulla non metus auctor fringilla.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleEnable} disabled={activateMutation.isLoading}>
                    {activateMutation.isLoading ? (
                        <CircularProgress size={12} />
                    ) : 'Enable'}
                </Button>
            </DialogActions>
        </BootstrapDialog>
    );
}

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
            <MfaUpdateDialog
                open={isOpen}
                onClose={handleClose}
                isLoading={genSecretKey.isLoading}
                secretKeyUrl={genSecretKey.data?.url}
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