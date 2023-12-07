import { ConversationsModule } from 'src/conversations/conversations.module';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users_chat/users.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Module } from '@nestjs/common';

@Module({
	providers: [ChatService],
	imports: [
		RoomsModule, 
		MessagesModule, 
		UsersModule, 
		PrismaModule, 
		ConversationsModule, 
		SocketModule,
		MessagesModule,
		EventEmitterModule.forRoot()
	],
	controllers: [ChatController],
	exports: [ChatService]
})
export class ChatModule {}
