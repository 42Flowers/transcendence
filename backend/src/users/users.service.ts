import { BadRequestException, Injectable } from "@nestjs/common";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { PrismaService } from "src/prisma/prisma.service";

export type PartialUserProfile = {
    pseudo?: string;
    email?: string;
}

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService) {}

    async retrieveUserProfile(userId: number) {
        try {
            const userProfile = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    id: userId,
                },
                select: {
                    email: true,
                    pseudo: true,
                    id: true,
                    avatar: true,
                }
            });

            return userProfile;
        } catch {
            ;
        }
        return null; /* Either not found, forbidden or just database related error */
    }

    async patchUserProfile(userId: number, profile: PartialUserProfile) {
        try {
            const userProfile = await this.prismaService.user.update({
                where: {
                    id: userId,
                },
                data: profile,
                select: {
                    email: true,
                    pseudo: true,
                    id: true,
                    avatar: true,
                },
            });

            return userProfile;
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
                console.log(e);
                if (e.code === 'P2002') {
                    /* Unique constraint violation */
                    if (e.meta?.target?.[0] === 'pseudo') {
                        throw new BadRequestException('Username is taken');
                    } else if (e.meta?.target?.[0] === 'email') {
                        throw new BadRequestException('Email is already in use');
                    }
                }
            }
        }
        return null;
    }
}