import { Module } from '@nestjs/common';
import { ChatController } from 'src/chat/chat.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';
import { SocketModule } from 'src/socket/socket.module';

@Module({
    controllers: [ ChannelsController ],
    imports: [ PrismaModule, SocketModule ],
    providers: [ ChannelsService ],
})
export class ChannelsModule {}
