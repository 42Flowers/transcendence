import { PrismaModule } from 'src/prisma/prisma.module';
import { SocketModule } from 'src/socket/socket.module';
import { UserController } from './users.constroller';
import { UsersService } from './DBusers.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [UsersService],
  controllers: [UserController],
  exports: [UsersService],
  imports: [PrismaModule, SocketModule]
})
export class UsersModule {}