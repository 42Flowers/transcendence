import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  providers: [MessagesService],
  imports: [PrismaModule],
  exports: [MessagesService]
})
export class MessagesModule {}
