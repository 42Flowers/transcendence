import { BadRequestException, Body, Controller, Get, HttpStatus, NotFoundException, Param, ParseFilePipeBuilder, ParseIntPipe, Patch, Post, Request, UnprocessableEntityException, UploadedFile, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from "src/auth/auth.guard";
import { UsersService } from "./users.service";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";
import { AllowIncompleteProfile } from "src/auth/allow-incomplete-profile.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import sizeOf from 'image-size';
import { ProfileService } from "src/profile/profile.service";
import { diskStorage } from "multer";

export class PatchProfileDto {
    @IsOptional()
    @Length(3, 10)
    pseudo: string;

    @IsOptional()
    @IsEmail()
    email: string;
}

export class CompleteProfileDto {
    @Length(3, 10)
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

    @Patch('/@me')
    @AllowIncompleteProfile()
    async patchSelfProfile(
        @Request() req: ExpressRequest,
        @Body() body: PatchProfileDto
    ) {
        /* TODO test username for special characters */

        const userId = Number(req.user.sub);
        const userProfile = await this.usersService.patchUserProfile(userId, body);

        if (null === userProfile) {
            throw new NotFoundException();
        }

        return userProfile;
    }

    @Post('/complete-profile')
    @AllowIncompleteProfile()
    @UseInterceptors(FileInterceptor('avatar', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req: ExpressRequest, file, callback) => {
                const extension = file.originalname.split(".").at(-1);
                const newFileName = `${req.user.id}_${Date.now()}.${extension}`;

                callback(null, newFileName);
            }
        }),
    }))
    async completeProfile(
        @Request() req: ExpressRequest,
        @Body() body: CompleteProfileDto,
        @UploadedFile(new ParseFilePipeBuilder()
        .addFileTypeValidator({
            fileType: /^(image\/jpeg|image\/png)$/
        })
        .addMaxSizeValidator({
            maxSize: 1000042
        })
        .build({
            errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
    ) avatar: Express.Multer.File) {

        const userId = req.user.id;

        if (!avatar) {
            throw new BadRequestException("Avatar is not an image");
        } else {
            // Check image dimensions
            const dimensions = sizeOf(avatar.path);
            if (dimensions.width > 1000 || dimensions.height > 1000) {
                throw new BadRequestException('Invalid image dimensions');
            }
            try {
                await this.usersService.patchUserProfile(userId, {
                    pseudo: body.pseudo,
                });
                await this.profileService.addAvatar(avatar.filename, userId);
            
                /** TODO mdrrr un peu too much non ? */
                return await this.profileService.getProfileInfos(userId);
            } catch {
                throw new UnprocessableEntityException();
            }
        }
    }
}
