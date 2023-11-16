import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaClient) {}

  async getFriendsList(userId: number): Promise<any> {
    const friends = await this.prisma.user.findMany({
      where: {
        friends: {
          some: {
            userId, //include everyone, but we want only friends so it must fix the db
          },
        },
      },
      include: {
        friends: true,
      },
    });
    console.log(friends);
    return friends;
  }

  async getChannelList(userId: number): Promise<any> {
    const elem = await this.prisma.channel.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
    });
    console.log(elem);
    return elem;
  }

  async getChatChannel(userId: number): Promise<any> {
    return this.prisma.user.findMany({
      where: { id: userId },
      select: {
        messages: {
          select: {
            channelId: true,
            createdAt: true,
            content: true,
            author: {
              select: {
                id: true,
              },
            },
            // or
            authorId: true,
          },
        },
      },
    });
  }
}
