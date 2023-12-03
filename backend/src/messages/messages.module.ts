import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UsersService } from '../users_chat/DBusers.service';
import { RoomController } from '../rooms/rooms.controller';
import { MessagesService } from './messages.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [MessagesService],
  imports: [PrismaModule],
  exports: [MessagesService]
})
export class MessagesModule {}
