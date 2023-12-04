import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtModule, JwtService } from "@nestjs/jwt";

@Module({
    // providers: [ UsersService]
    providers: [ PrismaService ],
    controllers: [ UsersController ],
    imports: [  ]
})
export class TestModule {}
