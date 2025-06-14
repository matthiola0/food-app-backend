// src/restaurant/dto/restaurant.model.ts

import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType() // 宣告這是一個 GraphQL 物件類型
export class Restaurant {
  @Field(() => ID) // 宣告欄位，類型為 ID
  restaurantId: string;

  @Field()
  name: string;

  @Field()
  address: string;

  @Field(() => [String], { nullable: true }) // 陣列類型，且可為空
  tags?: string[];

  @Field(() => Float)
  lat: number;

  @Field(() => Float)
  lng: number;

  @Field()
  geohash: string;
}