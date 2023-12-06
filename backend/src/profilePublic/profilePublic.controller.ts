/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post } from '@nestjs/common';
import { ProfilePublicService } from './profilePublic.service';
import { CheckIntPipe } from './profilePublic.pipe';
import { NotFoundException } from '@nestjs/common';

@Controller('profile/:userId')
export class ProfilePublicController {
    constructor( 
        private readonly profilePublicService: ProfilePublicService
    ) {}

    @Get()
    async getProfileInfosPublic(@Param('userId', CheckIntPipe) userId: number) {
        try {
            return this.profilePublicService.getProfileInfosPublic(userId); // TODO: await ??
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Get('/matchhistory')
    async getMatchHistory(@Param('userId', CheckIntPipe) userId: number): Promise<any> {
        try {
            return this.profilePublicService.getMatchHistory(userId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Get('/stats')
    async getStats(@Param('userId', CheckIntPipe) userId: number): Promise<any> {
        try {
            return this.profilePublicService.getStats(userId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Get('/achievements')
    async getAchievements(@Param('userId', CheckIntPipe) userId: number): Promise<any> {
        try {
            return this.profilePublicService.getAchievements(userId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }



    async isBlockByOne(
        @Param('userId', CheckIntPipe) userId: number,
        @Param('friendId', CheckIntPipe) friendId: number,
    ) {
        if (userId == friendId) {
          return null;
        }
        try {
          return this.profilePublicService.isBlockByOne(userId, friendId);
        } catch (error) {
          throw new NotFoundException(error.message);
        }
      }


    @Get('/isFriendWith/:friendId')
    async getIsFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
    ) {
        if (userId == friendId) {
        return null;
        }
        try {
            return this.profilePublicService.getIsFriend(userId, friendId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
    @Get('/isBlockWith/:friendId')
    async getIsBlockByUser(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
    ) {
        if (userId == friendId) {
            return null;
        }
        try {
            const friend = await this.profilePublicService.getIsBlockByUser(userId, friendId);
            return friend ? friend : null;
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
  @Post('/add/:friendId')
  async addFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
        if (userId == friendId) {
        return null;
        }
        if ((await this.isBlockByOne(userId, friendId)) == true) {
        return null;
        }
        try {
        return this.profilePublicService.addFriend(userId, friendId);
        } catch (error) {
        throw new NotFoundException(error.message);
        }
  }
  @Post('/unblock/:friendId')
  async unblockFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
        if (userId == friendId) {
        return null;
        }
        try {
        return this.profilePublicService.unblockFriend(userId, friendId);
        } catch (error) {
        throw new NotFoundException(error.message);
        }
  }
  @Post('/block/:friendId')
  async blockFriend(
    @Param('userId', CheckIntPipe) userId: number,
    @Param('friendId', CheckIntPipe) friendId: number,
  ) {
        if (userId == friendId) {
        return null;
        }
        try {
        return this.profilePublicService.blockFriend(userId, friendId);
        } catch (error) {
        throw new NotFoundException(error.message);
        }
  }
}