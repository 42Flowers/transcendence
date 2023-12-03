/**
 * The user token payload directly extracted from the JWT token
 */
export interface UserPayload {
    /**
     * The user ID as a string.
     */
    sub: string;
}
