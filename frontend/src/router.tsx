import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { LoginPage } from './pages/LoginPage';
import Profile from './components/Profile/Profile';
import Game from './components/Game/Game';
import FriendList from './components/FriendList/FriendList';
import Chat from './components/Chat/Chat';
import HomePage from './pages/HomePage';
import PlayPage from './pages/PlayPage';
import RegisterForm from './components/RegisterForm/RegisterForm';

export const router = createBrowserRouter([
    {
        path: '/auth/login',
        element: <LoginPage />,
    },
    {
        path: '/auth/callback',
        element: <AuthCallbackPage />,
    },
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                path: '/friends',
                element: <FriendList />,
            },
            {
                path: '/game-normal',
                element: <Game className="gameCanvas" width={800} height={600} specialMode={false} />,
            },
            {
                path: '/game-special',
                element: <Game className="gameCanvas" width={800} height={600} specialMode={true} />,
            },
            {
                path: '/chat',
                element: <Chat />
            },
            {
                path: '/pong',
                element: <PlayPage />
            },
        ],
    },
]);
