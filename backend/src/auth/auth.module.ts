/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FortyTwoModule } from 'src/ft/ft.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TicketService } from './ticket.service';

@Module({
    controllers: [
        AuthController,
    ],
    providers: [
        AuthService,
        TicketService,
    ],
    imports: [
        FortyTwoModule,
    ]
})
export class AuthModule {}
