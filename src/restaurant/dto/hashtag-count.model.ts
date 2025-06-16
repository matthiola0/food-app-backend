
import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class HashtagCount {
  @Field()
  tag: string;

  @Field(() => Int)
  count: number;
}