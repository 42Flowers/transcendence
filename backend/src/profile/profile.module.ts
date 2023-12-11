/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { AchievementsModule } from "src/achievements/achievements.module";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";

@Module({
    controllers: [ ProfileController ],
    providers: [
        ProfileService,
    ],
    imports: [
        AchievementsModule,
    ],
})
export class ProfileModule {}