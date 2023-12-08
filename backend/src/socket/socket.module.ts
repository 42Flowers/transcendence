import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Module } from '@nestjs/common';
import { EventDispatcherService } from './event-dispatcher.service';

@Module({
	providers: [ SocketGateway, SocketService, EventDispatcherService ],
	imports: [ PrismaModule ],
	exports: [ SocketService, SocketGateway ]
})
export class SocketModule {}
