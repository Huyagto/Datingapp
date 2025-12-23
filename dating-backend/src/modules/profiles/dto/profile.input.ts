// src/modules/profile/dto/profile.input.ts
import { InputType, Field, GraphQLISODateTime } from '@nestjs/graphql';

@InputType()
export class UpdateProfileInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  birthday?: string;
}
// @InputType()
// export class UpdateLocationInput {
//   @Field()
//   latitude: number;

//   @Field()
//   longitude: number;
// }
