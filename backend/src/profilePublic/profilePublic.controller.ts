/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
import { ProfilePublicService } from './profilePublic.service';
import { CheckIntPipe } from './profilePublic.pipe';

@Controller('profile/:userId')
export class ProfilePublicController {
    constructor( 
        private readonly profilePublicService: ProfilePublicService
    ) {}

    @Get()
    async getProfileInfosPublic(@Param('userId', CheckIntPipe) userId: number) {
        return this.profilePublicService.getProfileInfosPublic(userId); // TODO: await ??
    }

    @Get('/matchhistory')
    async getMatchHistory(@Param('userId', CheckIntPipe) userId: number): Promise<any> {
        return this.profilePublicService.getMatchHistory(userId);
    }

    @Get('/stats')
    async getStats(@Param('userId', CheckIntPipe) userId: number): Promise<any> {
        return this.profilePublicService.getStats(userId);
    }

    @Get('/achievements')
    async getAchievements(@Param('userId', CheckIntPipe) userId: number): Promise<any> {
        return this.profilePublicService.getAchievements(userId);
    }
}