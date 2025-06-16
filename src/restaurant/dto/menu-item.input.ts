import { InputType, Field, Float } from '@nestjs/graphql';
@InputType()
export class MenuItemInput {
  @Field()
  name: string;

  @Field(() => Float)
  price: number;
  
  @Field({ nullable: true })
  description?: string;
}