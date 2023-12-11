
export class AvatarUpdatedEvent {
    constructor(public readonly userId: number,
                public readonly avatar: string) {}
}