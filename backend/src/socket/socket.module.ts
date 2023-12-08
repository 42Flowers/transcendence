import { Module } from '@nestjs/common';
import { EventDispatcherService } from './event-dispatcher.service';
import { SocketController } from './socket.controller';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';

@Module({
	providers: [ SocketGateway, SocketService, EventDispatcherService ],
	controllers: [ SocketController ],
	exports: [ SocketService, SocketGateway ]
})
export class SocketModule {}
