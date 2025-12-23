import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('Match')
export class Match {
  @Field(() => ID)
  id: string;

  @Field()
  userA: string;

  @Field()
  userB: string;

  @Field()
  createdAt: Date;
}
