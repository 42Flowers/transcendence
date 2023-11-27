import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

interface MailgunResponse {
    id: string;
    message: string;
}

@Injectable()
export class MailService {
    private defaultDomain: string;

    constructor(private readonly httpService: HttpService) {
        this.defaultDomain = 'mail.sorex.dev';
    }

    private async sendTemplateMail(recipient: string, template: string, variables: Record<string, any> = {}, domain?: string) {
        const { data } = await firstValueFrom(
            this.httpService.post<MailgunResponse>(`/${domain || this.defaultDomain}/messages`, {
                    to: recipient,
                    template,
                    'h:X-Mailgun-Variables': JSON.stringify(variables),
                }
            ).pipe(
                catchError((error: AxiosError) => {
                    throw error;
                }),
            ),
        );

        return data;
    }

    async sendConfirmationMail(recipient: string, authorizationCode: string, domain?: string) {
        return this.sendTemplateMail(recipient, 'confirmation code', {
            'authorization_code': authorizationCode,
        }, domain);
    }
}
