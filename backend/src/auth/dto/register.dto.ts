import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, Length, ValidationOptions, registerDecorator, ValidationArguments, MaxLength } from "class-validator";

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
    @Length(3, 10)
    pseudo: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
	@MaxLength(20)
    password: string;

    @ApiProperty()
    @Match('password', { message: 'Passwords does not match' })
    password_confirm: string;
}
