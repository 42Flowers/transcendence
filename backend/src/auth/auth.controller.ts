import { Controller, Post, Body, UsePipes, ValidationPipe, BadRequestException, ForbiddenException } from '@nestjs/common';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { AuthService } from './auth.service';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

export enum AuthorizationProviderType {
    FortyTwo = 'ft',
}

export class AuthorizeCodeDto {
    @ApiProperty({ })
    @IsString()
    @IsNotEmpty()
    code: string;

    @ApiProperty({ enum: AuthorizationProviderType })
    @IsEnum(AuthorizationProviderType)
    provider: AuthorizationProviderType;
}

@Controller({
    version: '1',
    path: 'auth',
})
@ApiTags('Authentication')
@UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
}))
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/authorize_code')
    async authorizeCode(@Body() { provider, code }: AuthorizeCodeDto) {
        if (provider !== 'ft')
            throw new BadRequestException();

        try {
            const token = await this.authService.authorizeCodeFortyTwo(code);
            return { token };
        } catch {
            throw new ForbiddenException();
        }
    }
}