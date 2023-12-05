import { Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';

@Controller('friends')
export class FriendsController {
  constructor(private friendService: FriendsService) {}

  async isBlockByOne(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    return this.friendService.isBlockByOne(userId, friendId);
  }

  @Get(':userId')
  async getFriendsList(@Param('userId', ParseIntPipe) userId: number) {
    return this.friendService.getFriendsList(userId);
  }
  @Get(':userId/isFriendWith/:friendId')
  async getIsFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    return this.friendService.getIsFriend(userId, friendId);
  }
  @Post(':userId/add/:friendId')
  async addFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    if ((await this.isBlockByOne(userId, friendId)) == true) {
      return null;
    }
    return this.friendService.addFriend(userId, friendId);
  }
  @Get(':userId/isBlockWith/:friendId')
  async getIsBlockByUser(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    const friend = await this.friendService.getIsBlockByUser(userId, friendId);
    return friend ? friend : null;
  }
  @Post(':userId/unblock/:friendId')
  async unblockFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    return this.friendService.unblockFriend(userId, friendId);
  }
  @Post(':userId/block/:friendId')
  async blockFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    return this.friendService.blockFriend(userId, friendId);
  }
  @Post(':userId/delete/:friendId')
  async deleteFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    return this.friendService.deleteFriend(userId, friendId);
  }
  @Post(':userId/cancel/:friendId')
  async cancelFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    return this.friendService.cancelFriend(userId, friendId);
  }
  @Post(':userId/accept/:friendId')
  async acceptFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    if ((await this.isBlockByOne(userId, friendId)) == true) {
      return null;
    }
    return this.friendService.acceptFriend(userId, friendId);
  }
  @Post(':userId/decline/:friendId')
  async declineFriend(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('friendId', ParseIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
    }
    return this.friendService.declineFriend(userId, friendId);
  }
}
