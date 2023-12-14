import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { firstValueFrom, catchError } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

interface FortyTwoAccessToken {
    access_token: string;
}

interface AuthorizeCodeResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
    created_at: number;
    secret_valid_until: number;
}

interface TokenInfo {
    resource_owner_id: number;
    scopes: string[];
    expires_in_seconds: number;
    application: {
        uid: string;
    };
    created_at: number;
}

@Injectable()
export class FortyTwoService {
    constructor(private httpService: HttpService,
                private configService: ConfigService) {}

    async authorizeWithCode(code: string): Promise<AuthorizeCodeResponse> {
        const { data } = await firstValueFrom(
            this.httpService.post<AuthorizeCodeResponse>('/oauth/token', {
                grant_type: 'authorization_code',
                client_id: this.configService.get('FT_APP_ID'),
                client_secret: this.configService.get('FT_APP_SECRET'),
                code,
                redirect_uri: this.configService.get<string>('FT_REDIRECT_URI'),
            }).pipe(
                catchError((error: AxiosError) => {
                    console.warn(error.message, error.response.status);
                    if (error.response.status === 401)
                        throw new UnauthorizedException();
                    throw 'An error happened';
                })
            ));
        return data;
    }

    async fetchTokenInfo(token: FortyTwoAccessToken | string): Promise<TokenInfo> {
        let access_token: string;
        
        if (typeof token === 'object') {
            access_token = token.access_token;
        } else {
            access_token = token;
        }

        const { data } = await firstValueFrom(
            this.httpService.get<TokenInfo>('/oauth/token/info', {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            }).pipe(
                catchError((error: AxiosError) => {
                    if (error.response.status === 401)
                        throw new UnauthorizedException();
                    throw 'An error happened';
                })
            )
        );
        return data;
    }
}