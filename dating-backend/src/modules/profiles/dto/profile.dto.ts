// src/profiles/dto/profile.dto.ts
import { ObjectType, Field, ID, Int } from '@nestjs/graphql';

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

  @Field({ nullable: true })
  age?: number;

  @Field(() => [String], { nullable: true })
  interests?: string[];

  @Field()
  createdAt: Date;
}
@ObjectType()
export class SuggestedProfileDTO extends ProfileDTO {
  @Field(() => Int, { nullable: true })
  commonInterestsCount?: number;

  @Field(() => Int, { nullable: true })
  matchPercentage?: number;
}