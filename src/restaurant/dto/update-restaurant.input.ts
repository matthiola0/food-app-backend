import { InputType, Field } from '@nestjs/graphql';
import { MenuItemInput } from './menu-item.input';

@InputType()
export class UpdateRestaurantInput {
  @Field({ nullable: true })
  info?: string;
  
  @Field(() => [MenuItemInput], { nullable: true })
  menu?: MenuItemInput[];
}