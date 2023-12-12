import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { randomBytes } from 'node:crypto';

@Global()
@Module({
    imports: [
        JwtModule.registerAsync({ 
            useFactory: () => ({
                secret: randomBytes(32).toString('hex'),
                global: true,
                signOptions: {
                    
                },
            }),
        }),
    ],
    exports: [ JwtModule ],
})
export class GlobalJwtModule {}