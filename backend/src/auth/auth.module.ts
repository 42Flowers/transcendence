/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoModule } from 'src/ft/ft.module';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TicketService } from './ticket.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
    controllers: [
        AuthController,
    ],
    providers: [
        AuthService,
        PrismaService,
        TicketService,
    ],
    imports: [
        MailModule,
        FortyTwoModule,
    ]
})
export class AuthModule {}
