import { Module } from "@nestjs/common";
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
    providers: [ PrismaService, UsersService ],
    controllers: [ UsersController ],
    imports: []
})
export class TestModule {}
/* TODO rename me plz */
