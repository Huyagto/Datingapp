import { ObjectType, Field } from '@nestjs/graphql';
import { User } from 'src/modules/users/user.type';

@ObjectType()
export class AuthPayload {
  @Field()
  accessToken: string;

  @Field(() => User)
  user: User;
}

