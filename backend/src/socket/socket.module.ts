import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Module } from '@nestjs/common';

@Module({
	providers: [ SocketGateway, SocketService, ],
	imports: [ PrismaModule ],
	exports: [ SocketService, SocketGateway ]
})
export class SocketModule {}
