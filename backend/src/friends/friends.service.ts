import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FriendsService {
  constructor(private prisma: PrismaService) {}

  async isBlockByOne(userId: number, friendId: number): Promise<boolean> {
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
          },
        },
      },
    });
    return friends;
  }

  async getIsFriend(userId: number, friendId: number): Promise<any> {
    const friend = await this.prisma.friendship.findUnique({
      where: {
        userId_friendId: {
          userId: userId,
          friendId: friendId,
        },
      },
      select: {
        status: true,
        friend: {
          select: {
            id: true,
            pseudo: true,
          },
        },
      },
    });
    return friend;
  }

  async addFriend(userId: number, friendId: number): Promise<any> {
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
    if ((!friendshipUserToFriend && !friendshipFriendToUser)) {
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
    }
    return this.getFriendsList(userId);
  }

  async getIsBlockByUser(userId: number, friendId: number): Promise<any> {
    const friend = await this.prisma.blocked.findUnique({
      where: {
        userId_blockedId: {
          userId: userId,
          blockedId: friendId,
        },
      },
    });
    return friend;
  }

  async unblockFriend(userId: number, friendId: number): Promise<any> {
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

    if (uniqueBlock && friendshipUserToFriend.status == 3) {
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
    return this.getFriendsList(userId);
  }

  async blockFriend(userId: number, friendId: number): Promise<any> {
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
    if (!uniqueBlock && friendshipUserToFriend.status !== 3) {
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
      await this.prisma.blocked.create({
        data: {
          userId: userId,
          blockedId: friendId,
        },
      });
    }
    return this.getFriendsList(userId);
  }

  async deleteFriend(userId: number, friendId: number): Promise<any> {
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

    if (friendshipUserToFriend && friendshipFriendToUser) {
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
    if (friendshipUserToFriend.status == 0 && friendshipFriendToUser.status == 1) {
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
