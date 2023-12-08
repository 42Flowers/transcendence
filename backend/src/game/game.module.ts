import { Module } from "@nestjs/common";
import { GameService } from './game.service';
import { PrismaModule } from "src/prisma/prisma.module";
import { SocketModule } from "src/socket/socket.module";
import { MatchmakingService } from "./matchmaking.service";
import { GameHistoryService } from "./game-history.service";
import { InvitationService } from "./invitation.service";

@Module({
  imports: [ PrismaModule, SocketModule ],
  providers: [ GameService, MatchmakingService, GameHistoryService, InvitationService ],
  exports: [ GameService ],
})
export class GameModule {}
