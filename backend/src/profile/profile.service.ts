/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePseudoDto, CreateUserAchievementDto } from './profile.dto';

export class ChangeIsPopupShown {
    isShown: boolean
    achievementId: number
}

@Injectable()
export class ProfileService {
    constructor(private prisma: PrismaService) {}
    
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

    async addAchievementToUser(dto: CreateUserAchievementDto): Promise<any> {
        const existingUserAchievement = await this.prisma.userAchievement.findFirst({
            where: {
                userId: dto.userId,
                achievementId: dto.achievementId
            }
        });
        if (existingUserAchievement) {
            throw new BadRequestException('Already connected');
        }

        const newUserAchievement = await this.prisma.userAchievement.create({
            data: {
                user: {
                    connect: {
                        id: dto.userId
                    }
                },
                achievement: {
                    connect: {
                        id: dto.achievementId
                    }
                }
            },
        });
        return newUserAchievement;
    }

    async addAvatar(avatarPath: string, userId: number): Promise<any> {
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { avatar: avatarPath },
            include: {
                
            }
        });
        return { "avatar": updatedUser.avatar };
    }

    async changePseudo(dto: ChangePseudoDto, userId: number): Promise<any> {
        const existingUser = await this.prisma.user.findUnique({
            where: { pseudo: dto.pseudo },
        });
        if (existingUser) {
            throw new BadRequestException('Pseudo already exists');
        }

        const updatedPseudo = await this.prisma.user.update({
            where: { id: userId },
            data: { pseudo: dto.pseudo },
        })
        return { "pseudo" : updatedPseudo.pseudo };
    }

    async getMatchHistory(userId: number): Promise<any> {
        const gameParticipations = await this.prisma.gameParticipation.findMany({
            where: {
                userId: userId,
            },
            include: {
                game: true,
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
                        user: true,
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
