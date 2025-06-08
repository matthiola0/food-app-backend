import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { RestaurantModule } from 'src/restaurant/restaurant.module';

@Module({
  imports: [RestaurantModule],
  providers: [PostService, PostResolver]
})
export class PostModule {}
