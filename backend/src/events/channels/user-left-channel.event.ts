
/**
 * Sent when a user leaves a channel.
 * 
 * Used to notify clients of a member list change.
 */
export class UserLeftChannelEvent {
    constructor(public readonly channelId: number,
        public readonly userId: number) {}
}
