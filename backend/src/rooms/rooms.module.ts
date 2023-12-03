import { Module } from '@nestjs/common';
import { RoomController } from './rooms.controller';
import { RoomService } from './DBrooms.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesModule } from 'src/messages/messages.module';
import { SocketModule } from 'src/socket/socket.module';

@Module({
	exports: [RoomService],
	imports: [PrismaModule, MessagesModule, SocketModule],
	providers: [RoomService],
	controllers: [RoomController]
})
export class RoomsModule {}