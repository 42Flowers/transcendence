/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoModule } from 'src/ft/ft.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    controllers: [
        AuthController,
    ],
    providers: [
        AuthService,
        PrismaService,
    ],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        FortyTwoModule,
        JwtModule.registerAsync({
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                global: true,
                signOptions: {

                },
            }),
            inject: [ ConfigService ],
        }),
    ]
})
export class AuthModule {}
