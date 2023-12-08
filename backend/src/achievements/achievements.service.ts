import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Achievement } from "@prisma/client";
import { AchievementGrantedEvent } from "src/events/achievement-granted.event";
import { AvatarUpdatedEvent } from "src/events/avatar-updated.event";
import { GameEndedEvent } from "src/events/game-ended.event";
import { UserJoinedGameEvent } from "src/events/user-joined-game.event";
import { UsernameUpdateEvent } from "src/events/username-update.event";
import { Game } from "src/game/game";
import { PrismaService } from "src/prisma/prisma.service";

export const ACHIEVEMENT_NEW_USERNAME = 'new-username';

@Injectable()
export class AchievementsService {
    constructor(private readonly prismaService: PrismaService,
        private readonly eventEmitter: EventEmitter2) {}

    async listAchievements(userId: number): Promise<any> {
        const allAchievementsUnlocked = await this.prismaService.userAchievement.findMany({
            where: {
                userId,
            },
            include: {
                achievement: true,
            }
        });

        return allAchievementsUnlocked.map(({ achievement }) => achievement);
    }

    private async getAchievementFromSlug(slug: string): Promise<Achievement | null> {
        return await this.prismaService.achievement.findUnique({ where: { slug }});
    }

    async hasAchievement(userId: number, slug: string): Promise<boolean> {
        const achievement = await this.getAchievementFromSlug(slug);

        if (achievement === null) {
            /**
             * If the achievement is not found, let's considerer there's no chance the user have it.
             */
            return false;
        }
        
        return null !== (await this.prismaService.userAchievement.findFirst({
            where: {
                userId,
                achievementId: achievement.id,
            },
        }));
    }

    async grantAchievementToUser(userId: number, slug: string): Promise<void> {
        console.debug(`Granting ${slug} to ${userId}`);
        try {
            const achievement = await this.getAchievementFromSlug(slug);

            if (!achievement) {
                throw new Error('Achievement does not exist');
            }

            if (await this.hasAchievement(userId, slug)) {
                return ;
            }

            await this.prismaService.userAchievement.create({
                data: {
                    achievementId: achievement.id,
                    userId,
                },
            });

            this.eventEmitter.emit('achievement.granted', new AchievementGrantedEvent(
                userId,
                achievement
            ));
        } catch (e: any) {
            let errorMessage = 'Unknown exception';

            if (null !== e && typeof e === 'object' && 'message' in e) {
                const err = e as Error;

                errorMessage = err.message;
            }

            console.warn(`Failed to grant ${slug} to user ${userId}: ${errorMessage}`);
        }
    }

    @OnEvent('username.update')
    handleUsernameChanged(evt: UsernameUpdateEvent) {
        if (evt.oldUsername !== null) {
            /* Don't grant the achievement when setting the username for the first time as a 42 user, only grant it on your first username change. */

            /* Ensure we ACTUALLY changed the username to something */
            if (evt.newUsername !== null) {
                this.grantAchievementToUser(evt.userId, 'new-username');
            }
        }
    }

    @OnEvent('avatar.updated')
    handleAvatarUpdated(evt: AvatarUpdatedEvent) {
        this.grantAchievementToUser(evt.userId, 'new-avatar');
    }

    @OnEvent('game.ended')
    handleGameEnded({ game }: GameEndedEvent) {
        const perfectWin = Math.abs(game.getLeftPlayerScore() - game.getRightPlayerScore()) === 3;
        const leftPlayer = game.getLeftPlayerUser();
        const rightPlayer = game.getRightPlayerUser();

        /* Grant "First Game" achievement */
        this.grantAchievementToUser(leftPlayer.id, 'first-game');
        this.grantAchievementToUser(rightPlayer.id, 'first-game');

        /* Grant "Perfect Win" and "Perfect Loose" achievement */
        if (game.getLeftPlayerScore() === 0 && game.getRightPlayerScore() === 3) {
            this.grantAchievementToUser(leftPlayer.id, 'loose-10-0');
            this.grantAchievementToUser(rightPlayer.id, 'won-10-0');
        }

        if (game.getLeftPlayerScore() === 3 && game.getRightPlayerScore() === 0) {
            this.grantAchievementToUser(rightPlayer.id, 'loose-10-0');
            this.grantAchievementToUser(leftPlayer.id, 'won-10-0');
        }
        

    }
}