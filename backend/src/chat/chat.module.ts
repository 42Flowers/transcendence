import { Module } from '@nestjs/common';
import { ChatService } from './DBchat.service';
import { RoomsModule } from '../rooms/rooms.module';
import { UsersModule } from 'src/users_chat/users.module';
import { MessagesModule } from 'src/messages/messages.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ConversationsModule } from 'src/conversations/conversations.module';
import { SocketModule } from 'src/socket/socket.module';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { ChatController } from './chat.controller';

@Module({
	providers: [ChatService],
	imports: [
		RoomsModule, 
		MessagesModule, 
		UsersModule, 
		PrismaModule, 
		ConversationsModule, 
		SocketModule,
		EventEmitterModule.forRoot()
	],
	controllers: [ChatController],
	exports: [ChatService]
})
export class ChatModule {}
