
export class ChatChannelMessageEvent2 {
	public static readonly EVENT_NAME = 'channel.message2';

    constructor(
        public readonly id: number,
        public readonly authorId: number,
        public readonly channelId: number,
        public readonly content: string) {}
}
