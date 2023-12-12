/* eslint-disable prettier/prettier */
import { IsNotEmpty, IsString, IsInt, MinLength, MaxLength, Min, Max, IsPositive } from 'class-validator';
import { IsNoSpecialCharacters } from './profile.pipe';

export class CreateUserAchievementDto {
    @IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
    achievementId: number;
}

export class ChangePseudoDto {
    @IsNotEmpty()
    @IsString()
    @IsNoSpecialCharacters()
    @MinLength(3)
    @MaxLength(10)
    pseudo: string
}

export class AvatarDto {
    @IsString()
    @IsNotEmpty()
    filename: string;

    @IsInt()
    @IsNotEmpty()
	@Max(1000000)
    @Min(1)
	@IsPositive()
    userId: number;
}