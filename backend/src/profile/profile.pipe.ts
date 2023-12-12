/* eslint-disable prettier/prettier */
import { PipeTransform, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

@Injectable()
export class CheckIntPipe implements PipeTransform {
    constructor(private prismaService: PrismaService) {}

    async transform(value: any) {
        if (value.length > 16) {
            throw new BadRequestException('Validation failed: parameter exceeds maximum limit');
        }

        const intValue = parseInt(value, 10);
        if (isNaN(intValue)) {
            throw new BadRequestException('Validation failed: parameter must be an integer');
        }
        // parseInt converts the number part of the string to an integer, resulting in 13 if userId was '13fgrezf'
        if (intValue.toString() !== value) {
            throw new BadRequestException('Validation failed: parameter must be an integer');
        }
        if (intValue > 1000000) {
            throw new BadRequestException('Validation failed: parameter exceeds maximum limit');
        }
        if (intValue < 1) {
            throw new BadRequestException('Validation failed: userId must be at least 1');
        }

        const user = await this.prismaService.user.findUnique({ 
            where: { 
                id: intValue 
            },
            select: {
                id: true,
            } 
        }); //TODO selectionner ce dont tu ad besoin ? 
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return intValue;
    }
}

export function IsNoSpecialCharacters(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
        name: 'isNoSpecialCharacters',
        target: object.constructor,
        propertyName: propertyName,
        options: validationOptions,
        validator: {
            validate(value: any, args: ValidationArguments) {
                return typeof value === 'string' && /^[a-zA-Z0-9-]+$/.test(value);
            },
            defaultMessage(args: ValidationArguments) {
                return 'Only a to z, A to Z, 0 to 9, and "-" are allowed';
            }
        }
        });
    };
}
