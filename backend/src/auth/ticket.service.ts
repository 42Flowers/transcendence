import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as crypto from 'node:crypto';

export type MfaMethods = 'sms' | 'email' | 'otp' | 'remote';

export interface TicketPayload {
    userId: number;
    ticketId: number;
}

@Injectable()
export class TicketService {    
    constructor(private prismaService: PrismaService) {}

    private encodeTicketId(ticketId: number): string {
        const buf = Buffer.alloc(4);
        buf.writeInt32BE(ticketId);

        return buf.toString('base64url');
    }

    private decodeTicketId(ticketId: string): number {
        const buf = Buffer.from(ticketId, 'base64url');

        return buf.readInt32BE();
    }

    async generateTicket(userId: number, methods: MfaMethods[]) {
        const ticket = await this.prismaService.ticket.create({
            data: {
                user: {
                    connect: {
                        id: userId,
                    }
                },
            },
        });

        const encodedUserId = Buffer.from(userId.toString(10)).toString('base64url');
        const encodedTicketId = this.encodeTicketId(ticket.id);
        const payload = encodedUserId.concat('.', encodedTicketId);

        const hmac = crypto.createHmac('sha256', 'banana');
        hmac.update(payload, 'utf-8');

        return payload.concat('.', hmac.digest('base64url'));
    }

    async verifyTicket(ticket: string): Promise<TicketPayload> {
        const parts = ticket.split('.');

        if (parts.length !== 3) {
            throw 'Invalid ticket';
        }

        const hmac = crypto.createHmac('sha256', 'banana');
        hmac.update(parts[0].concat('.', parts[1]), 'utf-8');
        if (hmac.digest('base64url') !== parts[2]) {
            throw 'Invalid signature';
        }

        const userId = parseInt(Buffer.from(parts[0], 'base64url').toString('utf-8'), 10);
        const ticketId = this.decodeTicketId(parts[1]);

        const ticketObj = await this.prismaService.ticket.findFirstOrThrow({
            where: {
                userId,
                id: ticketId,
            },
        });

        return {
            userId,
            ticketId,
        }
    }
}