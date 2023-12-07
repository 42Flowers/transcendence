import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

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

  async getFriendsList(userId: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    const friends = await this.prisma.friendship.findMany({
      where: {
        userId,
      },
      select: {
        status: true,
        friend: {
          select: {
            id: true,
            pseudo: true,
            avatar: true,
          },
        },
      },
    });
    return friends;
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
      } else if (!friendshipUserToFriend) {
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
    return this.getFriendsList(userId);
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
        } else if (
          friendshipUserToFriend && (friendshipUserToFriend.status === 0 || friendshipUserToFriend.status === 1)) {
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
      } else if (!friendshipUserToFriend) {
        await this.prisma.blocked.create({
          data: {
            userId: userId,
            blockedId: friendId,
          },
        });
      }
    }
    return this.getFriendsList(userId);
  }

  async deleteFriend(userId: number, friendId: number): Promise<any> {
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
    if ((friendshipUserToFriend.status === 2 || friendshipUserToFriend.status === 3) && (friendshipFriendToUser.status === 2 || friendshipFriendToUser.status === 3)) {
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
    return this.getFriendsList(userId);
  }

  async cancelFriend(userId: number, friendId: number): Promise<any> {
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
      select: {
        status: true,
      },
    });
    const friendshipFriendToUser = await this.prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: friendId,
          friendId: userId,
        },
      },
      select: {
        status: true,
      },
    });
    if (
      friendshipUserToFriend.status == 0 &&
      friendshipFriendToUser.status == 1
    ) {
      await this.prisma.friendship.delete({
        where: {
          userId_friendId: {
            userId: friendId,
            friendId: userId,
          },
        },
      });
      await this.prisma.friendship.delete({
        where: {
          userId_friendId: { userId, friendId },
        },
      });
    }
    return this.getFriendsList(userId);
  }

  async acceptFriend(userId: number, friendId: number): Promise<any> {
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
      select: {
        status: true,
      },
    });
    const friendshipFriendToUser = await this.prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: friendId,
          friendId: userId,
        },
      },
      select: {
        status: true,
      },
    });
    if (friendshipUserToFriend.status == 1 && friendshipFriendToUser.status == 0) {
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
      await this.prisma.friendship.update({
        where: {
          userId_friendId: {
            userId: friendId,
            friendId: userId,
          },
        },
        data: {
          status: 2,
        },
      });
    }
    return this.getFriendsList(userId);
  }

  async declineFriend(userId: number, friendId: number): Promise<any> {
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
      select: {
        status: true,
      },
    });
    const friendshipFriendToUser = await this.prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: friendId,
          friendId: userId,
        },
      },
      select: {
        status: true,
      },
    });
    if (
      friendshipUserToFriend.status == 1 &&
      friendshipFriendToUser.status == 0
    ) {
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
    return this.getFriendsList(userId);
  }
}
