// src/restaurant/dto/menu-item.model.ts
import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MenuItem {
  @Field()
  name: string;

  @Field(() => Float)
  price: number;
  
  @Field({ nullable: true })
  description?: string;
}