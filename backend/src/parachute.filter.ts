import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { PrismaClientKnownRequestError, PrismaClientUnknownRequestError } from "@prisma/client/runtime/library";
import { Response } from "express";

@Catch(PrismaClientKnownRequestError, PrismaClientUnknownRequestError)
export class ParachuteExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();

        console.log('Caught', exception);
        
        res.status(400).json({});
    }
}
