import { Reflector } from "@nestjs/core";

/**
 * Don't return 403 Forbidden upon calling the request if the username is null (incomplete profile).
 * This is useful for routes that *NEEDS* a connected user, but allows for incomplete profiles (PATCH /users/@me, ...)
 */
export const AllowIncompleteProfile = Reflector.createDecorator();
