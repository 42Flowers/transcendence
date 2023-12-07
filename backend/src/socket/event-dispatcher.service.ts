import { Injectable } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { OnEvent } from "@nestjs/event-emitter";
import { AchievementGrantedEvent } from "src/events/achievement-granted.event";

@Injectable()
export class EventDispatcherService {
    constructor(private readonly socketService: SocketService) {}

    @OnEvent('achievement.granted')
    handleAchievementGranted({ userId, achievement }: AchievementGrantedEvent) {
        this.socketService.emitToUserSockets(userId, 'achievement.granted', achievement);
    }
}