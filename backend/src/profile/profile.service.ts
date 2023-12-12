/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePseudoDto, CreateUserAchievementDto } from './profile.dto';
import { AvatarUpdatedEvent } from 'src/events/avatar-updated.event';
import { EventEmitter2 } from '@nestjs/event-emitter';

export class ChangeIsPopupShown {
    isShown: boolean
    achievementId: number
}

@Injectable()
export class ProfileService {
    constructor(private readonly prisma: PrismaService,
        private readonly eventEmitter: EventEmitter2) {}
    
    async getProfileInfos(userId: number): Promise<any> {
        const currentUser = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                pseudo: true,
                avatar: true,
            }
        });

        const gamesParticipated = await this.prisma.gameParticipation.findMany({
            where: { userId: userId },
            select: {
                game: {
                    select: {
                        winnerId: true,
                        looserId: true,
                        score1: true,
                        score2: true,
                        createdAt: true,
                    }
                }
            }
        });

        const achievements = await this.prisma.achievement.findMany({
            select: {
                id: true,
                name: true,
                description: true,
                difficulty: true,
                users: true,
            }
        })

        const achievementsObj = {};
        achievements.forEach(achievement => {
            const filteredUsers = achievement.users.filter(user => {
                return user.userId === currentUser.id;
            });
            achievement.users = filteredUsers;
            achievementsObj[achievement.name] = achievement;
        });


        return {
            ...currentUser,
            gamesParticipated: gamesParticipated,
            achievements: achievementsObj,
        };
    }

    async addAvatar(avatarPath: string, userId: number): Promise<{ avatar: string; }> {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarPath },
            include: {
                
            }
        });
        this.eventEmitter.emit('avatar.updated', new AvatarUpdatedEvent(
            userId,
            updatedUser.avatar
        ));
        return { "avatar": updatedUser.avatar };
    }

    async getMatchHistory(userId: number): Promise<any> {
        const gameParticipations = await this.prisma.gameParticipation.findMany({
            where: {
                userId: userId,
            },
            include: {
                game: {
                    select: {
                        id: true,
                        createdAt: true,
                        score1: true,
                        score2: true,
                        winnerId: true,
                    }
                }
            },
        });
         
        const matchHistory = await Promise.all(
            gameParticipations.map(async (participation) => {
                const opponentParticipation = await this.prisma.gameParticipation.findFirst({
                    where: {
                        gameId: participation.gameId,
                        userId: {
                            not: userId,
                        },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                pseudo: true,
                                avatar: true,
                            }
                        },
                    },
                });
         
                return {
                    game: participation.game,
                    opponent: opponentParticipation?.user,
                };
            })
        )
         
        return matchHistory;
    }

    async getStats(userId: number): Promise<any> {
        const gameParticipations = await this.prisma.gameParticipation.findMany({
            where: {
                userId: userId,
            },
            include: {
                game: true,
            },
        });
        return gameParticipations;
    }

    async getLadder(): Promise<any> {
        const allUsers = await this.prisma.user.findMany({
            select: {
                id: true,
                pseudo: true,
                avatar: true,
                gameParticipation: {
                    include: {
                        game: {
                            select: {
                                winnerId: true,
                                looserId: true
                            }
                        }
                    }
                },
            }
        });
        return allUsers;
    }
}
