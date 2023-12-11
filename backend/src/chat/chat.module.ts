/* eslint-disable prettier/prettier */
import { ConversationsModule } from 'src/conversations/conversations.module';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users_chat/users_chat.module';
import { SocketModule } from 'src/socket/socket.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Module } from '@nestjs/common';

@Module({
	providers: [ ChatService ],
	imports: [
		RoomsModule, 
		MessagesModule, 
		UsersModule, 
		ConversationsModule, 
		SocketModule,
		MessagesModule,
	],
	controllers: [ ChatController ],
	exports: [ ChatService ]
})
export class ChatModule {}
