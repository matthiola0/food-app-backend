// src/post/post.resolver.ts

import { Resolver, Query, Mutation, Args, Context, Parent, ResolveField } from '@nestjs/graphql'; // 1. 在這裡加上 Parent, ResolveField
import { PostService } from './post.service';
import { Post } from './dto/post.model';
import { UseGuards, ForbiddenException, NotFoundException } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { User } from 'src/user/dto/user.model';
import { UserService } from 'src/user/user.service';
import { UpdatePostInput } from './dto/update-post.input';

@Resolver(() => Post)
export class PostResolver {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UserService, // 注入 UserService
  ) {}

  @UseGuards(AuthGuard)
  @Mutation(() => String)
  async createPost(
    @Args('title') title: string,
    @Args('content') content: string,
    @Args('rating') rating: number,
    @Args('restaurantId') restaurantId: string,
    @Context() context,
    @Args('imageUrls', { type: () => [String], nullable: 'itemsAndList' }) imageUrls?: string[],
    @Args('hashtags', { type: () => [String], nullable: 'itemsAndList' }) hashtags?: string[],
  ): Promise<string> {
    const user = context.user;
    if (!user || !user.uid) {
        throw new Error('User not authenticated or UID not found in token.');
    }

    // 將使用者 uid 作為 authorId 傳入
    return this.postService.createPost(title, content, rating, restaurantId, user.uid, imageUrls, hashtags);
  }

  // 查詢食記的 Query
  @Query(() => Post, { name: 'post' }) // 回傳 Post 物件，查詢名稱為 'post'
  async getPostById(
    @Args('id', { type: () => String }) id: string,
  ): Promise<Post> {
    return this.postService.findPostById(id);
  }

  @Query(() => [Post], { name: 'postsByRestaurant' })
    async getPostsByRestaurant(
      @Args('restaurantId', { type: () => String }) restaurantId: string,
    ): Promise<Post[]> {
      return this.postService.findAllByRestaurantId(restaurantId);
    }

  // 刪除食記的 Mutation
  @UseGuards(AuthGuard)
  @Mutation(() => Boolean) // 成功時回傳布林值 true
  async deletePost(
    @Args('postId', { type: () => String }) postId: string,
    @Context() context,
  ): Promise<boolean> {
    const user = context.user;
    return this.postService.deletePost(postId, user.uid);
  }

  // 更新食記的 Mutation
  @UseGuards(AuthGuard)
  @Mutation(() => Post) // 成功時回傳更新後的 Post 物件
  async updatePost(
    @Args('postId', { type: () => String }) postId: string,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @Context() context,
  ): Promise<Post> {
    const user = context.user;
    return this.postService.updatePost(postId, user.uid, updatePostInput);
  }

  @ResolveField('author', () => User)
  async getAuthor(@Parent() post: any): Promise<User> {
    const author = await this.userService.findById(post.authorId);

    if (!author) {
      throw new NotFoundException(`Author with ID ${post.authorId} not found.`);
    }
    return author;
  }
}