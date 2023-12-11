
export class UserLeftGameEvent {
    constructor(public readonly userId: number,
        public readonly roomName: string) {}
}