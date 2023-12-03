import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';
import { UsersService } from './DBusers.service';
import { UserController } from './users.constroller';

@Module({
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
  imports: [PrismaModule, SocketModule]
})
export class UsersModule {}