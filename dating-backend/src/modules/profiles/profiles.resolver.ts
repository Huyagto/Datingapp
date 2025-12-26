// src/profiles/profiles.resolver.ts
import { Resolver, Query, Mutation, Args, Float, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { 
  ProfileDTO, 
  SuggestedProfileDTO, 
  SmartSuggestionProfileDTO,
  LocationResponse,
  UpdateLocationInput,
  FindWithinRadiusInput,
  NearbyProfilesInput
} from './dto/profile.dto';
import { UpdateProfileInput } from './dto/profile.input';
import { GqlAuthGuard } from '../../common/guards/gql-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProfilesService } from './profile.service'; // ✅ ĐÚNG: './profiles.service'

@Resolver(() => ProfileDTO)
export class ProfilesResolver {
  constructor(
    private readonly profilesService: ProfilesService, // ✅ ĐÚNG
  ) {}

  // ========== QUERIES ==========

  @Query(() => ProfileDTO)
  @UseGuards(GqlAuthGuard)
  async myProfile(
    @CurrentUser() user: { id: string },
  ): Promise<ProfileDTO> {
    console.log('🔍 myProfile called with userId:', user.id);
    try {
      const result = await this.profilesService.getMyProfile(user.id);
      console.log('🔍 myProfile result:', result);
      return result;
    } catch (error) {
      console.error('❌ myProfile error:', error);
      throw error;
    }
  }

  @Query(() => [ProfileDTO])
  @UseGuards(GqlAuthGuard)
  async nearbyProfiles(
    @CurrentUser() user: { id: string },
    @Args('input', { nullable: true }) input?: NearbyProfilesInput,
  ): Promise<ProfileDTO[]> {
    console.log('🔍 nearbyProfiles called:', { userId: user.id, input });
    try {
      const result = await this.profilesService.getNearbyProfiles(
        user.id, 
        input?.interestFilters, 
        input?.limit, 
        input?.maxDistanceInKm
      );
      console.log('🔍 nearbyProfiles result count:', result?.length);
      return result;
    } catch (error) {
      console.error('❌ nearbyProfiles error:', error);
      throw error;
    }
  }

  @Query(() => [SuggestedProfileDTO])
  @UseGuards(GqlAuthGuard)
  async suggestedProfiles(
    @CurrentUser() user: { id: string },
    @Args('limit', { 
      type: () => Int,
      defaultValue: 10, 
      nullable: true 
    }) limit?: number,
  ): Promise<SuggestedProfileDTO[]> {
    console.log('🔍 suggestedProfiles called:', { userId: user.id, limit });
    try {
      const result = await this.profilesService.getSuggestedProfiles(user.id, limit || 10);
      console.log('🔍 suggestedProfiles result count:', result?.length);
      
      // Convert to SuggestedProfileDTO
      return result.map(profile => ({
        id: profile.id,
        name: profile.name,
        gender: profile.gender,
        bio: profile.bio,
        birthday: profile.birthday,
        age: profile.age,
        photos: profile.photos || [],
        interests: profile.interests || [],
        location: profile.location,
        createdAt: profile.createdAt,
        commonInterestsCount: profile.commonInterestsCount,
        matchPercentage: profile.matchPercentage,
        distance: profile.distance,
        distanceUnit: profile.distanceUnit || 'km',
        score: profile.score,
      } as SuggestedProfileDTO));
    } catch (error) {
      console.error('❌ suggestedProfiles error:', error);
      throw error;
    }
  }

  @Query(() => [SmartSuggestionProfileDTO])
  @UseGuards(GqlAuthGuard)
  async smartSuggestions(
    @CurrentUser() user: { id: string },
    @Args('limit', { 
      type: () => Int,
      defaultValue: 10, 
      nullable: true 
    }) limit?: number,
  ): Promise<SmartSuggestionProfileDTO[]> {
    console.log('🔍 smartSuggestions called:', { userId: user.id, limit });
    try {
      const result = await this.profilesService.getSmartSuggestions(user.id, limit || 10);
      console.log('🔍 smartSuggestions result count:', result?.length);
      
      // Convert to SmartSuggestionProfileDTO
      return result.map(profile => ({
        id: profile.id,
        name: profile.name,
        gender: profile.gender,
        bio: profile.bio,
        birthday: profile.birthday,
        age: profile.age,
        photos: profile.photos || [],
        interests: profile.interests || [],
        location: profile.location,
        createdAt: profile.createdAt,
        commonInterestsCount: profile.commonInterestsCount,
        matchPercentage: profile.matchPercentage,
        distance: profile.distance,
        distanceUnit: profile.distanceUnit || 'km',
        score: profile.score,
        scores: profile.scores,
        isNearby: profile.isNearby,
        isActive: profile.isActive,
      } as SmartSuggestionProfileDTO));
    } catch (error) {
      console.error('❌ smartSuggestions error:', error);
      throw error;
    }
  }

  @Query(() => [SuggestedProfileDTO])
  @UseGuards(GqlAuthGuard)
  async findWithinRadius(
    @CurrentUser() user: { id: string },
    @Args('input') input: FindWithinRadiusInput,
  ): Promise<SuggestedProfileDTO[]> {
    console.log('🔍 findWithinRadius called:', { userId: user.id, input });
    try {
      const result = await this.profilesService.findWithinRadius(
        user.id,
        [input.lng, input.lat],
        input.radiusInKm,
        input.limit
      );
      console.log('🔍 findWithinRadius result count:', result?.length);
      return result;
    } catch (error) {
      console.error('❌ findWithinRadius error:', error);
      throw error;
    }
  }

  @Query(() => LocationResponse)
  @UseGuards(GqlAuthGuard)
  async myLocation(
    @CurrentUser() user: { id: string },
  ): Promise<LocationResponse> {
    console.log('🔍 myLocation called with userId:', user.id);
    try {
      const result = await this.profilesService.getLocation(user.id);
      console.log('🔍 myLocation result:', result);
      return result;
    } catch (error) {
      console.error('❌ myLocation error:', error);
      throw error;
    }
  }

  @Query(() => [ProfileDTO])
  @UseGuards(GqlAuthGuard)
  async profilesWithMatchInfo(
    @CurrentUser() user: { id: string },
    @Args('limit', { 
      type: () => Int,
      defaultValue: 20, 
      nullable: true 
    }) limit?: number,
  ): Promise<ProfileDTO[]> {
    console.log('🔍 profilesWithMatchInfo called:', { userId: user.id, limit });
    try {
      const result = await this.profilesService.getProfilesWithMatchInfo(user.id, limit || 20);
      console.log('🔍 profilesWithMatchInfo result count:', result?.length);
      return result;
    } catch (error) {
      console.error('❌ profilesWithMatchInfo error:', error);
      throw error;
    }
  }

  @Query(() => Float)
  @UseGuards(GqlAuthGuard)
  async matchRate(
    @CurrentUser() user: { id: string },
    @Args('targetUserId', { 
      type: () => String  
    }) targetUserId: string,
  ): Promise<number> {
    console.log('🔍 matchRate called:', { userId: user.id, targetUserId });
    try {
      const result = await this.profilesService.calculateMatchRate(user.id, targetUserId);
      console.log('🔍 matchRate result:', result);
      return result;
    } catch (error) {
      console.error('❌ matchRate error:', error);
      throw error;
    }
  }

  @Query(() => [String])
  @UseGuards(GqlAuthGuard)
  async popularInterests(
    @Args('limit', { 
      type: () => Int,
      defaultValue: 20, 
      nullable: true 
    }) limit?: number,
  ): Promise<string[]> {
    console.log('🔍 popularInterests called:', { limit });
    try {
      const result = await this.profilesService.getPopularInterests(limit || 20);
      console.log('🔍 popularInterests result:', result);
      return result;
    } catch (error) {
      console.error('❌ popularInterests error:', error);
      throw error;
    }
  }

  // ========== MUTATIONS ==========

  @Mutation(() => ProfileDTO)
  @UseGuards(GqlAuthGuard)
  async updateMyProfile(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateProfileInput,
  ): Promise<ProfileDTO> {
    console.log('🔍 updateMyProfile called:', { userId: user.id, input });
    try {
      const result = await this.profilesService.updateMyProfile(user.id, input);
      console.log('🔍 updateMyProfile result:', result);
      return result;
    } catch (error) {
      console.error('❌ updateMyProfile error:', error);
      throw error;
    }
  }

  @Mutation(() => ProfileDTO)
  @UseGuards(GqlAuthGuard)
  async updateLocation(
    @CurrentUser() user: { id: string },
    @Args('input') input: UpdateLocationInput,
  ): Promise<ProfileDTO> {
    console.log('🔍 updateLocation called:', { userId: user.id, input });
    try {
      const result = await this.profilesService.updateLocation(user.id, input);
      console.log('🔍 updateLocation result:', result);
      return result;
    } catch (error) {
      console.error('❌ updateLocation error:', error);
      throw error;
    }
  }

  @Mutation(() => [String])
  @UseGuards(GqlAuthGuard)
  async uploadPhotos(
    @CurrentUser() user: { id: string },
    @Args('photos', { 
      type: () => [String], 
      description: 'Array of base64 encoded images'
    }) base64Photos: string[],
  ): Promise<string[]> {
    console.log('🔍 uploadPhotos called:', { userId: user.id, photoCount: base64Photos?.length });
    try {
      const result = await this.profilesService.uploadBase64Photos(user.id, base64Photos);
      console.log('🔍 uploadPhotos result:', result);
      return result;
    } catch (error) {
      console.error('❌ uploadPhotos error:', error);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async deletePhoto(
    @CurrentUser() user: { id: string },
    @Args('photoUrl', { type: () => String }) photoUrl: string,
  ): Promise<boolean> {
    console.log('🔍 deletePhoto called:', { userId: user.id, photoUrl });
    try {
      await this.profilesService.deletePhoto(user.id, photoUrl);
      console.log('✅ deletePhoto success');
      return true;
    } catch (error) {
      console.error('❌ deletePhoto error:', error);
      throw error;
    }
  }

  @Mutation(() => Boolean)
  @UseGuards(GqlAuthGuard)
  async setPrimaryPhoto(
    @CurrentUser() user: { id: string },
    @Args('photoUrl', { type: () => String }) photoUrl: string,
  ): Promise<boolean> {
    console.log('🔍 setPrimaryPhoto called:', { userId: user.id, photoUrl });
    try {
      await this.profilesService.setPrimaryPhoto(user.id, photoUrl);
      console.log('✅ setPrimaryPhoto success');
      return true;
    } catch (error) {
      console.error('❌ setPrimaryPhoto error:', error);
      throw error;
    }
  }
}