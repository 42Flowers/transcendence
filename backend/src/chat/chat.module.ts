import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { PrismaClient } from '@prisma/client';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaClient],
})
export class ChatModule {}
