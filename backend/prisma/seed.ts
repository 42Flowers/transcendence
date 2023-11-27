/* eslint-disable prettier/prettier */
import { PrismaClient } from '@prisma/client';
import { hashSync } from 'bcrypt';

// initialize Prisma Client
const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.channelMembership.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.privateMessage.deleteMany();
  await prisma.userConversation.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.friendship.deleteMany();
  await prisma.blocked.deleteMany();
  await prisma.gameParticipation.deleteMany();
  await prisma.game.deleteMany();
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$executeRaw`UPDATE sqlite_sequence SET seq = 0 WHERE name = 'User';`; // Eesier for testing in the URL: This ways, id of user always starts at 1 
  //await prisma.$executeRaw`UPDATE sqlite_sequence SET seq = 0 WHERE name = 'Game';`;
  //await prisma.$executeRaw`UPDATE sqlite_sequence SET seq = 0 WHERE name = 'Achievement';`;
    const user1 = await prisma.user.create({
      data: {
        id: 1,
        pseudo: "User1",
        email: "user1@example.com",
        emailVerified: false,
        password: hashSync('mdp', 10),
      },
    });
  
    const user2 = await prisma.user.create({
      data: {
        pseudo: "User2",
        email: "user2@example.com",
        emailVerified: false,
        password: hashSync('mdp', 10),
        //otpauth://totp/SecretKey?secret=KVAFEKKWOZ4SYZD5JVYWS6KWF5UU4LDCKNBDYUCUGVZVEV3ZJNOQ
        // To test on your own phone, generate a qr code with the text of the previous comment
        // And scan it.
        totpSecret: 'KVAFEKKWOZ4SYZD5JVYWS6KWF5UU4LDCKNBDYUCUGVZVEV3ZJNOQ',
        totpEnabled: true,
      },
    });
  
    const user3 = await prisma.user.create({
      data: {
        pseudo: "User3",
        email: "user3@example.com",
        emailVerified: false,
      },
    });
    
    const user4 = await prisma.user.create({
      data: {
        pseudo: "User4",
        email: "user4@example.com",
        emailVerified: false,
      },
    });

    const user5 = await prisma.user.create({
      data: {
        pseudo: "User5",
        email: "user5@example.com",
        emailVerified: false,
      },
    });
    
    const user6 = await prisma.user.create({
      data: {
        pseudo: "User6",
        email: "user6@example.com",
        emailVerified: false,
      },
    });

    const user7 = await prisma.user.create({
      data: {
        pseudo: "User7",
        email: "user7@example.com",
        emailVerified: false,
      },
    });

    // create achievements
    const ach1 = await prisma.achievement.create({
      data: {
        name: "Newwww Avatar",
        description: "Congrats, you've just changed you're avatar for the very first time!",
        difficulty: 1
      },
    });
  
    const ach2 = await prisma.achievement.create({
      data: {
        name: "Newwww Pseudo",
        description: "Congrats, you've just changed you're pseudo for the very first time!",
        difficulty: 1,
      },
    });

    const ach3 = await prisma.achievement.create({
      data: {
        name: "First Game",
        description: "It's you're first game ever!",
        difficulty: 1
      },
    });

    const ach4 = await prisma.achievement.create({
      data: {
        name: "You're getting used to Pong",
        description: "It's you're 10th game participation!",
        difficulty: 2
      },
    });

    const ach5 = await prisma.achievement.create({
      data: {
        name: "You're playing a lot",
        description: "It's you're 100th game participation!",
        difficulty: 3
      },
    });

    const ach6 = await prisma.achievement.create({
        data: {
          name: "3",
          description: "3 wins in a row",
          difficulty: 2,
        },
      });

    const ach7 = await prisma.achievement.create({
        data: {
          name: "3 total",
          description: "3 wins in total",
          difficulty: 1,
        },
      });

    const ach8 = await prisma.achievement.create({
        data: {
          name: "10",
          description: "10 wins in a row",
          difficulty: 2,
        },
      });

    const ach9 = await prisma.achievement.create({
        data: {
          name: "10 total",
          description: "10 wins in total",
          difficulty: 2,
        },
      });

    const ach10 = await prisma.achievement.create({
        data: {
          name: "100",
          description: "100 wins in a row",
          difficulty: 3,
        },
      });

    const ach11 = await prisma.achievement.create({
        data: {
          name: "100 total",
          description: "10 wins in total",
          difficulty: 3,
        },
      });

    const ach12 = await prisma.achievement.create({
        data: {
          name: "Small Leader",
          description: "You're the leader of a league that contains at least 3 participants",
          difficulty: 2,
        },
      });

    const ach13 = await prisma.achievement.create({
        data: {
          name: "Great Leader",
          description: "You're the leader of a league that contains at least 10 participants",
          difficulty: 3,
        },
      });

    const ach14 = await prisma.achievement.create({
        data: {
          name: "Perfect win",
          description: "You won 10-0",
          difficulty: 2,
        },
      });

    const ach15 = await prisma.achievement.create({
        data: {
          name: "You're a looser",
          description: "You lost 10-0",
          difficulty: 2,
        },
      });

    const ach16 = await prisma.achievement.create({
        data: {
          name: "New level",
          description: "You reached level 1!",
          difficulty: 1,
        },
      });

    const ach17 = await prisma.achievement.create({
        data: {
          name: "Level 21",
          description: "You reached level 21! You're such a good player, I've never seen that before.",
          difficulty: 3,
        },
      });

    const ach18 = await prisma.achievement.create({
        data: {
          name: "You like to talk?",
          description: "You've already sent 10 messages.",
          difficulty: 1,
        },
      });

    const ach19 = await prisma.achievement.create({
        data: {
          name: "Chatterbox",
          description: "You can't stop talking! It's you're 100th message!",
          difficulty: 2,
        },
      });
  
  //   // assign achievements to users
  // await prisma.userAchievement.create({
  //     data: {
  //       userId: user1.id,
  //       achievementId: ach1.id,
  //     },
  //   });

  //   await prisma.userAchievement.create({
  //       data: {
  //         userId: user1.id,
  //         achievementId: ach3.id,
  //       },
  //     });

  //     await prisma.userAchievement.create({
  //       data: {
  //         userId: user2.id,
  //         achievementId: ach2.id,
  //       },
  //     });

  //     await prisma.userAchievement.create({
  //       data: {
  //         userId: user3.id,
  //         achievementId: ach1.id,
  //       },
  //     });

  //     await prisma.userAchievement.create({
  //       data: {
  //         userId: user3.id,
  //         achievementId: ach2.id,
  //       },
  //     });

  //     await prisma.userAchievement.create({
  //       data: {
  //         userId: user3.id,
  //         achievementId: ach3.id,
  //       },
  //     });
  
    // and so on for other user-achievement relations
    // create game results
    const game1 = await prisma.game.create({
      data: {
        score1: 10,
        score2: 5,
        winnerId: user1.id,
        looserId: user2.id
      },
    });
    
    const game2 = await prisma.game.create({
      data: {
        score1: 10,
        score2: 3,
        winnerId: user1.id,
        looserId: user3.id
      },
    });

    const game3 = await prisma.game.create({
      data: {
        score1: 10,
        score2: 9,
        winnerId: user3.id,
        looserId: user1.id
      },
    });

    const game4 = await prisma.game.create({
      data: {
        score1: 10,
        score2: 4,
        winnerId: user1.id,
        looserId: user4.id
      },
    });
    
    // create game participations

    // GAME 1 Pair
    await prisma.gameParticipation.create({
      data: {
        userId: user1.id,
        gameId: game1.id,
        opponentId: user2.id
      },
    });
    await prisma.gameParticipation.create({
      data: {
        userId: user2.id,
        gameId: game1.id,
        opponentId: user1.id
      },
    });
    
    // GAME 2 Pair
    await prisma.gameParticipation.create({
      data: {
        userId: user1.id,
        gameId: game2.id,
        opponentId: user3.id
      },
    });
    await prisma.gameParticipation.create({
      data: {
        userId: user3.id,
        gameId: game2.id,
        opponentId: user1.id
      },
    });

    // GAME 3 Pair
    await prisma.gameParticipation.create({
      data: {
        userId: user3.id,
        gameId: game3.id,
        opponentId: user1.id
      },
    });
    await prisma.gameParticipation.create({
      data: {
        userId: user1.id,
        gameId: game3.id,
        opponentId: user3.id
      },
    });

    // GAME 4 Pair
    await prisma.gameParticipation.create({
      data: {
        userId: user1.id,
        gameId: game4.id,
        opponentId: user4.id
      },
    });
    await prisma.gameParticipation.create({
      data: {
        userId: user4.id,
        gameId: game4.id,
        opponentId: user1.id
      },
    });

    // Friendships
    // PAIR 1 accepted
    await prisma.friendship.create({
      data: {
        status: 2,

        userId: user1.id,
        friendId: user2.id,
      }
    })
    await prisma.friendship.create({
      data: {
        status: 2,

        userId: user2.id,
        friendId: user1.id,
      }
    })

    // PAIR 2 sender
    await prisma.friendship.create({
      data: {
        status: 0,

        userId: user1.id,
        friendId: user3.id,
      }
    })
    await prisma.friendship.create({
      data: {
        status: 1,

        userId: user3.id,
        friendId: user1.id,
      }
    })

    // PAIR 3 receiver
    await prisma.friendship.create({
      data: {
        status: 1,

        userId: user1.id,
        friendId: user4.id,
      }
    })
    await prisma.friendship.create({
      data: {
        status: 0,

        userId: user4.id,
        friendId: user1.id,
      }
    })

    // PAIR 4 blocked accepted
    await prisma.friendship.create({
      data: {
        status: 3,

        userId: user1.id,
        friendId: user5.id,
      }
    })
    await prisma.friendship.create({
      data: {
        status: 2,

        userId: user5.id,
        friendId: user1.id,
      }
    })

    // PAIR 5 blocked by receiver
    await prisma.friendship.create({
      data: {
        status: 3,

        userId: user1.id,
        friendId: user6.id,
      }
    })
    await prisma.friendship.create({
      data: {
        status: 0,

        userId: user6.id,
        friendId: user1.id,
      }
    })

    // PAIR 6 double blocked
    await prisma.friendship.create({
      data: {
        status: 3,

        userId: user1.id,
        friendId: user7.id,
      }
    })
    await prisma.friendship.create({
      data: {
        status: 3,

        userId: user7.id,
        friendId: user1.id,
      }
    })

    // BLOCKED

    // blocked a friend
    await prisma.blocked.create({
      data: {
        userId: user1.id,
        blockedId:user5.id,
      }
    })

    // blocked sender
    await prisma.blocked.create({
      data: {
        userId: user1.id,
        blockedId:user6.id,
      }
    })
    
    // PAIR double blocked
    await prisma.blocked.create({
      data: {
        userId: user1.id,
        blockedId:user7.id,
      }
    })
    await prisma.blocked.create({
      data: {
        userId: user7.id,
        blockedId:user1.id,
      }
    })

    // CONVERSATIONS
    const conv1 = await prisma.conversation.create({})
    const conv2 = await prisma.conversation.create({})
    const conv3 = await prisma.conversation.create({})


    // PRIVATE MESSAGES

    // messages conv 1 friends
    const msg1a = await prisma.privateMessage.create({
      data: {
        content: "from user1 Hello 1",
        authorId: user1.id,
        conversationId: conv1.id,
      }
    })
    const msg1b = await prisma.privateMessage.create({
      data: {
        content: "from user2 Hello 1",
        authorId: user2.id,
        conversationId: conv1.id,
      }
    })
    const msg1c = await prisma.privateMessage.create({
      data: {
        content: "from user1 Hello 2",
        authorId: user1.id,
        conversationId: conv1.id,
      }
    })
    const msg1d = await prisma.privateMessage.create({
      data: {
        content: "from user1 Hello 3",
        authorId: user1.id,
        conversationId: conv1.id,
      }
    })
    
    // messages conv 2 not friends
    const msg2a = await prisma.privateMessage.create({
      data: {
        content: "from user3 Hello 1",
        authorId: user3.id,
        conversationId: conv2.id,
      }
    })
    const msg2b = await prisma.privateMessage.create({
      data: {
        content: "from user1 Hello 1",
        authorId: user1.id,
        conversationId: conv2.id,
      }
    })
    
    // messages conv 3 user6 blocked by user1
    const msg3a = await prisma.privateMessage.create({
      data: {
        content: "from user1 Hello 1",
        authorId: user1.id,
        conversationId: conv3.id,
      }
    })
    const msg3b = await prisma.privateMessage.create({
      data: {
        content: "from user6 SPAM 1",
        authorId: user6.id,
        conversationId: conv3.id,
      }
    })
    const msg3c = await prisma.privateMessage.create({
      data: {
        content: "from user6 SPAM 2",
        authorId: user6.id,
        conversationId: conv3.id,
      }
    })
    const msg3d = await prisma.privateMessage.create({
      data: {
        content: "from user6 SPAM 3",
        authorId: user6.id,
        conversationId: conv3.id,
      }
    })
    const msg3e = await prisma.privateMessage.create({
      data: {
        content: "from user6 SPAM 4",
        authorId: user6.id,
        conversationId: conv3.id,
      }
    })


    // UserConversations PAIRS

    // PAIR conv1
    await prisma.userConversation.create({
      data: {
        receiverId: user2.id,
        userId: user1.id,
        conversationId: conv1.id,
      }
    })
    await prisma.userConversation.create({
      data: {
        receiverId: user1.id,
        userId: user2.id,
        conversationId: conv1.id,
      }
    })


    // PAIR conv2
    await prisma.userConversation.create({
      data: {
        receiverId: user3.id,
        userId: user1.id,
        conversationId: conv2.id,
      }
    })
    await prisma.userConversation.create({
      data: {
        receiverId: user1.id,
        userId: user3.id,
        conversationId: conv2.id,
      }
    })


    // PAIR conv3
    await prisma.userConversation.create({
      data: {
        receiverId: user6.id,
        userId: user1.id,
        conversationId: conv3.id,
      }
    })
    await prisma.userConversation.create({
      data: {
        receiverId: user1.id,
        userId: user6.id,
        conversationId: conv3.id,
      }
    })


    // CHANNELS

    // user1 chan  1(libre)
    const chan1 = await prisma.channel.create({
      data: {
        name: "chan1",
        
        ownerId: user1.id,
      }
    })

    // user1 chan  2(invite)
    const chan2 = await prisma.channel.create({
      data: {
        name: "chan2",
        accessMask: 2,
        ownerId: user1.id,
      }
    })

    // user1 chan 4(invite)
    const chan3 = await prisma.channel.create({
      data: {
        name: "chan3",
        password: "pwd",
        accessMask: 4,
        ownerId: user1.id,
      }
    })


    // MESSAGE

    // chan1 messages
    const chanMsg1a = await prisma.message.create({
      data: {
        authorId: user1.id,
        content: "from user1 hello people 1",
        channelId: chan1.id,
      }
    })
    const chanMsg1b = await prisma.message.create({
      data: {
        authorId: user2.id,
        content: "from user2 hello people 1",
        channelId: chan1.id,
      }
    })
    const chanMsg1c = await prisma.message.create({
      data: {
        authorId: user3.id,
        content: "from user3 hello people 1",
        channelId: chan1.id,
      }
    })
    const chanMsg1d = await prisma.message.create({
      data: {
        authorId: user4.id,
        content: "from user4 hello people 1",
        channelId: chan1.id,
      }
    })
    const chanMsg1e = await prisma.message.create({
      data: {
        authorId: user5.id,
        content: "from user5 hello people 1",
        channelId: chan1.id,
      }
    })
    const chanMsg1f = await prisma.message.create({
      data: {
        authorId: user6.id,
        content: "from user6 hello people 1",
        channelId: chan1.id,
      }
    })
    const chanMsg1g = await prisma.message.create({
      data: {
        authorId: user7.id,
        content: "from user7 hello people 1",
        channelId: chan1.id,
      }
    })
    const chanMsg1h = await prisma.message.create({
      data: {
        authorId: user1.id,
        content: "from user1 hello people 2",
        channelId: chan1.id,
      }
    })
    
    // chan2 messages
    const chanMsg2a = await prisma.message.create({
      data: {
        authorId: user1.id,
        content: "from user1 hello people 1",
        channelId: chan2.id,
      }
    })
    const chanMsg2b = await prisma.message.create({
      data: {
        authorId: user2.id,
        content: "from user2 hello people 1",
        channelId: chan2.id,
      }
    })
    const chanMsg2c = await prisma.message.create({
      data: {
        authorId: user3.id,
        content: "from user3 hello people 1",
        channelId: chan2.id,
      }
    })
    
    // chan3 messages
    const chanMsg3a = await prisma.message.create({
      data: {
        authorId: user1.id,
        content: "from user1 hello people 1",
        channelId: chan3.id,
      }
    })
    const chanMsg3b = await prisma.message.create({
      data: {
        authorId: user2.id,
        content: "from user2 hello people 1",
        channelId: chan3.id,
      }
    })
    const chanMsg3c = await prisma.message.create({
      data: {
        authorId: user2.id,
        content: "from user2 hello people 2",
        channelId: chan3.id,
      }
    })
    const chanMsg3d = await prisma.message.create({
      data: {
        authorId: user1.id,
        content: "from user1 hello people 2",
        channelId: chan3.id,
      }
    })

    // Channel MEMBERSHIP

    // chan1 membership
    await prisma.channelMembership.create({
      data: {
        channelId: chan1.id,
        userId: user1.id,
        permissionMask: 4,
        channelName: "chan1",
      }
    })
    await prisma.channelMembership.create({
      data: {
        channelId: chan1.id,
        userId: user2.id,
        channelName: "chan1",
      }
    })
    await prisma.channelMembership.create({
      data: {
        channelId: chan1.id,
        userId: user3.id,
        channelName: "chan1",
      }
    })
    await prisma.channelMembership.create({
      data: {
        channelId: chan1.id,
        userId: user4.id,
        channelName: "chan1",
      }
    })
    await prisma.channelMembership.create({
      data: {
        channelId: chan1.id,
        userId: user5.id,
        channelName: "chan1",
      }
    })
    await prisma.channelMembership.create({
      data: {
        channelId: chan1.id,
        userId: user6.id,
        channelName: "chan1",
      }
    })
    await prisma.channelMembership.create({
      data: {
        channelId: chan1.id,
        userId: user7.id,
        channelName: "chan1",
      }
    })
    
    // chan2
    await prisma.channelMembership.create({
      data: {
        channelId: chan2.id,
        userId: user1.id,
        permissionMask: 4,
        channelName: "chan2",
      }
    })
    await prisma.channelMembership.create({
      data: {
        channelId: chan2.id,
        userId: user2.id,
        channelName: "chan2",
      }
    })
    // banned member
    await prisma.channelMembership.create({
      data: {
        channelId: chan2.id,
        userId: user3.id,
        
        membershipState: 4,
        
        channelName: "chan2",
      }
    })
    
    // chan3
    await prisma.channelMembership.create({
      data: {
        channelId: chan3.id,
        userId: user1.id,
        permissionMask: 4,
        channelName: "chan3",
      }
    })
    // muted member
    await prisma.channelMembership.create({
      data: {
        channelId: chan3.id,
        userId: user2.id,
        membershipState: 2,
        channelName: "chan3",
      }
    })


  }


// execute the main function
main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
  