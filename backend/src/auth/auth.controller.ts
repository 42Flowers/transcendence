import { BadRequestException, Body, Controller, ForbiddenException, Get, Patch, Post, Request, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { UserRegisterDto } from './dto/register.dto';
import { TicketGuard } from './ticket.guard';
import { TicketPayload } from './ticket.service';
import { AuthGuard } from './auth.guard';

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

export class PasswordLoginDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;
}

export class VerifyOtpDto {
    @IsString()
    ticket: string;

    @Length(6, 6)
    @IsNumberString()
    code: string;
}

export class UpdateMfaDto {
    @Length(6, 6)
    @IsNumberString()
    code: string;

    @IsBoolean()
    state: boolean;
}

@Controller({
    version: '1',
    path: 'auth',
})
@ApiTags('Authentication')
@UsePipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    exceptionFactory(errors) {
        return new BadRequestException({
            errors: errors.reduce((errors, { property, constraints }) => ({
                ...errors,
                [property]: Object.values(constraints)[0],
            }), {}),
            statusCode: 400,
            message: 'Invalid form fields',
        });
    },
}))
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('/authorize_code')
    async authorizeCode(@Body() { provider, code }: AuthorizeCodeDto) {
        if (provider !== 'ft')
            throw new BadRequestException();
        try {
            const token = await this.authService.authorizeCodeFortyTwo(code);
            
            return token;
        } catch {
            throw new ForbiddenException();
        }
    }

    @Post('/login')
    async loginWithPassword(@Body() { email, password }: PasswordLoginDto) {
        try {
            return await this.authService.loginWithPassword(email, password);
        } catch {
            throw new UnauthorizedException();
        }
    }

    @UseGuards(TicketGuard)
    @Post('/mfa/otp')
    async verifyOtp(@Body() { code }: VerifyOtpDto, @Request() req: ExpressRequest) {
        try {
            return await this.authService.verifyOtpCode(req.ticket!, code);
        } catch {
            throw new UnauthorizedException();
        }
    }

    @Post('/register')
    async registerUser(@Body() payload: UserRegisterDto) {
        return await this.authService.registerUser(payload);
    }

    @Post('/mfa/generate')
    @UseGuards(AuthGuard)
    async generateSecretKey(@Request() req: ExpressRequest) {
        const userId = Number(req.user.sub);
        const mfa = await this.authService.generateSecretKey(userId);

        return mfa;
    }

    @Patch('/mfa')
    @UseGuards(AuthGuard)
    async patchMfaState(
        @Request() req: ExpressRequest,
        @Body() { code, state }: UpdateMfaDto) {

        const userId = Number(req.user.sub);
        await this.authService.updateMfa(userId, state, code);
    }

    @Get('/mfa/status')
    @UseGuards(AuthGuard)
    async getMfaStatus(
        @Request() req: ExpressRequest
    ) {
        const userId = Number(req.user.sub);
        const status = await this.authService.getMfaStatus(userId);

        return {
            status,
        };
    }
}

declare global {
    namespace Express {
        export interface Request {
            ticket?: TicketPayload;
        }
    }
}
