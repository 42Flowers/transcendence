import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Box } from "@mui/material"

interface Props {
    // user: {
    //     avatar: string;
    //     lastName: string;
    //     color: string;
    //   };
    status: string;
}

const AvatarOthers: React.FC<Props> = ({ status }) => {
    interface StatusResult {
        statusColor: string;
        statusImage: JSX.Element | null;
    }

    const theme = useTheme();

    const statusInfo = (): StatusResult => {
        if (status === 'Online') {
            return { statusColor: '#33cc33', statusImage: null, };
        } else if (status === 'Offline') {
            return { statusColor: '#cc0000', statusImage: null, };
        } else if (status === 'Playing') {
            return { statusColor: '#ff8000', statusImage: null, };
        } else if (status === 'Add') {
            return { statusColor: '#fff', statusImage: <PersonAddIcon style={{ height: '10px', width: '10px' }}/>, };
        }
        else {
            return { statusColor: '#0000ff', statusImage: null, };
        }
    }

    const StyledBadge = styled(Badge)(() => {

        const { statusColor } = statusInfo();

        return {
            '& .MuiBadge-badge': {
                backgroundColor: statusColor,
                color: 'black',
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                position: 'relative',
                zIndex: 0,
                top: '26px',
                right: '14px',
                },
                '@keyframes ripple': {
                '0%': {
                    transform: 'scale(0.4)',
                    opacity: 1,
                },
                '100%': {
                    transform: 'scale(0.9)',
                    opacity: 0,
                },
            },
        };
    });

    const { statusImage } = statusInfo();
      
    return (
        <>
            <StyledBadge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
            >
                <Avatar alt="avatar" src="" />
                <Box position="absolute" bottom={-4} right={9.5} sx={{zIndex: 1,}}>
                    {statusImage}
                </Box>
            </StyledBadge>
        </>
        );
};

export default AvatarOthers;