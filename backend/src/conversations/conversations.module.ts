import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersService } from '../users_chat/DBusers.service';
import { ConversationsService } from './conversations.service';

@Module({
	providers: [ConversationsService],
	imports: [PrismaModule],
	exports: [ConversationsService],
})
export class ConversationsModule {}
