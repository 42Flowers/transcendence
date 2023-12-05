import { MessagesModule } from 'src/messages/messages.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';
import { RoomController } from './rooms.controller';
import { RoomService } from './DBrooms.service';
import { Module } from '@nestjs/common';

@Module({
	exports: [RoomService],
	imports: [PrismaModule, MessagesModule, SocketModule],
	providers: [RoomService],
	controllers: [RoomController]
})
export class RoomsModule {}