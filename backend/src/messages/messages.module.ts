import { PrismaModule } from 'src/prisma/prisma.module';
import { MessagesService } from './messages.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [MessagesService],
  imports: [PrismaModule],
  exports: [MessagesService]
})
export class MessagesModule {}
