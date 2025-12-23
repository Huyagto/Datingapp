import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class ProfileDTO {
  @Field(() => String)  
  id: string;

  @Field(() => String)  
  name: string;

  @Field(() => String, { nullable: true })  
  gender: string | null;

  @Field(() => String, { nullable: true })  
  bio: string | null;

  @Field(() => Number)  
  age: number;
}