/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { FortyTwoService } from 'src/ft/ft.service';
import { PrismaService } from 'src/prisma/prisma.service';

const fortyTwoUserWithUser = Prisma.validator<Prisma.FortyTwoUserDefaultArgs>()({
    include: {
        user: true,
    },
});

type FortyTwoUserWithUser = Prisma.FortyTwoUserGetPayload<typeof fortyTwoUserWithUser>;

@Injectable()
export class AuthService {
    constructor(
        private ft: FortyTwoService,
        private jwtService: JwtService,
        private prismaService: PrismaService) {}

    async authorizeCodeFortyTwo(code: string): Promise<string> {
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

        return await this.jwtService.signAsync({
            
        }, { subject: `${ftUser.user.id}`, });
    }
}
