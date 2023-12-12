/* eslint-disable prettier/prettier */
import { PipeTransform, Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

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
        }); 
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return intValue;
    }
}