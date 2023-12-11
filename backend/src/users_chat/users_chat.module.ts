import { Module } from '@nestjs/common';
import { SocketModule } from 'src/socket/socket.module';
import { UsersService } from './users_chat.service';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [SocketModule]
})
export class UsersModule {}