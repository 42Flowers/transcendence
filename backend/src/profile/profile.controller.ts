/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Param, Body, Request, UploadedFile, BadRequestException, UseGuards, ParseIntPipe, NotFoundException } from '@nestjs/common';
import { UseInterceptors, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { CreateUserAchievementDto, ChangePseudoDto, AvatarDto } from './profile.dto';
import { CheckIntPipe } from './profile.pipe';
import { diskStorage } from 'multer';
import { Request as ExpressRequest } from 'express';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import { AuthGuard } from 'src/auth/auth.guard';
import sizeOf from 'image-size';
import { AchievementsService } from 'src/achievements/achievements.service';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
    constructor( 
        private readonly profileService: ProfileService,
        private readonly achievementsService: AchievementsService
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
        return this.profileService.getProfileInfos(Number(req.user.sub)); // TODO: await ??
    }

    @Post('add-avatar')
    @UseInterceptors(FileInterceptor('file', { 
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, callback) => {
                const name = file.originalname.split(".")[0];
                const extension = file.originalname.split(".")[1];
                const newFileName = name.split(" ").join("_") + "_" + Date.now() + "." + extension;

                callback(null, newFileName);
            }
        }),
    }))
    async uploadAvatar(@UploadedFile(
        new ParseFilePipeBuilder()
            .addFileTypeValidator({
                fileType: /^(image\/jpeg|image\/png)$/
            })
            .addMaxSizeValidator({
                maxSize: 1000042
            })
            .build({
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
        )
        avatar: Express.Multer.File, @Request() req: ExpressRequest) {
        // Transform the plain JavaScript object into an instance of the AvatarDto class
        const AvatarDtoTransformed = plainToClass(AvatarDto, { filename: avatar.filename, userId: Number(req.user.sub) });
        // Validate the AvatarDtoTransformed instance
        const errors = await validate(AvatarDtoTransformed);
        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }
        
        if (!avatar) {
            throw new BadRequestException("Avatar is not an image");
        } else {
            // Check image dimensions
            const dimensions = sizeOf(avatar.path);
            if (dimensions.width > 1000 || dimensions.height > 1000) {
                throw new BadRequestException('Invalid image dimensions');
            }
            try {
                return this.profileService.addAvatar(avatar.filename, Number(req.user.sub));
            } catch (error) {
                throw error; // TODO: correct ?
            }
        }
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
