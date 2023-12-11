import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
    imports: [
        JwtModule.registerAsync({ 
            useFactory: (config: ConfigService) => ({
                secret: config.getOrThrow<string>('JWT_SECRET'),
                global: true,
                signOptions: {
    
                },
            }),
            inject: [ ConfigService ],
        }),
    ],
    exports: [ JwtModule ],
})
export class GlobalJwtModule {}