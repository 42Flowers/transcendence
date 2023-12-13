import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, Length, IsString, ValidationOptions, registerDecorator, ValidationArguments, MaxLength, MinLength } from "class-validator";
import { IsNoSpecialCharacters } from "src/profile/profile.pipe";

function Match(property: string, validationOptions?: ValidationOptions) {
    return (object: any, propertyName: string) => {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    return value === relatedValue;
                },
            },
        });
    };
}

export class UserRegisterDto { 
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsNoSpecialCharacters()
    @MinLength(3)
    @MaxLength(10)
    pseudo: string;

    @ApiProperty()
    @IsEmail()
    @IsString()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
	@MinLength(3)
	@MaxLength(20)
    @IsString()
    password: string;

    @ApiProperty()
    @Match('password', { message: 'Passwords does not match' })
    password_confirm: string;
}
