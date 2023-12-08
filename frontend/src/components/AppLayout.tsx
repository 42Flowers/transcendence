import { Outlet } from "react-router-dom";
import SocketContextComponent from "./Socket/Context/Component";
import { withAuthGuard } from "../hocs/AuthGuard";
import Navigation from "./Navigation/Navigation";
import { TrophyManager } from "./Profile/TrophyManager";

export const AppLayout: React.FC = withAuthGuard(() => (
    <SocketContextComponent>
        <TrophyManager />
        <Navigation isSignedIn={true} />
        <Outlet />
    </SocketContextComponent>
));
