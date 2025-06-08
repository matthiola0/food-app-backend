// src/post/dto/update-post.input.ts
import { InputType, Field, Float } from '@nestjs/graphql';

@InputType()
export class UpdatePostInput {
  @Field({ nullable: true }) // 每個欄位都是可選的
  title?: string;

  @Field({ nullable: true })
  content?: string;

  @Field(() => Float, { nullable: true })
  rating?: number;
}