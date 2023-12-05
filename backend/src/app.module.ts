import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FriendsModule } from './friends/friends.module';
import { ProfileModule } from './profile/profile.module';
import { SocketModule } from './socket/socket.module';
import { PrismaModule } from './prisma/prisma.module';
import { TestModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    {
      ...JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
          secret: config.getOrThrow<string>('JWT_SECRET'),
          global: true,
          signOptions: {

          },
      }),
      inject: [ ConfigService ],
    }),
    global: true,
  },
    AuthModule,
    GameModule,
    SocketModule,
  	ChatModule,
    ProfileModule,
    ProfilePublicModule,
    FriendsModule,
    TestModule,
    PrismaModule,
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
