/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePseudoDto, CreateUserAchievementDto } from '../profile/profile.dto';

export class ChangeIsPopupShown {
    isShown: boolean
    achievementId: number
}

@Injectable()
export class ProfilePublicService {
    constructor(private prisma: PrismaService) {}

    async getProfileInfosPublic(userId: number): Promise<any> {
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

    async getAchievements(userId: number): Promise<any> {
        const allAchievementsUnlocked = await this.prisma.userAchievement.findMany({
            where: {
                userId: userId,
            },
            include: {
                achievement: true,
            }
        });
        return allAchievementsUnlocked;
    }
}