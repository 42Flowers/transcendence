import { Module } from '@nestjs/common';
import { EventDispatcherService } from './event-dispatcher.service';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
	providers: [ SocketGateway, SocketService, EventDispatcherService, PrismaService ],
	exports: [ SocketService, SocketGateway ],
})
export class SocketModule {}
