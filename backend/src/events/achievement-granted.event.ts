import { Achievement } from "@prisma/client";

export class AchievementGrantedEvent {
    constructor(public readonly userId: number,
        public readonly achievement: Achievement) {}
}
