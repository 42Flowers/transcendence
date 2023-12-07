import { HttpException } from "@nestjs/common";

export async function exceptionHandler<T>(p: Promise<T>): Promise<T> {
    try {
        return await p;
    } catch (e) {
        if (e instanceof HttpException) {
            throw e;
        }
        throw e;
    }
}
