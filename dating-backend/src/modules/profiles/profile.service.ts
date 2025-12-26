// src/profiles/profiles.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserDocument } from '../users/user.schema';
import { Swipe } from '../swipe/swipe.schema';
import { ProfileDTO } from './dto/profile.dto';
import { UpdateProfileInput } from './dto/profile.input';
import { calcAge } from '../../utils/age.util';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { UpdateLocationDto } from '../profiles/dto/update-location.dto';

// 🔥 UPDATE ProfileDTO để có location
export interface ProfileWithLocationDTO extends ProfileDTO {
  location?: {
    coordinates: number[];
    address?: string;
    city?: string;
    country?: string;
    shareLocation: boolean;
  };
}

// 🔥 Interface cho gợi ý thông minh
export interface SmartSuggestionDTO extends ProfileWithLocationDTO {
  commonInterestsCount?: number;
  matchPercentage?: number;
  distance?: number; // Thay đổi: number | undefined thay vì number | null
  distanceUnit?: string;
  score?: number;
  scores?: {
    interest: number;
    profile: number;
    activity: number;
    total: number;
  };
  isNearby?: boolean;
  isActive?: boolean;
}

// 🔥 THÊM TYPE CHO Express.Multer.File
interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

@Injectable()
export class ProfilesService {
  constructor(
    @InjectModel(UserDocument.name)
    private userModel: Model<UserDocument>,

    @InjectModel(Swipe.name)
    private swipeModel: Model<Swipe>,

    private cloudinaryService: CloudinaryService,
  ) {}

  // ========== CÁC PHƯƠNG THỨC VỀ VỊ TRÍ ==========

  // 🔥 Cập nhật vị trí
  async updateLocation(userId: string, locationData: UpdateLocationDto): Promise<ProfileWithLocationDTO> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updateData: any = {
      shareLocation: locationData.shareLocation
    };

    if (locationData.coordinates) {
      // Validate coordinates
      this.validateCoordinates(locationData.coordinates);
      
      updateData.coordinates = locationData.coordinates;
      updateData.locationType = 'Point';
    }

    if (locationData.address) updateData.address = locationData.address;
    if (locationData.city) updateData.city = locationData.city;
    if (locationData.country) updateData.country = locationData.country;

    const updatedUser = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found after update');
    }

    return this.mapUserToProfileDTO(updatedUser);
  }

  // 🔥 Lấy vị trí hiện tại
  async getLocation(userId: string): Promise<{
    coordinates?: number[];
    address?: string;
    city?: string;
    country?: string;
    shareLocation: boolean;
    locationType?: string;
  }> {
    const user = await this.userModel.findById(userId).select('coordinates address city country shareLocation locationType');
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      coordinates: user.coordinates,
      address: user.address,
      city: user.city,
      country: user.country,
      shareLocation: user.shareLocation || false,
      locationType: user.locationType || 'Point',
    };
  }

  // 🔥 Tìm người dùng trong bán kính cụ thể
  async findWithinRadius(
    userId: string,
    centerCoordinates: [number, number],
    radiusInKm: number = 5,
    limit: number = 50,
  ): Promise<SmartSuggestionDTO[]> {
    const currentUser = await this.userModel.findById(userId);
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const swipedIds = await this.getSwipedUserIds(userId);
    const excludedIds = [...swipedIds, userId].map(id => {
      try {
        return new Types.ObjectId(id);
      } catch {
        return null;
      }
    }).filter((id): id is Types.ObjectId => id !== null);

    const users = await this.userModel.find({
      _id: { $nin: excludedIds },
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: centerCoordinates
          },
          $maxDistance: radiusInKm * 1000
        }
      },
      shareLocation: true
    })
    .select('name gender bio photos coordinates address city country birthday interests')
    .limit(limit);

    return users.map(user => {
      const profile = this.mapUserToProfileDTO(user);
      
      // Kiểm tra user.coordinates có tồn tại không
      if (!user.coordinates || !Array.isArray(user.coordinates) || user.coordinates.length < 2) {
        return {
          ...profile,
          commonInterestsCount: 0,
          matchPercentage: 0,
          distance: undefined, // Sửa: undefined thay vì null
          distanceUnit: 'km',
          address: user.address,
          city: user.city,
          country: user.country,
          score: 0
        };
      }
      
      const distance = this.calculateDistance(
        centerCoordinates[1], centerCoordinates[0], // lat, lng
        user.coordinates[1], user.coordinates[0]
      );
      
      return {
        ...profile,
        commonInterestsCount: 0,
        matchPercentage: 0,
        distance: Math.round(distance * 10) / 10,
        distanceUnit: 'km',
        address: user.address,
        city: user.city,
        country: user.country,
        score: 0
      };
    });
  }

  // ========== CÁC PHƯƠNG THỨC PROFILE HIỆN CÓ ==========

  // 🔥 Get my profile
  async getMyProfile(userId: string): Promise<ProfileWithLocationDTO> {
    const userDoc = await this.userModel.findById(userId);
    
    if (!userDoc) {
      throw new NotFoundException('User not found');
    }

    return this.mapUserToProfileDTO(userDoc);
  }

  // 🔥 Update my profile
  async updateMyProfile(userId: string, input: UpdateProfileInput): Promise<ProfileWithLocationDTO> {
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

  // 🔥 Upload photos với Base64 (CHO GRAPHQL)
  async uploadBase64Photos(userId: string, base64Images: string[]): Promise<string[]> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user.photos.length + base64Images.length > 10) {
      throw new BadRequestException('Tối đa 10 ảnh được phép');
    }

    // Convert base64 to files
    const files: UploadedFile[] = base64Images.map((base64, index) => {
      // Remove data URL prefix if present
      const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      
      // Determine mime type
      const mimeMatch = base64.match(/^data:(image\/\w+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      
      return {
        fieldname: 'photos',
        originalname: `photo-${Date.now()}-${index}.${mimeType.split('/')[1] || 'jpg'}`,
        encoding: '7bit',
        mimetype: mimeType,
        buffer: buffer,
        size: buffer.length,
      };
    });

    const urls = await this.cloudinaryService.uploadFiles(files);
    user.photos.push(...urls);
    await user.save();
    
    return urls;
  }

  // 🔥 Upload photos với files (CHO REST API)
  async addPhotos(userId: string, files: UploadedFile[]): Promise<string[]> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    
    if (user.photos.length + files.length > 10) {
      throw new BadRequestException('Tối đa 10 ảnh được phép');
    }
    
    const urls = await this.cloudinaryService.uploadFiles(files);
    user.photos.push(...urls);
    await user.save();
    
    return urls;
  }

  // 🔥 Delete photo
  async deletePhoto(userId: string, photoUrl: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const photoIndex = user.photos.indexOf(photoUrl);
    if (photoIndex === -1) {
      throw new NotFoundException('Photo not found');
    }

    user.photos.splice(photoIndex, 1);
    await user.save();
    
    return { message: 'Photo deleted successfully' };
  }

  // 🔥 Set primary photo
  async setPrimaryPhoto(userId: string, photoUrl: string): Promise<{ message: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const photoIndex = user.photos.indexOf(photoUrl);
    if (photoIndex === -1) {
      throw new NotFoundException('Photo not found');
    }

    // Đưa ảnh lên đầu mảng
    const [primaryPhoto] = user.photos.splice(photoIndex, 1);
    user.photos.unshift(primaryPhoto);
    await user.save();
    
    return { message: 'Primary photo set successfully' };
  }

  // 🔥 Get nearby profiles (ĐÃ CẬP NHẬT)
  async getNearbyProfiles(
    userId: string,
    interestFilters?: string[],
    limit: number = 20,
    maxDistanceInKm: number = 10,
  ): Promise<ProfileWithLocationDTO[]> {
    const currentUser = await this.userModel.findById(userId);
    
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    // Nếu người dùng không có vị trí hoặc không chia sẻ vị trí
    if (!currentUser.coordinates || !currentUser.shareLocation) {
      return this.getProfilesWithoutLocation(userId, interestFilters, limit);
    }

    const swipedIds = await this.getSwipedUserIds(userId);
    const query = this.buildNearbyProfilesQueryWithLocation(
      userId, 
      currentUser.coordinates as [number, number], 
      swipedIds, 
      interestFilters,
      maxDistanceInKm
    );

    const users = await this.userModel
      .find(query)
      .select('name gender bio birthday interests photos coordinates address city country shareLocation createdAt')
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

  // 🔥 Get suggested profiles (ĐÃ CẬP NHẬT)
  async getSuggestedProfiles(
    userId: string,
    limit: number = 10,
  ): Promise<SmartSuggestionDTO[]> {
    const currentUser = await this.userModel.findById(userId);
    
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const currentInterests = currentUser.interests || [];
    
    if (currentInterests.length === 0) {
      const profiles = await this.getNearbyProfiles(userId, [], limit);
      return profiles.map(profile => ({
        ...profile,
        commonInterestsCount: 0,
        matchPercentage: 0,
        distance: undefined,
        distanceUnit: 'km',
        score: 0
      }));
    }

    const swipedIds = await this.getSwipedUserIds(userId);
    const excludedIds = [...swipedIds, userId].map(id => {
      try {
        return new Types.ObjectId(id);
      } catch {
        return null;
      }
    }).filter((id): id is Types.ObjectId => id !== null);
    
    // Build query với ưu tiên vị trí nếu có
    const matchStage: any = {
      _id: { $nin: excludedIds },
      interests: { $exists: true, $ne: null }, 
    };

    // Kiểm tra coordinates hợp lệ
    const hasValidCoordinates = currentUser.coordinates && 
                               Array.isArray(currentUser.coordinates) && 
                               currentUser.coordinates.length >= 2;
    
    // Nếu current user có vị trí và chia sẻ, tìm người gần
    if (hasValidCoordinates && currentUser.shareLocation) {
      matchStage.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: currentUser.coordinates
          },
          $maxDistance: 50 * 1000 // 50km
        }
      };
      matchStage.shareLocation = true;
    }

    const result = await this.userModel.aggregate([
      {
        $match: matchStage
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
          },
          // Thêm điểm ưu tiên cho người gần
          proximityScore: {
            $cond: [
              { $and: ["$coordinates", { $eq: ["$shareLocation", true] }] },
              100, // Thêm điểm nếu có vị trí
              0
            ]
          }
        }
      },
      {
        $match: {
          commonInterestsCount: { $gt: 0 }
        }
      },
      {
        $addFields: {
          totalScore: {
            $add: [
              { $multiply: ["$commonInterestsCount", 10] },
              "$proximityScore"
            ]
          }
        }
      },
      {
        $sort: { totalScore: -1, createdAt: -1 }
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
          photos: 1,
          safeInterests: 1, 
          coordinates: 1,
          address: 1,
          city: 1,
          country: 1,
          shareLocation: 1,
          createdAt: 1,
          commonInterestsCount: 1,
          totalScore: 1
        }
      }
    ]);

    return result.map(user => ({
      id: user._id.toString(),
      name: user.name,
      gender: user.gender || undefined,
      bio: user.bio || undefined,
      photos: user.photos || [],
      birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : undefined,
      age: user.birthday ? calcAge(new Date(user.birthday)) : undefined,
      interests: user.safeInterests && user.safeInterests.length > 0 ? user.safeInterests : undefined,
      location: user.shareLocation && user.coordinates ? {
        coordinates: user.coordinates,
        address: user.address,
        city: user.city,
        country: user.country,
        shareLocation: user.shareLocation,
      } : undefined,
      commonInterestsCount: user.commonInterestsCount,
      matchPercentage: Math.round((user.commonInterestsCount / currentInterests.length) * 100),
      distance: undefined,
      distanceUnit: 'km',
      score: user.totalScore,
      createdAt: user.createdAt,
    }));
  }

  // 🔥 Get smart suggestions (Gợi ý thông minh)
  async getSmartSuggestions(
    userId: string,
    limit: number = 10,
  ): Promise<SmartSuggestionDTO[]> {
    const currentUser = await this.userModel.findById(userId);
    
    if (!currentUser) {
      throw new NotFoundException('User not found');
    }

    const currentInterests = currentUser.interests || [];
    const swipedIds = await this.getSwipedUserIds(userId);
    const excludedIds = [...swipedIds, userId].map(id => {
      try {
        return new Types.ObjectId(id);
      } catch {
        return null;
      }
    }).filter((id): id is Types.ObjectId => id !== null);

    const matchStage: any = {
      _id: { $nin: excludedIds },
    };

    // Kiểm tra coordinates hợp lệ
    const hasValidCoordinates = currentUser.coordinates && 
                               Array.isArray(currentUser.coordinates) && 
                               currentUser.coordinates.length >= 2;
    
    // Nếu có vị trí, tìm người gần và có chia sẻ vị trí
    if (hasValidCoordinates && currentUser.shareLocation) {
      matchStage.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: currentUser.coordinates
          },
          $maxDistance: 50 * 1000 // 50km
        }
      };
      matchStage.shareLocation = true;
    }

    const pipeline: any[] = [
      { $match: matchStage },
      {
        $addFields: {
          safeInterests: {
            $cond: {
              if: { $isArray: "$interests" },
              then: "$interests",
              else: []
            }
          },
          hasPhotos: {
            $cond: {
              if: { $and: [{ $isArray: "$photos" }, { $gt: [{ $size: "$photos" }, 0] }] },
              then: true,
              else: false
            }
          }
        }
      }
    ];

    // Tính điểm ưu tiên
    pipeline.push({
      $addFields: {
        interestScore: {
          $cond: [
            { $gt: [currentInterests.length, 0] },
            {
              $multiply: [
                {
                  $size: {
                    $setIntersection: ["$safeInterests", currentInterests]
                  }
                },
                15
              ]
            },
            0
          ]
        },
        profileCompletenessScore: {
          $add: [
            { $cond: [{ $and: ["$gender", { $ne: ["$gender", ""] }] }, 10, 0] },
            { $cond: [{ $and: ["$bio", { $ne: ["$bio", ""] }] }, 10, 0] },
            { $cond: [{ $eq: ["$hasPhotos", true] }, 20, 0] },
            { $cond: ["$birthday", 10, 0] },
            { $cond: [{ $and: ["$coordinates", { $eq: ["$shareLocation", true] }] }, 15, 0] }
          ]
        },
        activityScore: {
          $cond: [
            "$createdAt",
            {
              $subtract: [
                100,
                {
                  $multiply: [
                    {
                      $divide: [
                        { $subtract: [new Date(), "$createdAt"] },
                        1000 * 60 * 60 * 24 * 7 // 1 tuần
                      ]
                    },
                    5
                  ]
                }
              ]
            },
            50
          ]
        }
      }
    });

    pipeline.push({
      $addFields: {
        totalScore: {
          $add: [
            "$interestScore",
            "$profileCompletenessScore",
            "$activityScore"
          ]
        }
      }
    });

    pipeline.push({
      $match: {
        totalScore: { $gt: 30 } // Chỉ hiển thị profile có điểm > 30
      }
    });

    pipeline.push({ $sort: { totalScore: -1, createdAt: -1 } });
    pipeline.push({ $limit: limit });

    // Project để trả về
    pipeline.push({
      $project: {
        name: 1,
        gender: 1,
        bio: 1,
        photos: 1,
        birthday: 1,
        safeInterests: 1,
        coordinates: 1,
        address: 1,
        city: 1,
        country: 1,
        shareLocation: 1,
        createdAt: 1,
        interestScore: 1,
        profileCompletenessScore: 1,
        activityScore: 1,
        totalScore: 1,
        commonInterestsCount: {
          $size: {
            $setIntersection: ["$safeInterests", currentInterests]
          }
        }
      }
    });

    const result = await this.userModel.aggregate(pipeline);

    return result.map(user => {
      const profile = this.mapUserToProfileDTO(user as any);
      
      // Tính khoảng cách nếu có coordinates
      let distance: number | undefined = undefined;
      if (hasValidCoordinates && 
          user.coordinates && 
          Array.isArray(user.coordinates) && 
          user.coordinates.length >= 2) {
        distance = this.calculateDistance(
          currentUser.coordinates![1], currentUser.coordinates![0],
          user.coordinates[1], user.coordinates[0]
        );
      }

      return {
        ...profile,
        commonInterestsCount: user.commonInterestsCount || 0,
        matchPercentage: currentInterests.length > 0 
          ? Math.round(((user.commonInterestsCount || 0) / currentInterests.length) * 100)
          : 0,
        distance: distance ? Math.round(distance * 10) / 10 : undefined,
        distanceUnit: 'km',
        scores: {
          interest: user.interestScore || 0,
          profile: user.profileCompletenessScore || 0,
          activity: user.activityScore || 0,
          total: user.totalScore || 0
        },
        isNearby: distance ? distance <= 10 : false,
        isActive: (user.activityScore || 0) > 70,
        score: user.totalScore || 0
      };
    });
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
  ): Promise<SmartSuggestionDTO[]> {
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
        distance: undefined,
        distanceUnit: 'km',
        score: 0
      };
    });

    profilesWithMatch.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
    return profilesWithMatch.slice(0, limit);
  }

  // ========== CÁC PHƯƠNG THỨC PRIVATE ==========

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

    if (interestFilters && interestFilters.length > 0) {
      query.interests = {
        $in: interestFilters,
      };
    }

    return query;
  }

  private buildNearbyProfilesQueryWithLocation(
    userId: string,
    userCoordinates: [number, number],
    swipedIds: string[],
    interestFilters?: string[],
    maxDistanceInKm: number = 10,
  ): any {
    const query: any = {
      _id: {
        $ne: userId,
        $nin: swipedIds,
      },
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: userCoordinates
          },
          $maxDistance: maxDistanceInKm * 1000
        }
      },
      shareLocation: true,
    };

    if (interestFilters && interestFilters.length > 0) {
      query.interests = {
        $in: interestFilters,
      };
    }

    return query;
  }

  private async getProfilesWithoutLocation(
    userId: string,
    interestFilters?: string[],
    limit: number = 20,
  ): Promise<ProfileWithLocationDTO[]> {
    const swipedIds = await this.getSwipedUserIds(userId);
    const query = this.buildNearbyProfilesQuery(userId, swipedIds, interestFilters);

    const users = await this.userModel
      .find(query)
      .select('name gender bio birthday interests photos createdAt')
      .limit(limit);

    return users.map(user => this.mapUserToProfileDTO(user));
  }

  private processInterests(interests: string[]): string[] {
    const processed = interests
      .map(interest => interest.trim())
      .filter(interest => interest.length > 0);
    
    return [...new Set(processed)];
  }

  private validateCoordinates(coordinates: number[]): void {
    if (!Array.isArray(coordinates) || coordinates.length !== 2) {
      throw new BadRequestException('Coordinates must be an array of 2 numbers [longitude, latitude]');
    }

    const [longitude, latitude] = coordinates;
    
    if (typeof longitude !== 'number' || typeof latitude !== 'number') {
      throw new BadRequestException('Longitude and latitude must be numbers');
    }

    if (longitude < -180 || longitude > 180) {
      throw new BadRequestException('Longitude must be between -180 and 180');
    }

    if (latitude < -90 || latitude > 90) {
      throw new BadRequestException('Latitude must be between -90 and 90');
    }
  }

  private calculateDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
  ): number {
    const R = 6371; // Bán kính Trái đất tính bằng km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private mapUserToProfileDTO(user: UserDocument): ProfileWithLocationDTO {
    const profile: ProfileWithLocationDTO = {
      id: user._id.toString(),
      name: user.name,
      gender: user.gender || undefined,
      bio: user.bio || undefined,
      photos: user.photos && user.photos.length > 0 ? user.photos : undefined,
      birthday: user.birthday ? user.birthday.toISOString().split('T')[0] : undefined,
      age: user.birthday ? calcAge(user.birthday) : undefined,
      interests: user.interests && user.interests.length > 0 ? user.interests : undefined,
      createdAt: user.createdAt,
    };

    // Thêm thông tin vị trí nếu có và được chia sẻ
    if (user.shareLocation && user.coordinates && Array.isArray(user.coordinates) && user.coordinates.length >= 2) {
      profile.location = {
        coordinates: user.coordinates,
        address: user.address,
        city: user.city,
        country: user.country,
        shareLocation: user.shareLocation,
      };
    }

    return profile;
  }
}