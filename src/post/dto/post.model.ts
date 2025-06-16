// src/post/dto/post.model.ts

import { Field, Float, ID, ObjectType } from '@nestjs/graphql';
import { Restaurant } from 'src/restaurant/dto/restaurant.model';
import { User } from 'src/user/dto/user.model';
import { UserModule } from 'src/user/user.module';
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

  @Field(() => [String], { nullable: 'itemsAndList' })
  hashtags?: string[];

  @Field(() => User) // 從 ID 改為完整的 User 物件
  author: User;

  @Field(() => [String], { nullable: 'itemsAndList' }) // 設為可選，允許沒有圖片的食記
  imageUrls?: string[];
}