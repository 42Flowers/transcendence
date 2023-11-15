import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { Auth } from './components/Auth/Auth';
import Chat from './components/Chat/Chat';
import FriendList from './components/FriendList/FriendList';
import Game from './components/Game/Game';
import Profile from './components/Profile/Profile';
import PlayPage from './pages/PlayPage';

export const router = createBrowserRouter([
    {
        path: '/auth/login',
        element: <Auth />,
    },
    {
        path: '/auth/callback',
        element: <p>Non</p>,
        // element: <AuthCallbackPage />,
    },
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                path: '/profile/:userId',
                element: <Profile onRouteChange={() => void 0} />,
            },
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
