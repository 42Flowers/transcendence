/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import * as speakeasy from 'speakeasy';
import { FortyTwoService } from 'src/ft/ft.service';
import { MailService } from 'src/mail/mail.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { TicketPayload, TicketService } from './ticket.service';

type Ticket = {
    ticket: string;
    mfa: string[];
};

type Token = {
    token: string;
    type: string;
};

const fortyTwoUserWithUser = Prisma.validator<Prisma.FortyTwoUserDefaultArgs>()({
    include: {
        user: true,
    },
});

const user = Prisma.validator<Prisma.UserDefaultArgs>()({});
type User = Prisma.UserGetPayload<typeof user>;

type FortyTwoUserWithUser = Prisma.FortyTwoUserGetPayload<typeof fortyTwoUserWithUser>;

@Injectable()
export class AuthService {
    constructor(
        private ft: FortyTwoService,
        private jwtService: JwtService,
        private prismaService: PrismaService,
        private ticketService: TicketService,
        private readonly mailService: MailService) {}
    
    async authorizeCodeFortyTwo(code: string): Promise<object> {
        /* First we exchange the code for an access token and a refresh token */
        const credentials = await this.ft.authorizeWithCode(code);

        /**
         * Then we retrieve the token information containing the resource owner id (the 42 user id)
         * that we use to uniquely identify a user within the database.
         */
        const tokenInfo = await this.ft.fetchTokenInfo(credentials);
        /**
         * Now we fetch or create the user record in the database
         */
        const ftUser: FortyTwoUserWithUser = await this.prismaService.fortyTwoUser.upsert({
            create: {
                id: tokenInfo.resource_owner_id,
                accessToken: credentials.access_token,
                user: {
                    create: {
                        pseudo: 'nopseudo',
                        email: 'noemail@example.com',
                    }
                }
            },
            where: {
                id: tokenInfo.resource_owner_id,
            },
            update: {
                accessToken: credentials.access_token,
            },
            include: {
                user: true,
            },
        });

        return await this.loginUser(ftUser.user);
    }

    private async loginUser(user: User): Promise<Ticket | Token> {
        const methods = [];

        if (user.totpEnabled)
            methods.push('otp');

        if (methods.length > 0) {
            return {
                ticket: await this.ticketService.generateTicket(user.id, methods as any),
                mfa: methods,
            };
        }

        return {
            token: await this.jwtService.signAsync({

            }, { subject: `${user.id}` }),
            type: 'bearer',
        };
    }

    async loginWithPassword(email: string, password: string): Promise<Ticket | Token> {
        const user = await this.prismaService.user.findUniqueOrThrow({
            where: {
                email,
            },
        });

        if (!await bcrypt.compare(password, user.password)) {
            throw new UnauthorizedException('Invalid email or password');
        }

        return await this.loginUser(user);
    }

    private async generateTokenFromTicket(ticket: TicketPayload): Promise<Token> {
        /** This function will throw if the ticket is not in the database,
          * thus preventing a race condition where two tokens can be generated for the same ticket.
          */
        await this.prismaService.ticket.delete({
            where: {
                id: ticket.ticketId,
            },
        });

        return {
            type: 'bearer',
            token: await this.jwtService.signAsync({

            }, {
                subject: `${ticket.userId}`,
            }),
        };
    }

    async verifyOtpCode(ticket: TicketPayload, code: string): Promise<Token> {
        const user = await this.prismaService.user.findUniqueOrThrow({
            where: {
                id: ticket.userId,
                totpEnabled: true,
            },
        });

        if (!speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token: code,
        })) {
            throw new UnauthorizedException();
        }

        return await this.generateTokenFromTicket(ticket);
    }
}
