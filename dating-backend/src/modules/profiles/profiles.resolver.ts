// src/profiles/profiles.resolver.ts
import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProfileDTO, SuggestedProfileDTO } from './dto/profile.dto';
import { UpdateProfileInput } from './dto/profile.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProfilesService } from './profile.service';

@Resolver(() => ProfileDTO)
@UseGuards(GqlAuthGuard)
export class ProfilesResolver {
  constructor(
    private readonly profilesService: ProfilesService,
  ) {}

  @Query(() => ProfileDTO)
  async myProfile(
    @CurrentUser() user: { id: string },
  ): Promise<ProfileDTO> {
    return this.profilesService.getMyProfile(user.id);
  }

  @Mutation(() => ProfileDTO)
  async updateMyProfile(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateProfileInput,
  ): Promise<ProfileDTO> {
    return this.profilesService.updateMyProfile(user.id, input);
  }

  @Query(() => [ProfileDTO])
  async nearbyProfiles(
    @CurrentUser() user: { id: string },
    @Args('interestFilters', { 
      type: () => [String],  
      nullable: true 
    }) interestFilters?: string[],
  ): Promise<ProfileDTO[]> {
    return this.profilesService.getNearbyProfiles(user.id, interestFilters);
  }

  @Query(() => [String], { nullable: true })
  async popularInterests(
    @Args('limit', { 
      type: () => Number,  // 🔥 THÊM TYPE RÕ RÀNG
      defaultValue: 20, 
      nullable: true 
    }) limit: number,
  ): Promise<string[] | undefined> {
    const interests = await this.profilesService.getPopularInterests(limit);
    return interests.length > 0 ? interests : undefined;
  }
@Query(() => [SuggestedProfileDTO]) 
async suggestedProfiles(
  @CurrentUser() user: { id: string },
  @Args('limit', { 
    type: () => Number,
    defaultValue: 10, 
    nullable: true 
  }) limit?: number,
): Promise<SuggestedProfileDTO[]> {
  return this.profilesService.getSuggestedProfiles(user.id, limit);
}

@Query(() => [SuggestedProfileDTO])
async profilesWithMatchInfo(
  @CurrentUser() user: { id: string },
  @Args('limit', { 
    type: () => Number,
    defaultValue: 20, 
    nullable: true 
  }) limit?: number,
): Promise<SuggestedProfileDTO[]> {
  return this.profilesService.getProfilesWithMatchInfo(user.id, limit);
}

  @Query(() => Number)
  async matchRate(
    @CurrentUser() user: { id: string },
    @Args('targetUserId', { 
      type: () => String  
    }) targetUserId: string,
  ): Promise<number> {
    return this.profilesService.calculateMatchRate(user.id, targetUserId);
  }
}