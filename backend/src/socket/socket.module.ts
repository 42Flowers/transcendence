import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { Module } from '@nestjs/common';
import { ChatModule } from 'src/chat/chat.module';

@Module({
	providers: [SocketService, SocketGateway],
	imports: [PrismaModule],
	exports: [SocketService, SocketGateway]
  
})

export class SocketModule {}
