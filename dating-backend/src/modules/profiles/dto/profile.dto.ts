// src/profiles/dto/profile.dto.ts
import { ObjectType, Field, ID, Int, Float } from '@nestjs/graphql';

@ObjectType()
class LocationType {
  @Field(() => [Float])
  coordinates: number[];

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  country?: string;

  @Field()
  shareLocation: boolean;
}

@ObjectType()
class ProfileScoresType {
  @Field(() => Int, { nullable: true })
  interest?: number;

  @Field(() => Int, { nullable: true })
  profile?: number;

  @Field(() => Int, { nullable: true })
  activity?: number;

  @Field(() => Int, { nullable: true })
  total?: number;
}

@ObjectType()
export class ProfileDTO {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field({ nullable: true })
  birthday?: string;

  @Field(() => Int, { nullable: true })
  age?: number;
  
  @Field(() => [String], { nullable: true })
  photos?: string[];

  @Field(() => [String], { nullable: true })
  interests?: string[];

  @Field(() => LocationType, { nullable: true })
  location?: LocationType;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class SuggestedProfileDTO extends ProfileDTO {
  @Field(() => Int, { nullable: true })
  commonInterestsCount?: number;

  @Field(() => Int, { nullable: true })
  matchPercentage?: number;

  @Field(() => Float, { nullable: true })
  distance?: number;

  @Field({ nullable: true })
  distanceUnit?: string;

  @Field(() => Int, { nullable: true })
  score?: number;
}

@ObjectType()
export class SmartSuggestionProfileDTO extends SuggestedProfileDTO {
  @Field(() => ProfileScoresType, { nullable: true })
  scores?: ProfileScoresType;

  @Field(() => Boolean, { nullable: true })
  isNearby?: boolean;

  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;
}

// DTO cho location response
@ObjectType()
export class LocationResponse {
  @Field(() => [Float], { nullable: true })
  coordinates?: number[];

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  country?: string;

  @Field()
  shareLocation: boolean;

  @Field({ nullable: true })
  locationType?: string;
}

// Input DTO cho cập nhật location
import { InputType } from '@nestjs/graphql';

@InputType()
export class UpdateLocationInput {
  @Field(() => [Float], { nullable: true })
  coordinates?: number[];

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  country?: string;

  @Field({ nullable: true })
  shareLocation?: boolean;
}

// Input DTO cho tìm kiếm theo bán kính
@InputType()
export class FindWithinRadiusInput {
  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  lng: number;

  @Field(() => Float, { nullable: true, defaultValue: 5 })
  radiusInKm?: number = 5;

  @Field(() => Int, { nullable: true, defaultValue: 50 })
  limit?: number = 50;
}

// Input DTO cho nearby profiles với filter
@InputType()
export class NearbyProfilesInput {
  @Field(() => [String], { nullable: true })
  interestFilters?: string[];

  @Field(() => Int, { nullable: true, defaultValue: 20 })
  limit?: number = 20;

  @Field(() => Float, { nullable: true, defaultValue: 10 })
  maxDistanceInKm?: number = 10;
}