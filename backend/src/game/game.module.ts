import { Module } from "@nestjs/common";
import { GameService } from './game.service';
import { PrismaModule } from "src/prisma/prisma.module";
import { SocketModule } from "src/socket/socket.module";

@Module({
  imports: [PrismaModule, SocketModule],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
