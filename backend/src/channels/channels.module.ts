import { Module } from '@nestjs/common';
import { ChatController } from 'src/chat/chat.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChannelsController } from './channels.controller';
import { ChannelsService } from './channels.service';

@Module({
    controllers: [ ChannelsController ],
    imports: [ PrismaModule ],
    providers: [ ChannelsService ],
})
export class ChannelsModule {}
