import { InputType, Field } from '@nestjs/graphql';
import { SwipeType } from './swipe.enum';

@InputType()
export class SwipeInput {
  @Field()
  toUserId: string;

  @Field(() => String)
  type: SwipeType;
}
