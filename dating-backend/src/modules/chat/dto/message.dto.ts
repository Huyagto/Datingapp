import { ObjectType, Field, ID, GraphQLISODateTime } from '@nestjs/graphql';

@ObjectType()
export class MessageDTO {
  @Field(() => ID)
  id: string;

  @Field()
  matchId: string;

  @Field()
  senderId: string;

  @Field()
  text: string;

  @Field(() => GraphQLISODateTime)
  createdAt: Date;
}
