/* eslint-disable prettier/prettier */
import { Controller, Get, Param } from '@nestjs/common';
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
}