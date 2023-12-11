import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'node:path';
import { AchievementsModule } from './achievements/achievements.module';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { FriendsModule } from './friends/friends.module';
import { GameModule } from './game/game.module';
import { GlobalJwtModule } from './jwt/global-jwt.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProfileModule } from './profile/profile.module';
import { ProfilePublicModule } from './profilePublic/profilePublic.module';
import { SocketModule } from './socket/socket.module';
import { TestModule } from './users/users.module';
import { StatusModule } from './status/status.module';

@Module({
  imports: [
    PrismaModule,
    EventEmitterModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
        rootPath: path.join(process.cwd(), 'uploads'),
        serveRoot: '/static/',
    }),
    GlobalJwtModule,
    AuthModule,
    GameModule,
    SocketModule,
  	ChatModule,
    ProfileModule,
    ProfilePublicModule,
    FriendsModule,
    TestModule,
    AchievementsModule,
    StatusModule,
  ],
})
export class AppModule {}
