// src/restaurant/restaurant.resolver.ts

import { Args, Float, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Restaurant } from './dto/restaurant.model';
import { RestaurantService } from './restaurant.service';

@Resolver()
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Mutation(() => String) // 回傳類型是 String (餐廳 ID)
  async createRestaurant(
    @Args('name') name: string,
    @Args('address') address: string,
    @Args('lat', { type: () => Float }) lat: number,
    @Args('lng', { type: () => Float }) lng: number,
  ): Promise<string> {
    return this.restaurantService.createRestaurant(name, address, lat, lng);
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

  @Query(() => [Restaurant], { name: 'nearbyRestaurants' })
  async getNearbyRestaurants(
    @Args('geohashPrefix', { type: () => String }) geohashPrefix: string,
  ): Promise<Restaurant[]> {
    // Geohash 的精度，7 位約等於 150 公尺範圍
    // const prefix = geohashPrefix.substring(0, 7);
    return this.restaurantService.findNearby(geohashPrefix);
  }
}