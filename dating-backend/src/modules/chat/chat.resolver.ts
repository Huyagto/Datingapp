import {
  Resolver,
  Query,
  Mutation,
  Args,
  Subscription,
} from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UseGuards } from '@nestjs/common';

import { MessageDocument } from './message.schema';
import { MessageDTO } from './dto/message.dto';

import { pubsub } from 'src/graphql/pubsub';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

const MESSAGE_CREATED = 'MESSAGE_CREATED';

@Resolver(() => MessageDTO)
export class ChatResolver {
  constructor(
    @InjectModel(MessageDocument.name)
    private readonly messageModel: Model<MessageDocument>,
  ) {}

  /* ======================
     LOAD CHAT HISTORY
  ====================== */
  @UseGuards(GqlAuthGuard)
  @Query(() => [MessageDTO])
  async messages(
    @Args('matchId') matchId: string,
  ): Promise<MessageDTO[]> {
    const msgs = await this.messageModel
      .find({ matchId })
      .sort({ createdAt: 1 });

    return msgs.map((m) => ({
      id: m._id.toString(),
      matchId: m.matchId,
      text: m.text,
      senderId: m.senderId,
      createdAt: m.createdAt,
    }));
  }

  /* ======================
     SEND MESSAGE
  ====================== */
  @UseGuards(GqlAuthGuard)
  @Mutation(() => MessageDTO)
  async sendMessage(
    @Args('matchId') matchId: string,
    @Args('text') text: string,
    @CurrentUser() user: { id: string },
  ): Promise<MessageDTO> {
    const msg = await this.messageModel.create({
      matchId,
      text,
      senderId: user.id,
    });

    const payload: MessageDTO = {
      id: msg._id.toString(),
      matchId,
      text: msg.text,
      senderId: msg.senderId,
      createdAt: msg.createdAt,
    };

    await pubsub.publish(MESSAGE_CREATED, {
      onMessage: payload,
    });

    return payload;
  }

  /* ======================
     REALTIME SUBSCRIPTION
  ====================== */
  @Subscription(() => MessageDTO, {
    filter: (payload, variables) =>
      payload.onMessage.matchId === variables.matchId,
  })
  onMessage(@Args('matchId') matchId: string) {
    return pubsub.asyncIterator(MESSAGE_CREATED);
  }
}
