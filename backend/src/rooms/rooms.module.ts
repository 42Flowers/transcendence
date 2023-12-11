import { Module } from '@nestjs/common';
import { MessagesModule } from 'src/messages/messages.module';
import { SocketModule } from 'src/socket/socket.module';
import { RoomService } from './rooms.service';

@Module({
	exports: [RoomService],
	imports: [MessagesModule, SocketModule],
	providers: [RoomService],
})
export class RoomsModule {}