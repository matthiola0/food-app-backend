import { Module } from '@nestjs/common';
import { PostService } from './post.service';
import { PostResolver } from './post.resolver';
import { RestaurantModule } from 'src/restaurant/restaurant.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [RestaurantModule, UserModule],
  providers: [PostService, PostResolver]
})
export class PostModule {}
