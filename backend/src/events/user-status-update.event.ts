
export enum OnlineStatus {
    Online,
    Offline,
    InGame,
};

export class UserStatusUpdateEvent {
    constructor(public readonly userId: number, public readonly onlineStatus: OnlineStatus) {}
}
