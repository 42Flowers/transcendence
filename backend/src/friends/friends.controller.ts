import { Controller, Get, Param, Post, UseGuards, Request, Body } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { CheckIntPipe } from 'src/profilePublic/profilePublic.pipe';
import { NotFoundException } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('friends')
@UseGuards(AuthGuard)
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

  @Get()
  async getFriendsList(
    @Request() req: ExpressRequest,
  ) {
    const userId = Number(req.user.sub);
    try {
      return this.friendService.getFriendsList(userId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post('unblock')
  async unblockFriend(
    @Request() req: ExpressRequest,
    @Body() payload: { friendId: number},
  ) {
    const userId = Number(req.user.sub);
    if (userId == payload.friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.unblockFriend(userId, payload.friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post('block')
  async blockFriend(
    @Request() req: ExpressRequest,
    @Body() payload: { friendId: number},
  ) {
    const userId = Number(req.user.sub);
    if (userId == payload.friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.blockFriend(userId, payload.friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post('delete')
  async deleteFriend(
    @Request() req: ExpressRequest,
    @Body() payload: { friendId: number},
  ) {
    const userId = Number(req.user.sub);
    if (userId == payload.friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.deleteFriend(userId, payload.friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post('cancel')
  async cancelFriend(
    @Request() req: ExpressRequest,
    @Body() payload: { friendId: number},
  ) {
    const userId = Number(req.user.sub);
    if (userId == payload.friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.cancelFriend(userId, payload.friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post('accept')
  async acceptFriend(
    @Request() req: ExpressRequest,
    @Body() payload: { friendId: number},
  ) {
    const userId = Number(req.user.sub);
    if (userId == payload.friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    if ((await this.isBlockByOne(userId, payload.friendId)) == true) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.acceptFriend(userId, payload.friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
  @Post('decline')
  async declineFriend(
    @Request() req: ExpressRequest,
    @Body() payload: { friendId: number},
  ) {
    const userId = Number(req.user.sub);
    if (userId == payload.friendId) {
      // return null;
      return this.friendService.getFriendsList(userId);
    }
    try {
      return this.friendService.declineFriend(userId, payload.friendId);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }
}
