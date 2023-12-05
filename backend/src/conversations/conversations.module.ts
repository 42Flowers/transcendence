import { ConversationsService } from './conversations.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { Module } from '@nestjs/common';

@Module({
	providers: [ConversationsService],
	imports: [PrismaModule],
	exports: [ConversationsService],
})
export class ConversationsModule {}
