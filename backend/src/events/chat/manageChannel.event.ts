
export class ChatManageChannelEvent {
	constructor(public userId: number, public type: string, public roomId: number, public roomName: string, public option: any) {}
}