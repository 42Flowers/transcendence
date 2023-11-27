import { BadRequestException, Body, Controller, ForbiddenException, Post, Request, UnauthorizedException, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumberString, IsString, Length } from 'class-validator';
import { Request as ExpressRequest } from 'express';
import { AuthService } from './auth.service';
import { TicketGuard } from './ticket.guard';
import { TicketPayload } from './ticket.service';

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

export class VerifyEmailDto {
    @IsString()
    ticket: string;

    @Length(6, 6)
    @IsNumberString()
    code: string;
}

export class SendVerificationMailDto {
    @IsString()
    ticket: string;
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

    // @UseGuards(TicketGuard)
    // @Post('/mfa/email')
    // async verifyEmail(@Body() { code }: VerifyEmailDto, @Request() req: ExpressRequest) {
    //     try {
    //         return await this.authService.verifyEmailCode(req.ticket!, parseInt(code, 10));
    //     } catch {
    //         throw new UnauthorizedException();
    //     }
    // }

    // @UseGuards(TicketGuard)
    // @Post('/mfa/email/send')
    // async sendVerificationMail(@Body() {}: SendVerificationMailDto, @Request() req: ExpressRequest) {
    //     try {
    //         return await this.authService.sendEmailVerification(req.ticket!);
    //     } catch {
    //         throw new UnauthorizedException();
    //     }
    // }
}

declare global {
    namespace Express {
        export interface Request {
            ticket?: TicketPayload;
        }
    }
}