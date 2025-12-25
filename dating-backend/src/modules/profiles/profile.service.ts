// src/profiles/profiles.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // 🔥 THÊM Types từ mongoose
import { UserDocument } from '../users/user.schema';
import { Swipe } from '../swipe/swipe.schema';
import { ProfileDTO } from './dto/profile.dto';
import { UpdateProfileInput } from './dto/profile.input';
import { calcAge } from '../../utils/age.util';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(UserDocument.name)
    private userModel: Model<UserDocument>,

    @InjectModel(Swipe.name)
    private swipeModel: Model<Swipe>,
  ) {}

  // 🔥 Get my profile
  async getMyProfile(userId: string): Promise<ProfileDTO> {
    const userDoc = await this.userModel.findById(userId);
    
    if (!userDoc) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToProfileDTO(userDoc);
  }

  // 🔥 Update my profile
  async updateMyProfile(userId: string, input: UpdateProfileInput): Promise<ProfileDTO> {
    // Validation cho interests
    if (input.interests && input.interests.length > 10) {
      throw new BadRequestException('Tối đa 10 sở thích được chọn');
    }

    const updateData: any = {
      name: input.name,
      gender: input.gender,
      bio: input.bio,
    };

    if (input.birthday) {
      const birthdayDate = new Date(input.birthday);
      if (isNaN(birthdayDate.getTime())) {
        throw new BadRequestException('Ngày sinh không hợp lệ');
      }
      updateData.birthday = birthdayDate;
    }

    // Xử lý interests
    if (input.interests !== undefined) {
      const processedInterests = this.processInterests(input.interests);
      updateData.interests = processedInterests;
    }

    const updated = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    );

    if (!updated) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToProfileDTO(updated);
  }

  // 🔥 Get nearby profiles
  async getNearbyProfiles(
    userId: string,
    interestFilters?: string[],
    limit: number = 20, // 🔥 Thêm limit parameter
  ): Promise<ProfileDTO[]> {
    const currentUser = await this.userModel.findById(userId);
    
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Lấy danh sách user đã swipe
    const swipedIds = await this.getSwipedUserIds(userId);

    // Build query
    const query = this.buildNearbyProfilesQuery(userId, swipedIds, interestFilters);

    // Execute query
    const users = await this.userModel
      .find(query)
      .select('name gender bio birthday interests createdAt')
      .limit(limit);

    return users.map(user => this.mapUserToProfileDTO(user));
  }

  // 🔥 Get popular interests
  async getPopularInterests(limit: number = 20): Promise<string[]> {
    const result = await this.userModel.aggregate([
      { $match: { interests: { $exists: true, $ne: [] } } },
      { $unwind: '$interests' },
      { 
        $group: { 
          _id: '$interests', 
          count: { $sum: 1 } 
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { _id: 1 } }
    ]);
    
    return result.map(item => item._id);
  }

async getSuggestedProfiles(
  userId: string,
  limit: number = 10,
): Promise<any[]> {
  const currentUser = await this.userModel.findById(userId);
  
  if (!currentUser) {
    throw new NotFoundException('User not found');
  }

  const currentInterests = currentUser.interests || [];
  
  if (currentInterests.length === 0) {
    return this.getNearbyProfiles(userId, [], limit);
  }

  const swipedIds = await this.getSwipedUserIds(userId);
  const excludedIds = [...swipedIds, userId].map(id => {
    try {
      return new Types.ObjectId(id);
    } catch {
      return null;
    }
  }).filter(id => id !== null);
  const result = await this.userModel.aggregate([
    {
      $match: {
        _id: { $nin: excludedIds },
        interests: { $exists: true, $ne: null }, 
      }
    },
    {
      $addFields: {
        safeInterests: {
          $cond: {
            if: { $isArray: "$interests" },
            then: "$interests",
            else: []
          }
        }
      }
    },
    {
      $addFields: {
        commonInterestsCount: {
          $size: {
            $setIntersection: ["$safeInterests", currentInterests]
          }
        }
      }
    },
    {
      $match: {
        commonInterestsCount: { $gt: 0 }
      }
    },
    {
      $sort: { commonInterestsCount: -1, createdAt: -1 }
    },
    {
      $limit: limit
    },
    {
      $project: {
        name: 1,
        gender: 1,
        bio: 1,
        birthday: 1,
        safeInterests: 1, 
        createdAt: 1,
        commonInterestsCount: 1,
        matchPercentage: {
          $multiply: [
            { $divide: ["$commonInterestsCount", currentInterests.length] },
            100
          ]
        }
      }
    }
  ]);

  return result.map(user => ({
    id: user._id.toString(),
    name: user.name,
    gender: user.gender || undefined,
    bio: user.bio || undefined,
    birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : undefined,
    age: user.birthday ? calcAge(new Date(user.birthday)) : undefined,
    interests: user.safeInterests && user.safeInterests.length > 0 ? user.safeInterests : undefined, 
    commonInterestsCount: user.commonInterestsCount,
    matchPercentage: Math.round(user.matchPercentage || 0),
    createdAt: user.createdAt,
  }));
}
  async calculateMatchRate(
    currentUserId: string,
    targetUserId: string,
  ): Promise<number> {
    const currentUser = await this.userModel.findById(currentUserId);
    const targetUser = await this.userModel.findById(targetUserId);
    
    if (!currentUser || !targetUser) {
      throw new NotFoundException('User not found');
    }

    const currentInterests = currentUser.interests || [];
    const targetInterests = targetUser.interests || [];

    if (currentInterests.length === 0 || targetInterests.length === 0) {
      return 0;
    }

    const commonInterests = currentInterests.filter(interest => 
      targetInterests.includes(interest)
    );

    const maxPossible = Math.max(currentInterests.length, targetInterests.length);
    const matchRate = Math.round((commonInterests.length / maxPossible) * 100);

    return matchRate;
  }
  async getProfilesWithMatchInfo(
    userId: string,
    limit: number = 20,
  ): Promise<any[]> {
    const currentUser = await this.userModel.findById(userId);
    
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const currentInterests = currentUser.interests || [];
    const swipedIds = await this.getSwipedUserIds(userId);

    const nearbyProfiles = await this.getNearbyProfiles(userId, [], limit * 2);
    
    const profilesWithMatch = nearbyProfiles.map(profile => {
      const profileInterests = profile.interests || [];
      const commonInterests = currentInterests.filter(interest => 
        profileInterests.includes(interest)
      );
      
      const matchPercentage = currentInterests.length > 0 
        ? Math.round((commonInterests.length / currentInterests.length) * 100)
        : 0;
      
      return {
        ...profile,
        commonInterestsCount: commonInterests.length,
        matchPercentage,
      };
    });

    // Sắp xếp theo match percentage giảm dần
    profilesWithMatch.sort((a, b) => b.matchPercentage - a.matchPercentage);
    
    // Lấy top N
    return profilesWithMatch.slice(0, limit);
  }

  private async getSwipedUserIds(userId: string): Promise<string[]> {
    const swipes = await this.swipeModel.find({
      fromUserId: userId,
    });

    return swipes.map((s) => s.toUserId.toString());
  }

  private buildNearbyProfilesQuery(
    userId: string,
    swipedIds: string[],
    interestFilters?: string[],
  ): any {
    const query: any = {
      _id: {
        $ne: userId,
        $nin: swipedIds,
      },
    };

    // Filter theo interests nếu có
    if (interestFilters && interestFilters.length > 0) {
      query.interests = {
        $in: interestFilters,
      };
    }

    return query;
  }

  private processInterests(interests: string[]): string[] {
    const processed = interests
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
    
    return [...new Set(processed)];
  }

  private mapUserToProfileDTO(user: UserDocument): ProfileDTO {
    return {
      id: user._id.toString(),
      name: user.name,
      gender: user.gender || undefined,
      bio: user.bio || undefined,
      birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : undefined,
      age: user.birthday ? calcAge(user.birthday) : undefined,
      interests: user.interests && user.interests.length > 0 ? user.interests : undefined,
      createdAt: user.createdAt,
    };
  }
}