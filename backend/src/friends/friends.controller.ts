import { Controller, Get, Param, Post } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CheckIntPipe } from 'src/profilePublic/profilePublic.pipe';
import { NotFoundException } from '@nestjs/common';

@Controller('friends')
export class FriendsController {
  constructor(private friendService: FriendsService) {}

  async isBlockByOne(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      return null;
      // return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.isBlockByOne(userId, friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  @Get(':userId')
  async getFriendsList(@Param('userId', CheckIntPipe) userId: number) {
    try {
      return this.friendService.getFriendsList(userId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post(':userId/unblock/:friendId')
  async unblockFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.unblockFriend(userId, friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post(':userId/block/:friendId')
  async blockFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.blockFriend(userId, friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post(':userId/delete/:friendId')
  async deleteFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.deleteFriend(userId, friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post(':userId/cancel/:friendId')
  async cancelFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.cancelFriend(userId, friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post(':userId/accept/:friendId')
  async acceptFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    if ((await this.isBlockByOne(userId, friendId)) == true) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.acceptFriend(userId, friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post(':userId/decline/:friendId')
  async declineFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
    if (userId == friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.declineFriend(userId, friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
