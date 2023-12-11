import { Outlet } from "react-router-dom";
import SocketContextComponent from "./Socket/Context/Component";
import { withAuthGuard } from "../hocs/AuthGuard";
import Navigation from "./Navigation/Navigation";
import { TrophyManager } from "./Profile/TrophyManager";
import { StatusManager } from "../StatusManager";

export const AppLayout: React.FC = withAuthGuard(() => (
    <SocketContextComponent>
        <StatusManager />
        <TrophyManager />
        <Navigation />
        <Outlet />
    </SocketContextComponent>
));
