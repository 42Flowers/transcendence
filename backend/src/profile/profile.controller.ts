/* eslint-disable prettier/prettier */
import { BadRequestException, Controller, Get, HttpStatus, NotFoundException, Param, ParseFilePipeBuilder, ParseIntPipe, Post, Request, UnprocessableEntityException, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
    constructor( 
        private readonly profileService: ProfileService,
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

    @Post('add-avatar')
    @UseInterceptors(FileInterceptor('file', { 
        storage: diskStorage({
            destination: './uploads',
            filename: (req: ExpressRequest, file, callback) => {
                const extension = file.originalname.split(".").at(-1);
                const newFileName = `${req.user.id}_${Date.now()}.${extension}`;

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

        const userId = req.user.id;

        // Transform the plain JavaScript object into an instance of the AvatarDto class
        const AvatarDtoTransformed = plainToClass(AvatarDto, { filename: avatar.filename, userId });
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
                const avatarData = await this.profileService.addAvatar(avatar.filename, userId);
            
                this.eventEmitter.emit('avatar.updated', new AvatarUpdatedEvent(
                    userId,
                    avatarData.avatar
                ));

                return avatarData;
            } catch {
                throw new UnprocessableEntityException();
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
