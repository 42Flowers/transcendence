/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsInt, MinLength, MaxLength, IsNumber, Min } from 'class-validator';
import { IsNoSpecialCharacters } from './profile.pipe';

export class CreateUserAchievementDto {
    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    achievementId: number;
}

export class ChangePseudoDto {
    @IsNotEmpty()
    @IsString()
    @IsNoSpecialCharacters()
    @MinLength(3)
    @MaxLength(32)
    pseudo: string
}

export class AvatarDto {
    @IsString()
    @IsNotEmpty()
    filename: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    userId: number;
}