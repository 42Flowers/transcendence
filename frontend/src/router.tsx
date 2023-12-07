import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Auth } from './components/Auth/Auth';
import Chat from './components/Chat/Chat';
import FriendList from './components/FriendList/FriendList';
import RegisterForm from './components/RegisterForm/RegisterForm';
import GameWrapper from './components/Game/GameWrapper';
import PlayPage from './pages/PlayPage';
import Profile from './components/Profile/Profile';
import IntraRegisterForm from './components/IntraRegisterForm/IntraRegisterForm';
import ProfilePublic from './components/Profile/ProfilePublic';

export const router = createBrowserRouter([
    {
        path: '/auth/login',
        element: <Auth />,
    },
    {
        path: '/auth/intra-register',
        element: <IntraRegisterForm />
    },
    {
        path: '/auth/register',
        element: <RegisterForm />
    },
    {
        path: '/auth/callback',
        element: <Auth isCallbackUrl />,
    },
    {
        element: <AppLayout />,
        children: [
            {
                path: '/profile',
                element: <Profile />,
            },
            {
                path: '/profile/:userId',
                element: <ProfilePublic />
            },
            {
                path: '/friends',
                element: <FriendList />,
            },
            {
                path: '/game-normal',
                element: <GameWrapper width={800} height={600} specialMode={false} />,
            },
            {
                path: '/game-special',
                element: <GameWrapper width={800} height={600} specialMode={true} />,
            },
            {
                path: '/chat',
                element: <Chat />
            },
            {
                path: '/',
                element: <PlayPage />
            },
        ],
    },
]);
