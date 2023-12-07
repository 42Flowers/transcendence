
export class UsernameUpdateEvent {
    constructor(
        public readonly userId: number,
        public readonly oldUsername: string | null,
        public readonly newUsername: string) {}
}
