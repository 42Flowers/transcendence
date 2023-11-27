import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    providers: [ MailService ],
    imports: [
        HttpModule.registerAsync({
            imports: [ ConfigModule ],
            inject: [ ConfigService ],
            useFactory: async (configService: ConfigService) => {
                return {
                    baseURL: 'https://api.eu.mailgun.net/v3',
                    timeout: 5000,
                    auth: {
                        username: 'api',
                        password: '***REMOVED***',
                    },
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                };
            },
        })
    ],
    exports: [ MailService ],
    controllers: [],
})
export class MailModule {}
