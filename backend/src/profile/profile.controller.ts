/* eslint-disable prettier/prettier */
import { BadRequestException, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, ParseFilePipeBuilder, ParseIntPipe, Post, Request, UnprocessableEntityException, UploadedFile, UseFilters, UseGuards, UseInterceptors } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { FileInterceptor } from '@nestjs/platform-express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import sizeOf from 'image-size';
import { diskStorage } from 'multer';
import { AchievementsService } from 'src/achievements/achievements.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AvatarUpdatedEvent } from 'src/events/avatar-updated.event';
import { AvatarDto } from './profile.dto';
import { ProfileService } from './profile.service';
import * as path from 'node:path';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { renameSync, unlink, unlinkSync } from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
    constructor( 
        private readonly profileService: ProfileService,
        private readonly prismaService: PrismaService,
        private readonly achievementsService: AchievementsService,
        private readonly eventEmitter: EventEmitter2
    ) {}

    @Get('/ladder')
    async getLadder(): Promise<any> {
        const ladder = await this.profileService.getLadder();
        const errors = await validate(ladder);
        if (errors.length > 0) {
            throw Error('Invalid ladder data');
        }
        return ladder;
    }

    @Get()
    async getProfileInfos(@Request() req: ExpressRequest) {
        const userId = req.user.id;
        const profileInfo = await this.profileService.getProfileInfos(userId);
        
        return profileInfo;
    }

    @Get('matchhistory')
    async getMatchHistory(@Request() req: ExpressRequest): Promise<any> {
        return this.profileService.getMatchHistory(Number(req.user.sub));
    }

    @Get('stats')
    async getStats(@Request() req: ExpressRequest): Promise<any> {
        return this.profileService.getStats(Number(req.user.sub));
    }

    @Get('/@me/achievements')
    async retrieveAchievementsForCurrentUser(
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

    /* TODO add id validation pipe even if it is catched and returned as a 404 */

    @Get('/:id/achievements')
    async getAchievements(
        @Param('id', ParseIntPipe) userId: number): Promise<any> {
        
        try {
            const achievements = await this.achievementsService.listAchievements(userId);

            return achievements;
        } catch {
            throw new NotFoundException();
        }
    }
}
