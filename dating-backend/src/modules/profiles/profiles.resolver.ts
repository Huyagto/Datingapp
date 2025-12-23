import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException, UseGuards } from '@nestjs/common';
import { Swipe } from '../swipe/swipe.schema';
import { UserDocument } from '../users/user.schema';
import { ProfileDTO } from './dto/profile.dto';
import { UpdateProfileInput } from './dto/profile.input';

import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { calcAge } from 'src/utils/age.util';

@Resolver(() => ProfileDTO)
@UseGuards(GqlAuthGuard)
export class ProfilesResolver {
  constructor(
  @InjectModel(UserDocument.name)
  private userModel: Model<UserDocument>,

  @InjectModel(Swipe.name)
  private swipeModel: Model<Swipe>,
) {}

@Mutation(() => ProfileDTO)
async updateMyProfile(
  @CurrentUser() user: { id: string },
  @Args('input') input: UpdateProfileInput,
): Promise<ProfileDTO> {
  const updated = await this.userModel.findByIdAndUpdate(
    user.id,
    {
      $set: {
        name: input.name,
        gender: input.gender,
        bio: input.bio,
        birthday: input.birthday,
      },
    },
    { new: true },
  );

  if (!updated) {
    throw new NotFoundException('User not found');
  }

  return {
    id: updated._id.toString(),
    name: updated.name,
    gender: updated.gender ?? null,
    bio: updated.bio ?? null,
    age: updated.birthday ? calcAge(updated.birthday) : 22,
  };
}


@UseGuards(GqlAuthGuard)
@Query(() => [ProfileDTO])
async nearbyProfiles(
  @CurrentUser() user: { id: string },
): Promise<ProfileDTO[]> {

  const swipes = await this.swipeModel.find({
    fromUserId: user.id,
  });

  const swipedIds = swipes.map(
    (s) => s.toUserId.toString(),
  );

  const users = await this.userModel.find({
    _id: {
      $ne: user.id,
      $nin: swipedIds, // 🔥 HẾT SPAM
    },
  });

  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    gender: u.gender ?? null,
    bio: u.bio ?? null,
    age: u.birthday ? calcAge(u.birthday) : 22,
  }));
}
} 