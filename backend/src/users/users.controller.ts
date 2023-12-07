import { Body, Controller, Get, NotFoundException, Param, ParseIntPipe, Patch, Request, UseGuards, UsePipes, ValidationPipe } from "@nestjs/common";
import { Request as ExpressRequest } from 'express';
import { AuthGuard } from "src/auth/auth.guard";
import { UsersService } from "./users.service";
import { IsEmail, IsOptional, IsString, Length } from "class-validator";

export class PatchProfileDto {
    @IsOptional()
    @Length(3, 32)
    pseudo: string;

    @IsOptional()
    @IsEmail()
    email: string;
}

@Controller({
    version: '1',
    path: '/users',
})
@UsePipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }))
@UseGuards(AuthGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('/@me')
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
}
