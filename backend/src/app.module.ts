import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { SocketModule } from './socket/socket.module';
import { UsersModule } from './chat/users/users.module';
import { RoomsModule } from './chat/rooms/rooms.module';
import { TestModule } from './users/users.module';

@Module({
  imports: [ AuthModule, GameModule, SocketModule, UsersModule, RoomsModule, TestModule ],
  controllers: [],
  providers: [],
})
export class AppModule {}
