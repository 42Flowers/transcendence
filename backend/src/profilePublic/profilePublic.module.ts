/* eslint-disable prettier/prettier */
import { Module } from "@nestjs/common";
import { ProfilePublicController } from "./profilePublic.controller";
import { ProfilePublicService } from "./profilePublic.service";
import { PrismaService } from "src/prisma/prisma.service";
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from "path";

@Module({
    controllers: [ProfilePublicController],
    providers: [
        ProfilePublicService,
        PrismaService
    ],
    imports: [
        ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'uploads'),
            serveRoot: '/static/',
        }),
    ],
})
export class ProfilePublicModule {
    constructor() {
    console.log(join(__dirname, '..', '..', '..', 'uploads')); // TODO: remove
}}