import { Module } from "@nestjs/common";
import { GameModule } from "src/game/game.module";
import { SocketModule } from "src/socket/socket.module";
import { StatusController } from "./status.controller";
import { StatusService } from "./status.service";

@Module({
    controllers: [ StatusController ],
    providers: [ StatusService ],
    imports: [ SocketModule, GameModule ]
})
export class StatusModule {}
