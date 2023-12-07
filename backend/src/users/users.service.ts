import { BadRequestException, Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { UsernameUpdateEvent } from "src/events/username-update.event";
import { PrismaService } from "src/prisma/prisma.service";

export type PartialUserProfile = {
    pseudo?: string;
    email?: string;
}

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService,
                private readonly eventEmitter: EventEmitter2) {}

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
            const currentProfile = await this.prismaService.user.findUniqueOrThrow({
                where: {
                    id: userId,
                },
            });

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

            if (currentProfile.pseudo !== userProfile.pseudo) {
                this.eventEmitter.emit('username.update', new UsernameUpdateEvent(
                    userId,
                    currentProfile.pseudo,
                    userProfile.pseudo,
                ));
            }

            return userProfile;
        } catch (e) {
            if (e instanceof PrismaClientKnownRequestError) {
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