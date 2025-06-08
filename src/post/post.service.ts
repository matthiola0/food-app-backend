// src/post/post.service.ts

import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { RestaurantService } from 'src/restaurant/restaurant.service';
import { Post } from './dto/post.model';
import { UpdatePostInput } from './dto/update-post.input';

@Injectable()
export class PostService {
  private readonly db = admin.firestore();
  private readonly postCollection = this.db.collection('posts');
  private readonly restaurantCollection = this.db.collection('restaurants');

  // 建立食記
  async createPost(
    title: string, content: string, rating: number, 
    restaurantId: string, authorId: string, imageUrls?: string[],
  ): Promise<string> {
    const docRef = this.postCollection.doc();
    await docRef.set({
      title,
      content,
      rating,
      restaurantId,
      authorId,
      imageUrls: imageUrls || [],
      createdAt: new Date(),
    });
    return docRef.id;
  }
  // 查詢食記
  async findPostById(postId: string): Promise<Post> {
    const doc = await this.postCollection.doc(postId).get();
    const postData = doc.data(); // 先取得資料

    // 判斷 postData 是否存在
    if (!postData) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // 既然 postData 存在，就可以安全地使用它的屬性
    const restaurantDoc = await this.restaurantCollection.doc(postData.restaurantId).get();
    const restaurantData = restaurantDoc.data(); // 先取得餐廳資料

    // 判斷 restaurantData 是否存在
    if (!restaurantData) {
        throw new NotFoundException(`Restaurant with ID ${postData.restaurantId} not found for Post ${postId}`);
    }

    // 所有資料都確認存在後，再組合回傳
    return {
      postId: doc.id,
      title: postData.title,
      content: postData.content,
      rating: postData.rating,
      restaurant: {
        restaurantId: restaurantDoc.id,
        name: restaurantData.name,
        address: restaurantData.address,
        tags: restaurantData.tags,
      },
    } as Post;
  }

  // 刪除食記的方法
  async deletePost(postId: string, userId: string): Promise<boolean> {
    const postRef = this.postCollection.doc(postId);
    const doc = await postRef.get();

    // 先取得資料
    const postData = doc.data();

    // 直接對資料進行檢查，這樣 TypeScript 就能理解
    if (!postData) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    // 在這個檢查之後，TypeScript 就知道 postData 肯定有值
    if (postData.authorId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post.');
    }

    await postRef.delete();
    return true;
  }

  // 更新食記的方法
  async updatePost(postId: string, userId: string, updatePostInput: UpdatePostInput): Promise<Post> {
    const postRef = this.postCollection.doc(postId);
    const doc = await postRef.get();

    const postData = doc.data();

    // 同樣進行更穩健的檢查
    if (!postData) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    if (postData.authorId !== userId) {
      throw new ForbiddenException('You are not allowed to edit this post.');
    }

    await postRef.update({ ...updatePostInput, updatedAt: new Date() });

    return this.findPostById(postId);
  }

  // 查詢某家餐廳的所有食記
  async findAllByRestaurantId(restaurantId: string): Promise<Post[]> {
    const snapshot = await this.postCollection
      .where('restaurantId', '==', restaurantId)
      .get();

    if(snapshot.empty) {
      return [];
    }

    // 由於 Post 模型需要 restaurant 物件，我們需要先取得餐廳資訊
    const restaurant = await new RestaurantService().findById(restaurantId);

    return snapshot.docs.map(doc => ({
      postId: doc.id,
      ...doc.data(),
      restaurant, // 注入完整的 restaurant 物件
    })) as Post[];
  }
}