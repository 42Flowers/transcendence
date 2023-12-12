import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { ProfileModule } from "src/profile/profile.module";

@Module({
    providers: [ UsersService ],
    controllers: [ UsersController ],
    imports: [ ProfileModule ]
})
export class TestModule {}
/* TODO rename me plz */
