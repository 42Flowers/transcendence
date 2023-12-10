import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';
import { UsersService } from './users_chat.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [UsersService],
  exports: [UsersService],
  imports: [PrismaModule, SocketModule]
})
export class UsersModule {}