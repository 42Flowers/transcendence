// import { forwardRef, Inject, Injectable } from '@nestjs/common';
// import { Socket } from 'socket.io';
// import { UsersService } from '../users_chat/DBusers.service';
// import { RoomService } from '../rooms/DBrooms.service';
// import { SocketGateway } from '../socket/socket.gateway'
// import { v4 as uuidv4 } from 'uuid';
// import { MessageService } from '../messages/messages.service'
// import { ConversationsService } from '../conversations/conversations.services'
// import { PrismaClient } from '@prisma/client';
// import { SocketService } from 'src/socket/socket.service';

// /**
//  * TODO Recoder les fonctions avec prisma
//  * TODO Les messages purée
//  */


// @Injectable()
// export class ChatService {
// 	constructor(
// 		private readonly usersService: UsersService,
// 		private readonly roomService: RoomService,
// 		@Inject(forwardRef(() => SocketGateway))
// 		private readonly socketGateway: SocketGateway,
// 		private readonly messagesService: MessageService,
// 		private readonly conversationsService: ConversationsService,
// 		private readonly prismaService : PrismaClient,
// 		private readonly socketService: SocketService
// 		) {}

// 	async chatUser(
// 		client: Socket, 
// 		data : {type: string, option: {target: string}} // il faut trouver ce que ça va être
// 		) {
// 		//TODO: enelever tout ce qui relève de l'authentification, mais plus tard
// 		//TODO: gérer block
// 		// console.log('userid in user: ', data);
// 		// if(this.usersService.alreadyRegisterdByName() != undefined) {
// 		// 	console.log("already registerd, updating socket...");
// 		// 	this.usersService.updateSocketId(data, client.id);
// 		// 	this.usersService.updateSocket(data, client);
// 		// }
// 		// else if (this.usersService.alreadyRegisterdById(data) != undefined) {
// 		// 	console.log("already registered, updating name...");
// 		// 	this.usersService.updateName(data, client.id);
// 		// }
// 		// else {
// 		// 	console.log("Registering...");
// 		// 	this.socketGateway.server.to('server').emit('usersConnected', {type: 'new', user: data});
// 		// 	client.join('server');
// 		// 	this.usersService.addUser(client.id, client, data);
// 		// 	client.broadcast.emit('newUser', {id: client.id, name: data});
// 		// }
// 		// console.log(data);
// 		if (data.type == "block") {
// 			const user = this.usersService.getUserById(client.id); //pb ici
// 			const target = this.usersService.getUserbyName(data.option.target);
// 			if (target !== null)
// 			{
// 				const block = await this.prismaService.blocked.create({
// 					data: {
// 						userId: user.id,
// 						blockedId: target.id
// 					}
// 				});
// 				if (block == null) {
// 					const msg = "Couln't block " + target.name;
// 					this.socketGateway.sendToClient(user.id, 'block', data);
// 				} else {
// 					const msg = target.name + ' has been blocked';
// 					this.socketGateway.sendToClient(user.id, 'block', msg);
// 				}
// 			}
// 		}
// 	}

// 	async chatMessage(
// 		client: Socket,
// 		data: {type: string, to: string, message: string, options: string}
// 	) {
// 		const user = await this.usersService.getUserById(client.id); //! Il me fait le token
// 		if (data.type === 'private') {
// 			if (data.to != user?.name && data.to != '') {
// 				const dest = await this.usersService.getUserbyName(data.to);
// 				if (dest != undefined) {	
// 					if (this.usersService.isUserBlocked(user, dest))
// 					{
// 						const msg = dest.name + " has been blocked";
// 						this.socketGateway.sendToClient(user.id, 'blocked', msg)
// 						return;
// 					} else if (this.usersService.blockedByUser(user, dest)){
// 						const msg = dest.name + " has blocked you";
// 						this.socketGateway.sendToClient(user.id, 'blocked', msg);
// 						return;
// 					}
// 					let conversation = await this.conversationsService.conversationExists(user, dest);
// 					if (conversation === null) {
// 						conversation = this.conversationsService.createConversation(user, dest);
// 						client.join(conversation.id);
// 						dest.socket.join(conversation.id);
// 						this.socketGateway.server.to(conversation.id).emit('message')

// 						//créer la conversation pour les deux.
// 					}
// 					if (user.conversations.find((conv) => conv.with === dest) === undefined) {
// 						const id = uuidv4();
// 						client.join(id);
// 						dest.socket.join(id);
// 						user.conversations.push({with: dest, id: id});
// 						dest.conversations.push({with: user, id: id});
// 						console.log('creating conversation');
// 						this.socketGateway.server.to(id).emit('message', {from : user.pseudo, to: data.to, message: data.message});
// 					} else{
// 						console.log('existing conversation')
// 						const conversation = user.conversations.find((conv) => conv.with === dest);
// 						this.socketGateway.server.to(conversation.id).emit('message', {from : user.pseudo, to: data.to, message: data.message});
// 					}
// 				} else
// 					this.socketGateway.sendToClient(user.id, 'message', "No such connected user");
// 			} else { //the freak is that about ? 
// 				const essai = 'le broadcast';
// 				this.socketGateway.sendMessage(user.id, 'broadcast', {from: user.pseudo, to:'', message: data.message});
// 				this.socketGateway.server.emit('message', {from: user.pseudo, to: '', message: data.message});
// 			}
// 		} else if (data.type === 'channel') {
// 			if (this.roomService.roomExists(data.to)) {
// 				console.log('exists');
// 				if (this.roomService.isUserinRoom(user, data.to)) {
// 					const room = await this.roomService.getRoom(data.to);
// 					if (room !== null) {
// 						this.socketGateway.server.to(room.id).emit('message', {from : user.pseudo, to: data.to, message: data.message});
// 						return;
// 					}
// 				}
// 				const msg = data.to + " does not exist or you are not a member";
// 				this.socketGateway.sendToClient(user.id, 'channel', msg)
// 			}
// 		}
// 	}

// 	// chatMessage(
// 	// 	client: Socket,
// 	// 	data: {type: string, to: string, message: string, options: string}
// 	// ) {
// 	// 	console.log(this.usersService.getUsers());
// 	// 	console.log('received', data.message, ' ', data.type);
// 	// 	const user = this.usersService.getUserById(client.id);
// 	// 	if (data.type === 'priv') {
// 	// 		if (data.to != user?.name && data.to != '') {
// 	// 			const dest = this.usersService.getUserbyName(data.to);
// 	// 			if (dest != undefined) {	
// 	// 				if (user.conversations.find((conv) => conv.with === dest) === undefined) {
// 	// 					const id = uuidv4();
// 	// 					client.join(id);
// 	// 					dest.socket.join(id);
// 	// 					user.conversations.push({with: dest, id: id});
// 	// 					dest.conversations.push({with: user, id: id});
// 	// 					console.log('creating conversation');
// 	// 					this.socketGateway.server.to(id).emit('message', {from : user.pseudo, to: data.to, message: data.message});
// 	// 				}
// 	// 				else{
// 	// 					console.log('existing conversation')
// 	// 					const conversation = user.conversations.find((conv) => conv.with === dest);
// 	// 					this.socketGateway.server.to(conversation.id).emit('message', {from : user.pseudo, to: data.to, message: data.message});
// 	// 				}
// 	// 			}
// 	// 			else 
// 	// 				this.socketGateway.server.to(client.id).emit('message', "No such connected user");
// 	// 		}
// 	// 		else { //the freak is that about ? 
// 	// 			const essai = 'le broadcast';
// 	// 			this.socketGateway.server.emit('message', {from: user.pseudo, to: '', message: data.message});
// 	// 		}
// 	// 	}
// 	// 	else if (data.type === 'room') {
// 	// 		if (this.roomService.roomExists(data.to)) {
// 	// 			console.log('exists');
// 	// 			if (this.roomService.isUserinRoom(user, data.to)) {
// 	// 				const room = this.roomService.getRoom(data.to);
// 	// 				if (room !== undefined) {
// 	// 					this.socketGateway.server.to(room.id).emit('message', {from : user.pseudo, to: data.to, message: data.message});
// 	// 					return;
// 	// 				}
// 	// 			}
// 	// 		this.socketGateway.server.to(client.id).emit('error', {errmsg: 'This room does not exists or you are not a member'});
// 	// 		}
// 	// 	}
// 	// }


// 	// //TODO les erreur
// 	// /**
// 	//  * @param client 
// 	//  * @param data 
// 	//  * @returns 
// 	//  */
// 	// async chatRoom(
// 	// 	client: Socket, 
// 	// 	data: {type: string, roomname: string, option: any}
// 	// ) {
// 	// 	const user = this.prismaService.user.findUnique({where: {id : client.id}});
// 	// 	if (user) {
// 	// 		switch(data.type) {
// 	// 			case 'join': {
// 	// 				if (this.roomService.joinRoom(user, data.roomname, data.option) != undefined)
// 	// 					client.join(data.roomname);
// 	// 					// this.socketGateway.server.to(data.roomname).emit()
// 	// 					//dire aux gens qui sont dans la room qu'il a rejoin
// 	// 				break; 
// 	// 			}
// 	// 			case 'exit': {
// 	// 				if (this.prismaService.channel.findUnique({where: {name: data.roomname}}) != undefined) {
// 	// 					const channel = this.prismaService.channel.findUnique({where: {name: data.roomname}});
// 	// 					this.prismaService.channelMembership.delete({where: {}});
// 	// 					//? faire une vérification supplémentaire ?
// 	// 					user.socket.leave(data.roomname);
// 	// 					//TODO prévenir les autres dans la room qu'il est parti
// 	// 				}
// 	// 				break;
// 	// 			}
// 	// 			case 'invited': {
// 	// 				const channel = this.prismaService.channel.findUnique({where: {name: data.roomname}});
// 	// 				if (channel != null) {
// 	// 					if (this.prismaService.channelMembership.findUnique({where: {channelId: channel.id, userId: user.id}}) == null){
// 	// 						this.roomService.joinRoom(user, data.roomname, data.option);
// 	// 						client.join(data.roomname);
// 	// 						// TODO prévenir tout le monde
// 	// 					}
// 	// 					// TODO prévenir qu'il est déjà dans la room
// 	// 				}
// 	// 				break;
// 	// 			}
// 	// 			case 'invite': {
// 	// 				const channel = this.roomService.getRoom(data.roomname);
// 	// 				if (channel != null) {
// 	// 					const membership = this.prismaService.channelMembership.findUnique({where: {channelId : channel.id, userId: user.id}});
// 	// 					if (membership.permissionMask == 1)
// 	// 						return; //trouver un meilleur moyen de sortir à ce moment là, erreur.
// 	// 					const invitedUser = this.prismaService.user.findUnique({where: {name: data.option.to}});
// 	// 					if (invitedUser != null && this.roomService.isUserinRoom(user, data.roomname) == null) {
// 	// 						this.socketGateway.server.to(invitedUser.socket.id).emit('room', {type: "invited", roomname: data.roomname, option: undefined}) // il faut que je me penche un peu plus la dessus
// 	// 					}
// 	// 					// TODO il faut que je fasse tous les messages d'erreur
// 	// 				}
// 	// 				break;
// 	// 			}
// 	// 			case 'manage': {
// 	// 				const channel = this.prismaService.channel.findUnique({where: {name: data.roomname}});
// 	// 				if (channel != null) {
// 	// 					if (this.roomService.isRoomAdmin(user, data.roomname)) {
// 	// 						switch (data.option.type) {
// 	// 							case 'kick': {
// 	// 								const result = this.roomService.kickUser(user, data.roomname, data.option.target);
// 	// 								if (result.status === false)
// 	// 									this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 								break;
// 	// 							}
// 	// 							case 'ban': {
// 	// 								const result = this.roomService.banUser(user, data.roomname, data.option.target);
// 	// 								if (result.status === false)
// 	// 									this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 								break;
// 	// 							}
// 	// 							case 'mute': {
// 	// 								const result = this.roomService.muteUser(user, data.roomname, data.option.target);
// 	// 								if (result.status === false)
// 	// 									this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 								break;
// 	// 							}
// 	// 							default: 
// 	// 								break;
// 	// 						}
// 	// 						if (this.roomService.isRoomOwner(user, data.roomname)) {
// 	// 							switch (data.option.type) {
// 	// 								case 'addAdmin': {
// 	// 									const result = this.roomService.addAdmin(data.roomname, data.option.target);
// 	// 									if (result.status === false)
// 	// 										this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 									break;
// 	// 								}
// 	// 								case 'kickAdmin': {
// 	// 									const result = this.roomService.kickAdmin(data.roomname, data.option.target);
// 	// 									if (result.status === false)
// 	// 										this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 									break;
// 	// 								}
// 	// 								case 'addPwd': {
// 	// 									const result = this.roomService.addPwd(data.roomname, data.option.target);
// 	// 									if (result.status === false)
// 	// 										this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 									break;
// 	// 								}
// 	// 								case 'rmPwd' : {
// 	// 									const result = this.roomService.rmPwd(data.roomname);
// 	// 									if (result.status === false)
// 	// 										this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 									break;
// 	// 								}
// 	// 								case 'changePwd' : {
// 	// 									const result = this.roomService.addPwd(data.roomname, data.option.target);
// 	// 									if (result.status === false)
// 	// 										this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 									break;
// 	// 								}
// 	// 								case 'addInvite' : {
// 	// 									const result = this.roomService.addInvite(data.roomname);
// 	// 									if (result.status === false)
// 	// 										this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 									break;
// 	// 								}
// 	// 								case 'rmInvite' : {
// 	// 									const result = this.roomService.rmInvite(data.roomname);
// 	// 									if (result.status === false)
// 	// 										this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 									break;
// 	// 								}
// 	// 								case 'delete' : {
// 	// 									this.roomService.clearUsersfromRoom(data.roomname);
// 	// 									this.messageService.clearMessagesfromChannel(data.roomname); // à coder
// 	// 									const result = this.roomService.deleteRoom(data.roomname);
// 	// 									if (result.status === false)
// 	// 									this.socketGateway.server.to(client.id).emit('error', result.msg);
// 	// 									//prévenir tous les gens qui étaient dans la room qu'elle a été supprimée.
// 	// 									// members.map(user => {user.socket.leave(data.roomname)});
// 	// 								}
// 	// 								default: 
// 	// 									break;
// 	// 							}
// 	// 						}
// 	// 					}
// 	// 				}
// 	// 			}
// 	// 			default: 
// 	// 				break;
// 	// 		}
// 	// 	}
// 	// }

// 	chatRoom( //! modifier cette fonction pour qu'elle renvoie par API et non pas par socket
// 		client: Socket,
// 		data: {type: string, roomname: string, roomId: number, option: any},
// 	) {
// 		const user = this.usersService.getUserById(client.id);
// 		if (data.type === 'join') {
// 			if (this.roomService.joinRoom(user, data.roomname, data.option)) {
// 				client.join(data.roomname);
// 				this.socketGateway.server.to(data.roomname).emit('message', {from: 'server', to: 'moi', message: user.pseudo + ' has joined this room'});
// 				this.socketGateway.server.to('server').emit('roomupdate', {type: 'add', room: data.roomname});
// 			}
// 			console.log(this.roomService.getRooms());
// 		} else if(data.type === 'exit') {
// 			if (this.roomService.roomExists(data.roomname)){
// 				if (this.roomService.isUserinRoom(user, data.roomname)) {
// 					this.roomService.removeUserfromRoom(user, data.roomname);
// 					client.leave(data.roomname);
// 					this.socketGateway.server.to(data.roomname).emit('message', {from: 'server', to: 'users', message: user.pseudo + ' has left this room'});
// 					console.log(this.roomService.getUsersfromRoom(data.roomname));
// 				} else
// 					this.socketGateway.sendToClient(user.id, 'channel', "You are not in this room");
// 			} else this.socketGateway.sendToClient(user.id, 'channel', "This channel does not exsits");
// 		} else if (data.type === 'invited') { //une fois invité il faut le mettre automatiquement dans la room
// 			if (this.roomService.roomExists(data.roomname)) {
// 				//il faut que je regarde: si la room existe, si il ne fait pas déjà partie de la room
// 				if (this.roomService.isUserinRoom(user, data.roomname)) {
// 					return 'already in room';
// 				} else {
// 					//inscrire dans la database qu'il a été invité dans une room, et du coup envoyer l'information au front
// 					this.socketGateway.server.to(client.id).emit('invite', {type: 'invited', roomname: data.roomname}); // revoir comment je rtansmets l'information
// 				}
// 			}
// 		}
// 		else if (data.type === 'manage') {
// 			//! Options for owner: addadmin, kickAdmin, changePwd, addPwd, rmPwd, addInvite, rmInvite
// 			//? invite, owners or administrators?
// 			//! Options for administrators: kick, ban and mute (expcept for the owner, and temporally)
// 			if (this.roomService.roomExists(data.roomname)) {
// 				if (data.option.type === 'invite') {
// 					const target = this.usersService.getUserbyName(data.option.target);
// 					if (target && !this.roomService.isUserinRoom(target, data.roomId)) {
// 						this.socketGateway.server.to(target.id).emit('room', {type: 'invite', roomname: data.roomname});
// 					}
// 				}
// 				if (this.roomService.isRoomAdmin(user, data.roomId)) {
// 					switch (data.option.type) {
// 						case 'kick': {
// 							const result = await this.roomService.kickUser(user, data.roomId, data.option.target);
// 							if (result.status === false)
// 							this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 							break;
// 						}
// 						case 'ban': {
// 							const result = await this.roomService.banUser(user, data.roomname, data.option.target);
// 							if (result.status === false)
// 							this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 							break;
// 						}
// 						case 'mute': {
// 							const result = await this.roomService.muteUser(user, data.roomname, data.option.target);
// 							if (result.status === false)
// 							this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 							break;
// 						}
// 						default: 
// 							break;
// 					}
// 					if (this.roomService.isRoomOwner(user, data.roomId)) {
// 						switch (data.option.type) { //? Est ce que seulement le owner peut inviter ou tous les administrateurs?
// 							case 'addAdmin': {
// 								const result = await this.roomService.addAdmin(data.roomId, data.option.target);
// 								if (result.status === false)
// 									this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 								break;
// 							}
// 							case 'kickAdmin': {
// 								const result = await this.roomService.kickAdmin(data.roomId, data.option.target);
// 								if (result.status === false)
// 								this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 								break;
// 							}
// 							case 'addPwd': {
// 								const result = await this.roomService.addPwd(data.roomId, data.option.target);
// 								if (result.status === false)
// 								this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 								break;
// 							}
// 							case 'rmPwd' : {
// 								const result = await this.roomService.rmPwd(data.roomId);
// 								if (result.status === false)
// 								this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 								break;
// 							}
// 							case 'changePwd' : {
// 								const result = await this.roomService.addPwd(data.roomId, data.option.target);
// 								if (result.status === false)
// 								this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 								break;
// 							}
// 							case 'addInvite' : {
// 								const result = await this.roomService.addInvite(data.roomId);
// 								if (result.status === false)
// 								this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 								break;
// 							}
// 							case 'rmInvite' : {
// 								const result = await this.roomService.rmInvite(data.roomId);
// 								if (result.status === false)
// 								this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 								break;
// 							}
// 							case 'delete' : {
// 								this.roomService.clearUsersfromRoom(data.roomId);
// 								const result = await this.roomService.deleteRoom(data.roomId);
// 								if (result.status === false)
// 								this.socketGateway.sendToClient(client.id, 'error', result.msg);
// 							}
// 							default: 
// 								break;
// 						}
// 					}
// 				}
// 			}
			
// 		} else
// 			console.log("room does not exist");
// 	}

// 	chatFriend(
// 		client: Socket,
// 		data: {type: string, target: string, options: any}
// 	) {
// 		const user = this.usersService.getUserById(client.id);
// 		const target = this.usersService.getUserbyName(data.target);
// 		if (target) {
// 			if (data.type === 'befriend') {
// 				if (target && !this.usersService.areFriends(user, target)) {
// 					// if (!this.usersService.blockedByUser)
// 					this.socketGateway.server.to(target.id).emit('friend', {type: 'request', from: user.pseudo});
// 				}
// 			} else if (data.type === 'response') {
// 				if (data.options.response === true) {
// 					this.usersService.addFriend(user, target);
// 				} else {
// 					this.socketGateway.server.to(target.id).emit('error', {errmsg: user.pseudo + " doesn't want to be your friend"});
// 					return;
// 				}
// 			} else if (data.type === 'unfriendRequest') {
// 				//Il faut supprimer l'amitié dans le profil du user
// 				//Envoyer la notification à l'autre qu'il faut unfriend aussi	
// 				if (user.friends.find((user) => user.pseudo === data.options.target) !== undefined) {
// 					const target = user.friends.find((user) => user.pseudo === data.options.target);
// 					user.friends.splice(user.friends.indexOf(target), 1);
// 					this.socketGateway.server.to(target.socket.id).emit('unfriend', {from: user.pseudo}); //vérifier le format de la communication.
// 					console.log(user.friends);
// 				} else {
// 					this.socketGateway.server.to(client.id).emit('error', 'This user does not exists');
// 				}
// 			}
// 			else if (data.type === 'unfriended') {
// 				if (user.friends.find((user) => user.pseudo === data.options.target) !== undefined) {
// 					const target = user.friends.find((user) => user.pseudo === data.options.target);
// 					user.friends.splice(user.friends.indexOf(target), 1);
// 					this.socketGateway.server.to(user.socket.id).emit('unfriended', 'You are no longer friends with ' + target.name);
// 					console.log(user.friends);
// 				} else {
// 					const msg = 'You'
// 					this.socketGateway.server.to(client.id).emit('error', 'You are not friend with ' + data.options.target);
// 				}
// 			}
// 		} else {
// 			const msg = data.target + ': unknown user';
// 			this.socketGateway.sendToClient(user.id, 'error', msg);
			
// 		}
// 	}
// }

// 	// resetAll(client: Socket) {
// 	// 	this.roomService.clearRooms();
// 	// 	console.log(this.roomService.getRooms());
// 	// 	console.log("rooms cleaned");
// 	// 	this.socketGateway.sendToClient(client.id, 'cleaned', 'Everything has been cleaned');
// 	// 	return;
// 	// }

