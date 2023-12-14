import { useSnackbar } from 'notistack';
import React from 'react';
import AvatarEdit from 'react-avatar-edit';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

type ChangeAvatarProps = {
    onCrop: (avatarUri: string) => void;
    onClose: () => void;
};

const ChangeAvatarFallback: React.FC<FallbackProps> = ({ resetErrorBoundary }) => {
    const { enqueueSnackbar } = useSnackbar();

    React.useEffect(() => {
        enqueueSnackbar({
            variant: 'error',
            message: 'Uh oh... it seems like you\'ve uploaded an invalid file :(',
            anchorOrigin: {
                horizontal: 'center',
                vertical: 'top',
            },
            preventDuplicate: true,
        });

        resetErrorBoundary();
    }, [resetErrorBoundary]);

    return null;
};

export const ChangeAvatar: React.FC<ChangeAvatarProps> = ({ onCrop, onClose }) => {
    const { enqueueSnackbar } = useSnackbar();

    const handleBeforeFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            if (e.target.files[0].size > 1048576) {
                enqueueSnackbar({
                    variant: 'warning',
                    message: 'The maximum upload size is limited to 1 Mb',
                    anchorOrigin: {
                        horizontal: 'center',
                        vertical: 'top',
                    },
                });
                e.target.value = '';
            };
        }
    };

    return (
        <ErrorBoundary FallbackComponent={ChangeAvatarFallback}>
            <AvatarEdit
                width={300}
                height={300}
                exportSize={512}
                exportMimeType="image/png"
                onBeforeFileLoad={handleBeforeFileLoad}
                onCrop={onCrop}
                onClose={onClose}
            />
        </ErrorBoundary>
    );
};
