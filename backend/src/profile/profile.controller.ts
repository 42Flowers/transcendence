/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Param, Body, UploadedFile, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateUserAchievementDto, ChangePseudoDto, ProfileService } from './profile.service';
import { diskStorage } from 'multer';

@Controller('profile')
export class ProfileController {
    constructor( 
        private readonly profileService: ProfileService
    ) {}

    @Get(':userId')
    async getProfileInfos(@Param('userId', ParseIntPipe) userId: number) {
        return this.profileService.getProfileInfos(userId); // TODO: await ??
    }

    @Post(':userId/change-pseudo')
    async changePseudo(@Body() dto: ChangePseudoDto, @Param('userId', ParseIntPipe) userId: number): Promise<any> {
        return await this.profileService.changePseudo(dto, userId);
    }

    @Post(':userId/add-achievement-to-user')
    async addAchievementToUser(@Body() dto: CreateUserAchievementDto): Promise<any> {
        return this.profileService.addAchievementToUser(dto);
    }

    @Post(':userId/add-avatar')
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
        fileFilter: (req, file, callback) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
                return callback(null, false);
            }
            callback(null, true);
        }
    }))
    async uploadAvatar(@UploadedFile() avatar: Express.Multer.File, @Param('userId', ParseIntPipe) userId: number) {
        if (!avatar) {
            throw new BadRequestException("Avatar is not an image");
        } else {
            try {
                return this.profileService.addAvatar(avatar.filename, userId);
            } catch (error) {
                console.error(`Error uploading file: ${error}`);
            }
        }
    }

    @Get(':userId/matchhistory')
    async getMatchHistory(@Param('userId', ParseIntPipe) userId: number): Promise<any> {
        return this.profileService.getMatchHistory(userId);
    }

    @Get(':userId/ladder')
    async getLadder(): Promise<any> {
        return this.profileService.getLadder();
    }

    @Get(':userId/achievements')
    async getAchievements(@Param('userId', ParseIntPipe) userId: number): Promise<any> {
        return this.profileService.getAchievements(userId);
    }
}
