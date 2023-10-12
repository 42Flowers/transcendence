import { Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AuthGuard } from 'src/auth/auth.guard';
import { FriendsService } from './friends.service';

enum FriendshipStatus {
    Pending = 'pending',
    Accepted = 'accepted',
    Blocked = 'blocked',
}

class ListFriendsDto {
    @IsOptional()
    @IsEnum(FriendshipStatus)
    status?: FriendshipStatus;
}

@Controller({
    version: '1',
    path: 'friends',
})
// @UseGuards(AuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class FriendsController {
    constructor(private friendsService: FriendsService) {}

    @Get('/')
    async listFriends(@Query() queryParams: ListFriendsDto) {
        console.log(queryParams);
        return [
            'You have no friends, looser...',
        ];
    }

    @Delete('/:id')
    async deleteFriend(@Param('id') id: number) {
        console.log('Deleting', id);
    }

    @Post('/')
    async sendFriendRequest() {

    }

    @Patch('/:id')
    async patchFriendship() {
        /* Here we can block/unblock friends */
    }

}