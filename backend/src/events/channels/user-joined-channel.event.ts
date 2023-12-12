
export class UserJoinedChannelEvent {
    constructor(public readonly channelId: number,
        public readonly userId: number) {}
}
