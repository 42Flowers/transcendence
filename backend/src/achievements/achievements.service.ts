import { Injectable } from "@nestjs/common";
import { EventEmitter2, OnEvent } from "@nestjs/event-emitter";
import { Achievement } from "@prisma/client";
import { AchievementGrantedEvent } from "src/events/achievement-granted.event";
import { AvatarUpdatedEvent } from "src/events/avatar-updated.event";
import { UsernameUpdateEvent } from "src/events/username-update.event";
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
}