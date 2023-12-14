import { Outlet } from "react-router-dom";
import SocketContextComponent from "./Socket/Context/Component";
import { withAuthGuard } from "../hocs/AuthGuard";
import Navigation from "./Navigation/Navigation";
import { TrophyManager } from "./Profile/TrophyManager";
import { StatusManager } from "../StatusManager";
import { ChatProvider } from "../contexts/ChatContext";
import { AvatarProvider } from "../contexts/AvatarContext";
import { PerfectProvider } from "../contexts/PerfectContext";

export const AppLayout: React.FC = withAuthGuard(() => (
    <ChatProvider>
      <AvatarProvider>
        <PerfectProvider>
            <SocketContextComponent>
                <StatusManager />
                <TrophyManager />
                <Navigation />
                <Outlet />
            </SocketContextComponent>
        </PerfectProvider>
    </AvatarProvider>
    </ChatProvider>
));
