import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { TicketService } from './ticket.service';

@Injectable()
export class TicketGuard implements CanActivate {
    constructor(private readonly ticketService: TicketService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const req = context.switchToHttp().getRequest<Request>();
            const { body } = req;

            if (!('ticket' in body)) {
                throw new ForbiddenException();
            }

            const ticket = await this.ticketService.verifyTicket(body.ticket as string);

            req['ticket'] = ticket;
            return true;
        } catch {
            throw new UnauthorizedException();
        }
    }   
}
