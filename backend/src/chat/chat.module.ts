/* eslint-disable prettier/prettier */
import { ConversationsModule } from 'src/conversations/conversations.module';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { MessagesModule } from 'src/messages/messages.module';
import { UsersModule } from 'src/users_chat/users_chat.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';
import { RoomsModule } from '../rooms/rooms.module';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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
		EventEmitterModule.forRoot(),
		ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/static/',
        }),
	],
	controllers: [ChatController],
	exports: [ChatService]
})
export class ChatModule {}
