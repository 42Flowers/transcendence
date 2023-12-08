import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Module } from '@nestjs/common';
import { EventDispatcherService } from './event-dispatcher.service';
import { SocketController } from './socket.controller';

@Module({
	providers: [ SocketGateway, SocketService, EventDispatcherService ],
	imports: [ PrismaModule ],
	controllers: [ SocketController ],
	exports: [ SocketService, SocketGateway ]
})
export class SocketModule {}
