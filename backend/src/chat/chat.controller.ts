import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get(':userId/friends-list')
  async getFriendsList(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getFriendsList(userId);
  }

  @Get(':userId/channels-list')
  async getChannelList(@Param('userId', ParseIntPipe) userId: number) {
    console.log('bouuuuh', userId);
    return this.chatService.getChannelList(userId);
  }

  @Get(':userId/channels')
  async getChatChannel(@Param('userId', ParseIntPipe) userId: number) {
    return this.chatService.getChatChannel(userId);
  }
}
