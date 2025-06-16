// src/restaurant/restaurant.resolver.ts

import { Resolver, Query, Mutation, Args, Float, Context, Parent, ResolveField } from '@nestjs/graphql';
import { RestaurantService } from './restaurant.service';
import { Restaurant } from './dto/restaurant.model';
import { ForbiddenException, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { HashtagCount } from './dto/hashtag-count.model';
import { UpdateRestaurantInput } from './dto/update-restaurant.input';

@Resolver(() => Restaurant)
export class RestaurantResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

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
    return this.restaurantService.findNearby(geohashPrefix);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => String)
  async createRestaurant(
    @Args('name') name: string,
    @Args('address') address: string,
    @Args('lat', { type: () => Float }) lat: number,
    @Args('lng', { type: () => Float }) lng: number,
    @Context() context,
    @Args('info', { type: () => String, nullable: true }) info?: string,
  ): Promise<string> {
    if (context.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can create restaurants.');
    }
    return this.restaurantService.createRestaurant(name, address, lat, lng, info);
  }

  @UseGuards(AuthGuard)
  @Mutation(() => Restaurant)
  async updateRestaurant(
    @Args('id') id: string,
    @Args('input') input: UpdateRestaurantInput,
    @Context() context,
  ): Promise<Restaurant> {
    if (context.user.role !== 'ADMIN') {
      throw new ForbiddenException('Only administrators can edit restaurants.');
    }
    return this.restaurantService.updateRestaurantDetails(id, input.info, input.menu);
  }

  @ResolveField('topHashtags', () => [HashtagCount])
  getTopHashtags(@Parent() restaurant: any): HashtagCount[] {
    const hashtagCounts = restaurant.hashtagCounts;
    if (!hashtagCounts) return [];
    return Object.entries(hashtagCounts)
      .map(([tag, count]) => ({ tag, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }
}