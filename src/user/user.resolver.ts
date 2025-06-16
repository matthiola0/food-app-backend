// src/user/user.resolver.ts
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { User } from './dto/user.model';
import { UserService } from './user.service';
import { UseGuards } from '@nestjs/common';
import { Context } from '@nestjs/graphql';
import { AuthGuard } from 'src/auth/auth.guard';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User)
  async register(
    @Args('email') email: string,
    @Args('password') password: string,
    @Args('displayName') displayName: string,
  ): Promise<User> {
    return this.userService.register(email, password, displayName);
  }

  @UseGuards(AuthGuard) // 使用守衛保護
  @Mutation(() => User)
  async ensureUser(@Context() context): Promise<User> {
    // 從 context 取得由 AuthGuard 解碼後的 Firebase user 物件
    const firebaseUser = context.user; 
    return this.userService.ensureUser(firebaseUser);
  }
}