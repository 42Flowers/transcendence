/* eslint-disable prettier/prettier */
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ChangePseudoDto, CreateUserAchievementDto } from './profile.dto';
import { AvatarUpdatedEvent } from 'src/events/avatar-updated.event';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';

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
            },
        });

        if (!currentUser) {
            throw new NotFoundException('User not found');
        }

        return currentUser;
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

    /******************************* */

    async getMatchHistory(userId: number): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: {
              id: userId
            },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const gameParticipations = await this.prisma.gameParticipation.findMany({
            where: {
                userId,
            },
            include: {
                game: {
                    select: {
                        id: true,
                        createdAt: true,
                        score1: true,
                        score2: true,
                        winnerId: true,
                    },
                },
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
        );
         
        return matchHistory;
    }

    async getStats(userId: number): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }
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
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error(`User with ID ${userId} not found`);
        }
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


    async isBlockByOne(userId: number, friendId: number): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const friend = await this.prisma.user.findUnique({
          where: { id: friendId },
        });
        if (!user || !friend) {
          throw new Error(`User with ID ${userId || friendId} not found`);
        }
        const friendBlock = await this.prisma.blocked.findUnique({
          where: {
            userId_blockedId: {
              userId: userId,
              blockedId: friendId,
            },
          },
        });
        const userBlock = await this.prisma.blocked.findUnique({
          where: {
            userId_blockedId: {
              userId: friendId,
              blockedId: userId,
            },
          },
        });
        if (friendBlock || userBlock) {
          return true;
        }
        return false;
    }

    async getIsFriend(userId: number, friendId: number): Promise<any> {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const friendExists = await this.prisma.user.findUnique({
          where: { id: friendId },
        });
        if (!user || !friendExists) {
          throw new Error(`User with ID ${userId || friendId} not found`);
        }
        const target = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId: userId,
              friendId: friendId,
            },
          },
        });
        return {
          isFriended: !!target,
        }
    }
    
    async getIsBlockByUser(userId: number, friendId: number): Promise<any> {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const friendExists = await this.prisma.user.findUnique({
          where: { id: friendId },
        });
        if (!user || !friendExists) {
          throw new Error(`User with ID ${userId || friendId} not found`);
        }
        const target = await this.prisma.blocked.findUnique({
          where: {
            userId_blockedId: {
              userId: userId,
              blockedId: friendId,
            },
          },
        });
        return {
          isBlocked: !!target,
        };
    }
      
    async addFriend(userId: number, friendId: number): Promise<any> {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const friend = await this.prisma.user.findUnique({
          where: { id: friendId },
        });
        if (!user || !friend) {
          throw new Error(`User with ID ${userId || friendId} not found`);
        }
        const friendshipUserToFriend = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId: userId,
              friendId: friendId,
            },
          },
        });
        const friendshipFriendToUser = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId: friendId,
              friendId: userId,
            },
          },
        });
        if (!friendshipUserToFriend && !friendshipFriendToUser) {
          await this.prisma.friendship.create({
            data: {
              userId: userId,
              friendId: friendId,
              status: 0,
            },
          });
          await this.prisma.friendship.create({
            data: {
              userId: friendId,
              friendId: userId,
              status: 1,
            },
          });
		  this.eventEmitter.emit('chat.sendtoclientfriends', 'friend', "Somebody wants to be your friend ! You should go look at your frienship requests");
        }
        return this.getIsFriend(userId, friendId);
    }

    async unblockFriend(userId: number, friendId: number): Promise<any> {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const friend = await this.prisma.user.findUnique({
            where: { id: friendId },
        });
        if (!user || !friend) {
          throw new Error(`User with ID ${userId || friendId} not found`);
        }
        const uniqueBlock = await this.prisma.blocked.findUnique({
          where: {
            userId_blockedId: {
              userId: userId,
              blockedId: friendId,
            },
          },
        });
        const friendshipUserToFriend = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId: userId,
              friendId: friendId,
            },
          },
        });
        if (uniqueBlock) {
          if (friendshipUserToFriend && friendshipUserToFriend.status == 3) {
            await this.prisma.friendship.update({
              where: {
                userId_friendId: {
                  userId: userId,
                  friendId: friendId,
                },
              },
              data: {
                status: 2,
              },
            });
            await this.prisma.blocked.delete({
              where: {
                userId_blockedId: {
                  userId: userId,
                  blockedId: friendId,
                },
              },
            });
          }
          else if (!friendshipUserToFriend) {
            await this.prisma.blocked.delete({
              where: {
                userId_blockedId: {
                  userId: userId,
                  blockedId: friendId,
                },
              },
            });
          }
        }
        return this.getIsBlockByUser(userId, friendId);
    }
    
    async blockFriend(userId: number, friendId: number): Promise<any> {
        const user = await this.prisma.user.findUnique({
          where: { id: userId },
        });
        const friend = await this.prisma.user.findUnique({
          where: { id: friendId },
        });
        if (!user || !friend) {
          throw new Error(`User with ID ${userId || friendId} not found`);
        }
        const uniqueBlock = await this.prisma.blocked.findUnique({
          where: {
            userId_blockedId: {
              userId: userId,
              blockedId: friendId,
            },
          },
        });
        const friendshipUserToFriend = await this.prisma.friendship.findUnique({
          where: {
            userId_friendId: {
              userId: userId,
              friendId: friendId,
            },
          },
        });
        if (!uniqueBlock) {
          if (friendshipUserToFriend && friendshipUserToFriend.status !== 3) {
            if (friendshipUserToFriend && friendshipUserToFriend.status === 2) {
                await this.prisma.friendship.update({
                  where: {
                    userId_friendId: {
                      userId: userId,
                      friendId: friendId,
                    },
                  },
                  data: {
                    status: 3,
                  },
                });
            }
            else if (friendshipUserToFriend && (friendshipUserToFriend.status === 0 || friendshipUserToFriend.status === 1)) {
              await this.prisma.friendship.delete({
                where: {
                  userId_friendId: {
                    userId: userId,
                    friendId: friendId,
                  },
                },
              });
              await this.prisma.friendship.delete({
                where: {
                  userId_friendId: {
                    userId: friendId,
                    friendId: userId,
                  },
                },
              });
            }
            await this.prisma.blocked.create({
              data: {
                userId: userId,
                blockedId: friendId,
              },
            });
          }
          else if (!friendshipUserToFriend) {
            await this.prisma.blocked.create({
              data: {
                userId: userId,
                blockedId: friendId,
              },
            });
          }
        }
        return this.getIsBlockByUser(userId, friendId);
    }
}
