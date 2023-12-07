import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

@Module({
    providers: [ UsersService ],
    controllers: [ UsersController ],
    imports: []
})
export class TestModule {}
/* TODO rename me plz */
