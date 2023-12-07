/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { ProfileController } from "./profile.controller";
import { ProfileService } from "./profile.service";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from "path";
import { AchievementsModule } from "src/achievements/achievements.module";

@Module({
    controllers: [ ProfileController ],
    providers: [
        ProfileService,
    ],
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/static/',
        }),
        AchievementsModule,
    ],
})
export class ProfileModule {}