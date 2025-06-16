// src/restaurant/dto/restaurant.model.ts

import { HashtagCount } from './hashtag-count.model';
import { MenuItem } from './menu-item.model';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Restaurant {
  @Field(() => ID) 
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

  @Field({ nullable: true })
  info?: string;

  @Field(() => [HashtagCount], { nullable: 'itemsAndList' })
  topHashtags?: HashtagCount[];

  @Field(() => [MenuItem], { nullable: 'itemsAndList' })
  menu?: MenuItem[];
}