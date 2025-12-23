import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType('User')
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field()
  gender?: string;

  @Field({ nullable: true })
  bio?: string;

  @Field(() => [String])
  photos: string[];

  @Field()
  createdAt: Date;
}
