import { Module } from "@nestjs/common";
import { SocketModule } from "src/socket/socket.module";
import { GameHistoryService } from "./game-history.service";
import { GameService } from './game.service';
import { InvitationService } from "./invitation.service";
import { MatchmakingService } from "./matchmaking.service";

@Module({
  imports: [ SocketModule ],
  providers: [ GameService, MatchmakingService, GameHistoryService, InvitationService ],
  exports: [ GameService ],
})
export class GameModule {}
