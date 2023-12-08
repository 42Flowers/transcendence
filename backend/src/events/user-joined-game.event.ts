
export class UserJoinedGameEvent {
    constructor(public readonly userId: number,
        public readonly roomName: string) {}
}