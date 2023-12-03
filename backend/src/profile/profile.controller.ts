/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Param, Body, UploadedFile, BadRequestException } from '@nestjs/common';
import { UseInterceptors, ParseFilePipeBuilder, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { CreateUserAchievementDto, ChangePseudoDto, AvatarDto } from './profile.dto';
import { CheckIntPipe } from './profile.pipe';
import { diskStorage } from 'multer';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import sizeOf from 'image-size';

@Controller('profile')
export class ProfileController {
    constructor( 
        private readonly profileService: ProfileService
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

    @Get(':userId')
    async getProfileInfos(@Param('userId', CheckIntPipe) userId: number) {
        return this.profileService.getProfileInfos(userId); // TODO: await ??
    }

    @Post(':userId/change-pseudo')
    async changePseudo(@Body() dto: ChangePseudoDto, @Param('userId', CheckIntPipe) userId: number): Promise<any> {
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
        // fileFilter: (req, file, callback) => {
        //     const allowedMimeTypes = ['image/jpeg', 'image/png'];

        //     if (allowedMimeTypes.includes(file.mimetype)) {
        //         callback(null, true);
        //     } else {
        //         callback(new Error('Invalid file type'), false);
        //     }
        //     if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
        //         callback(new Error('Invalid file extension'), false);
        //     }
        //     callback(null, true);
        // }
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
        avatar: Express.Multer.File, @Param('userId', CheckIntPipe) userId: number) {
        // Transform the plain JavaScript object into an instance of the AvatarDto class
        const AvatarDtoTransformed = plainToClass(AvatarDto, { filename: avatar.filename, userId: userId });
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
            // Check image size
            // if (avatar.size > 100000) {
            //     throw new BadRequestException('Image is too large');
            // }
            try {
                return this.profileService.addAvatar(avatar.filename, userId);
            } catch (error) {
                throw error; // TODO: correct ?
            }
        }
    }

    @Get(':userId/matchhistory')
    async getMatchHistory(@Param('userId', CheckIntPipe) userId: number): Promise<any> {
        return this.profileService.getMatchHistory(userId);
    }

    @Get(':userId/achievements')
    async getAchievements(@Param('userId', CheckIntPipe) userId: number): Promise<any> {
        return this.profileService.getAchievements(userId);
    }
}
