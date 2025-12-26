import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class UpdateProfileInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  gender: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  birthday?: string;

  @Field(() => [String], { nullable: true })
  photos?: string[];

  @Field(() => [String], { nullable: true })
  interests?: string[];
}