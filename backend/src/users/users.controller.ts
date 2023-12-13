/* eslint-disable prettier/prettier */
import { Body, Controller, Get, HttpException, HttpStatus, NotFoundException, Param, ParseIntPipe, Patch, Request, UnprocessableEntityException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe, ParseFilePipeBuilder, Post,} from "@nestjs/common";
import { Request as ExpressRequest } from 'express';
import { UsersService } from "./users.service";
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { AllowIncompleteProfile } from 'src/auth/allow-incomplete-profile.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import sizeOf from 'image-size';
import { ISizeCalculationResult } from 'image-size/dist/types/interface';
import { diskStorage } from 'multer';
import { unlink, unlinkSync } from 'node:fs';
import * as path from 'node:path';
import { AuthGuard } from 'src/auth/auth.guard';
import { ProfileService } from 'src/profile/profile.service';
import { IsNoSpecialCharacters } from 'src/profile/profile.pipe';

export class PatchProfileDto {
    @IsOptional()
    @IsString()
    @IsNoSpecialCharacters()
    @MinLength(3)
    @MaxLength(10)
    pseudo: string;

    @IsOptional()
    @IsEmail()
    @IsString()
    email: string;
}

export class CompleteProfileDto {
    @IsString()
    @IsNoSpecialCharacters()
    @MinLength(3)
    @MaxLength(10)
    pseudo: string;
}

@Controller({
    version: '1',
    path: '/users',
})
@UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService,
        private readonly profileService: ProfileService) {}

    @Get('/@me')
    @AllowIncompleteProfile()
    async retrieveSelfProfile(@Request() req: ExpressRequest) {
        const userId = Number(req.user.sub);
        const userProfile = await this.usersService.retrieveUserProfile(userId);

        if (null === userProfile)
            throw new NotFoundException();

        return userProfile;
    }


    @Get('/:id')
    async retrieveUserProfile(
        @Request() req: ExpressRequest,
        @Param('id', ParseIntPipe) paramId: number) {
        
        const userProfile = await this.usersService.retrieveUserProfile(paramId);

        if (null === userProfile)
            throw new NotFoundException();

        return userProfile;
    }


    private asyncSizeOf(input: string): Promise<ISizeCalculationResult> {
        return new Promise((resolve, reject) => {
            sizeOf(input, (err, r) => {
                if (err)
                    reject(err);
                else
                    resolve(r);
            });
        });
    }

    @Patch('/@me')
    @UseInterceptors(FileInterceptor('avatar', {
        limits: {
            fieldSize: 1048576, /* 1 Mb */
        },
        storage: diskStorage({
            destination: path.join(process.cwd(), 'uploads'),
            filename(req, file, callback) {
                let ext = '.png';

                if (file.mimetype === 'image/png')
                    ext = '.png';
                else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg')
                    ext = '.jpg';

                const newFilename = `${req.user.id}_${Date.now()}${ext}`;

                callback(null, newFilename);
            },
        }),
        fileFilter(_req, file, callback) {
            const acceptedMimeTypes = [
                'image/png',
                'image/jpg',
                'image/jpeg',
            ];

            if (!acceptedMimeTypes.includes(file.mimetype))
                return callback(null, false);

            callback(null, true);
        },
    }))
    @AllowIncompleteProfile()
    async patchSelfProfile(
        @Request() req: ExpressRequest,
        @UploadedFile() avatar: Express.Multer.File,
        @Body() body: PatchProfileDto
    ) {
        /* TODO test username for special characters */

        const userId = Number(req.user.sub);
        const userProfile = await this.usersService.patchUserProfile(userId, body);

        if (null === userProfile) {
            throw new NotFoundException();
        }

        if (avatar) {
            try {
                const { width, height } = await this.asyncSizeOf(avatar.path);

                console.log(width, height);

                if (width >= 1000 || height >= 1000) {
                    throw new UnprocessableEntityException('File too big !');
                }

                const avatarData = await this.profileService.addAvatar(avatar.filename, userId);

                if (userProfile.avatar) {
                    const oldAvatarPath = path.join(process.cwd(), 'uploads', userProfile.avatar);

                    /* Fails silently */
                    try { unlinkSync(oldAvatarPath); } catch { }
                }

                userProfile.avatar = avatarData.avatar;
            } catch (e) {
                console.log(e);
                unlink(avatar.path, () => {
                    /* Ignore the error */
                });
                if (e instanceof HttpException) {
                    throw e;   
                }
                throw new UnprocessableEntityException();
            }
        }

        return userProfile;
    }
}

