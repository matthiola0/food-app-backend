// src/post/dto/post.model.ts

import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Restaurant } from 'src/restaurant/dto/restaurant.model'; // 引用剛才的 Restaurant 模型

@ObjectType()
export class Post {
  @Field(() => ID)
  postId: string;

  @Field()
  title: string;

  @Field()
  content: string;

  @Field(() => Float)
  rating: number;

  @Field(() => Restaurant)
  restaurant: Restaurant; 

  @Field(() => String) 
  authorId: string;

  @Field({ nullable: true }) // 設為可選，允許沒有圖片的食記
  imageUrl?: string;
}