// src/restaurant/restaurant.resolver.ts

import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './dto/restaurant.model';
import { RestaurantService } from './restaurant.service';

@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => String) // 回傳類型是 String (餐廳 ID)
  async createRestaurant(
    @Args('name') name: string,
    @Args('address') address: string,
    @Args('tags', { type: () => [String] }) tags: string[],
  ): Promise<string> {
    return this.restaurantService.createRestaurant(name, address, tags);
  }

  //查詢所有餐廳的 Query
  @Query(() => [Restaurant], { name: 'restaurants' })
  async getAllRestaurants(): Promise<Restaurant[]> {
    return this.restaurantService.findAll();
  }

  // 查詢單一餐廳的 Query
  @Query(() => Restaurant, { name: 'restaurant' })
  async getRestaurantById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Restaurant> {
    return this.restaurantService.findById(id);
  }
}