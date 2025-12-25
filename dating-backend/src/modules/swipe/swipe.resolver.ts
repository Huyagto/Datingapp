import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UseGuards } from '@nestjs/common';

import { Swipe } from './swipe.schema';
import { SwipeInput } from './swipe.input';
import { SwipeResult } from './swipe.dto';

import { MatchDocument } from '../match/match.schema';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { SwipeType } from './swipe.enum';

@Resolver()
@UseGuards(GqlAuthGuard)
export class SwipeResolver {
  constructor(
    @InjectModel(Swipe.name)
    private swipeModel: Model<Swipe>,

    @InjectModel(MatchDocument.name)
    private matchModel: Model<MatchDocument>,
  ) {}
  @Mutation(() => SwipeResult)
  async swipeUser(
    @Args('input') input: SwipeInput,
    @CurrentUser() user: { id: string },
  ): Promise<SwipeResult> {
    await this.swipeModel.create({
      fromUserId: user.id,
      toUserId: input.toUserId,
      type: input.type,
    });

    if (input.type === SwipeType.PASS) {
      return { isMatch: false };
    }
    const reverseLike = await this.swipeModel.findOne({
      fromUserId: input.toUserId,
      toUserId: user.id,
      type: SwipeType.LIKE,
    });

    if (!reverseLike) {
      return { isMatch: false };
    }
    const match = await this.matchModel.create({
      userA: user.id,
      userB: input.toUserId,
    });

    return {
      isMatch: true,
      matchId: match._id.toString(),
    };
  }
}
