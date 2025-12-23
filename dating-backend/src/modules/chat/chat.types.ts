import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType()
export class Message {
  @Field(() => ID)
  matchId: string;

  @Field()
  senderId: string;

  @Field()
  text: string;

  @Field()
  createdAt: Date;
}
