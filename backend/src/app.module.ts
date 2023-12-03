import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { GameModule } from './game/game.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';
import { TestModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { FriendsModule } from './friends/friends.module';
import { ProfileModule } from './profile/profile.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    AuthModule,
    GameModule,
    SocketModule,
  	ChatModule,
    ProfileModule,
    FriendsModule,
    TestModule,
    PrismaModule,
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
  ],
  controllers: [],
  providers: [],
})

export class AppModule {}
