// src/user/dto/user.model.ts
import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class User {
  @Field(() => ID)
  uid: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  displayName?: string;
}