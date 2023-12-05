import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConversationsService } from './conversations.service';

@Module({
	providers: [ConversationsService],
	imports: [PrismaModule],
	exports: [ConversationsService],
})
export class ConversationsModule {}
