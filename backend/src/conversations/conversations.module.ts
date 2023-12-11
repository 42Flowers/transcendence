import { ConversationsService } from './conversations.service';
import { Module } from '@nestjs/common';

@Module({
	providers: [ConversationsService],
	exports: [ConversationsService],
})
export class ConversationsModule {}
