/**
 * The user token payload directly extracted from the JWT token
 */
export interface UserPayload {
    /**
     * The user ID as a string.
     * Coming directly from the JWT token.
     */
    sub: string;

    /**
     * The effective user ID retrieved from the database.
     */
    id: number;

    /**
     * The username.
     */
    pseudo: string | null;
}
