/* eslint-disable prettier/prettier */
import { BadRequestException, Controller, ForbiddenException, Get, HttpException, NotFoundException, Param, Post, Request, UseGuards } from '@nestjs/common';
import { validate } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import { AchievementsService } from 'src/achievements/achievements.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { CheckIntPipe } from './profile.pipe';
import { ProfileService } from './profile.service';
import { ApiTags } from '@nestjs/swagger';

@Controller('profile')
@ApiTags('Profile')
@UseGuards(AuthGuard)
export class ProfileController {
    constructor(
        private readonly profileService: ProfileService,
        private readonly achievementsService: AchievementsService
    ) { }

    @Get('/ladder')
    async getLadder(): Promise<any> {
        const ladder = await this.profileService.getLadder();
        const errors = await validate(ladder);
        if (errors.length > 0) {
            throw new BadRequestException('Invalid ladder data');
        }
        return ladder;
    }

    /* ==== Profile ==== */

    @Get('/@me')
    async getSelfProfile(@Request() req: ExpressRequest) {
        const userId = req.user.id;
        const profileInfo = await this.profileService.getProfileInfos(userId);

        return profileInfo;
    }

    @Get('/:id')
    async getProfile(@Param('id', CheckIntPipe) userId: number) {
        try {
            return await this.profileService.getProfileInfos(userId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    /* ==== Match History ==== */

    @Get('/@me/matchhistory')
    async getSelfMatchHistory(@Request() req: ExpressRequest): Promise<any> {
        return await this.profileService.getMatchHistory(req.user.id);
    }


    @Get('/:id/matchhistory')
    async getMatchHistory(@Param('id', CheckIntPipe) userId: number): Promise<any> {
        try {
            const matchHistory = await this.profileService.getMatchHistory(userId);

            return matchHistory;
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            }
            throw new NotFoundException();
        }
    }

    /* ==== Stats ==== */

    @Get('/@me/stats')
    async getSelfStats(@Request() req: ExpressRequest): Promise<any> {
        return this.profileService.getStats(Number(req.user.sub));
    }

    @Get('/:id/stats')
    async getStats(@Param('id', CheckIntPipe) userId: number): Promise<any> {
        try {
            return this.profileService.getStats(userId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    /* ==== Achievements ==== */

    @Get('/@me/achievements')
    async getSelfAchievements(
        @Request() req: ExpressRequest
    ) {
        const userId = req.user.id;

        try {
            const achievements = await this.achievementsService.listAchievements(userId);

            return achievements;
        } catch {
            throw new NotFoundException();
        }
    }

    @Get('/:id/achievements')
    async getAchievements(
        @Param('id', CheckIntPipe) userId: number): Promise<any> {

        try {
            const achievements = await this.achievementsService.listAchievements(userId);

            return achievements;
        } catch {
            throw new NotFoundException();
        }
    }

    /* ==== Friendships ==== */

    private async isBlockByOne(userId: number, friendId: number) {
        if (userId == friendId) {
            return null;
        }
        try {
            return this.profileService.isBlockByOne(userId, friendId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Get('/@me/isFriendWith/:friendId')
    async getIsFriend(
        @Request() req: ExpressRequest,
        @Param('friendId', CheckIntPipe) friendId: number,
    ) {
        const userId = req.user.id;
        if (userId === friendId) {
            return new BadRequestException('User id and friend id msut be different');
        }
        try {
            return this.profileService.getIsFriend(userId, friendId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
    
    @Get('/@me/isBlockWith/:friendId')
    async getIsBlockByUser(
        @Request() req: ExpressRequest,
        @Param('friendId', CheckIntPipe) friendId: number,
    ) {
        const userId = req.user.id;

        if (userId == friendId) {
            return null;
        }
        try {
            const friend = await this.profileService.getIsBlockByUser(userId, friendId);
            return friend ? friend : null;
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Post('/@me/add/:friendId')
    async addFriend(
        @Request() req: ExpressRequest,
        @Param('friendId', CheckIntPipe) friendId: number,
    ) {
        const userId = req.user.id;

        if (userId == friendId) {
            throw new ForbiddenException();
        }
        try {
            if ((await this.isBlockByOne(userId, friendId)) == true) {
                return; /* Silently fail */
            }
            return this.profileService.addFriend(userId, friendId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Post('/@me/unblock/:friendId')
    async unblockFriend(
        @Request() req: ExpressRequest,
        @Param('friendId', CheckIntPipe) friendId: number,
    ) {
        const userId = req.user.id;

        if (userId == friendId) {
            throw new BadRequestException();
        }
        try {
            return this.profileService.unblockFriend(userId, friendId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }

    @Post('/@me/block/:friendId')
    async blockFriend(
        @Request() req: ExpressRequest,
        @Param('friendId', CheckIntPipe) friendId: number,
    ) {
        const userId = req.user.id;

        if (userId == friendId) {
            throw new ForbiddenException();
        }
        try {
            return this.profileService.blockFriend(userId, friendId);
        } catch (error) {
            throw new NotFoundException(error.message);
        }
    }
}
