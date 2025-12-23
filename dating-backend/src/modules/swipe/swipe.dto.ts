import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class SwipeResult {
  @Field()
  isMatch: boolean;

  @Field({ nullable: true })
  matchId?: string;
}
