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

  async createPost(
    title: string, 
    content: string, 
    rating: number, 
    restaurantId: string, 
    authorId: string,
    imageUrls?: string[],
    hashtags?: string[]
  ): Promise<string> {
    const postRef = this.postCollection.doc();
    const restaurantRef = this.restaurantCollection.doc(restaurantId);

    await this.db.runTransaction(async (transaction) => {
        const restaurantDoc = await transaction.get(restaurantRef);
        if (!restaurantDoc.exists) {
            throw new NotFoundException(`Restaurant with ID ${restaurantId} not found.`);
        }

        // 建立新的食記文件，並儲存 hashtags
        transaction.set(postRef, {
            title,
            content,
            rating,
            restaurantId,
            authorId,
            imageUrls: imageUrls || [],
            hashtags: hashtags || [],
            createdAt: new Date(),
        });

        // 如果有提供標籤，就更新餐廳的 hashtagCounts
        if (hashtags && hashtags.length > 0) {
            const updates = {};
            hashtags.forEach(tag => {
                updates[`hashtagCounts.${tag}`] = admin.firestore.FieldValue.increment(1);
            });
            transaction.update(restaurantRef, updates);
        }
    });

    return postRef.id;
  }

  async findPostById(postId: string): Promise<Post> {
    const doc = await this.postCollection.doc(postId).get();
    const postData = doc.data();

    if (!postData) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    const restaurantDoc = await this.restaurantCollection.doc(postData.restaurantId).get();
    const restaurantData = restaurantDoc.data();

    if (!restaurantData) {
        throw new NotFoundException(`Restaurant with ID ${postData.restaurantId} not found for Post ${postId}`);
    }

    return {
      postId: doc.id,
      title: postData.title,
      content: postData.content,
      rating: postData.rating,
      authorId: postData.authorId, // Ensure authorId is passed for field resolver
      hashtags: postData.hashtags,
      imageUrls: postData.imageUrls,
      restaurant: {
        restaurantId: restaurantDoc.id,
        name: restaurantData.name,
        address: restaurantData.address,
        lat: restaurantData.lat,
        lng: restaurantData.lng,
        geohash: restaurantData.geohash,
        info: restaurantData.info,
        menu: restaurantData.menu,
        hashtagCounts: restaurantData.hashtagCounts
      },
    } as any; // Using 'as any' to bypass strict DTO typing for now
  }

  async deletePost(postId: string, userId: string): Promise<boolean> {
    const postRef = this.postCollection.doc(postId);
    const doc = await postRef.get();
    const postData = doc.data();

    if (!postData) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    if (postData.authorId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post.');
    }

    await postRef.delete();
    return true;
  }

  async updatePost(postId: string, userId: string, updatePostInput: UpdatePostInput): Promise<Post> {
    const postRef = this.postCollection.doc(postId);
    const doc = await postRef.get();
    const postData = doc.data();

    if (!postData) {
      throw new NotFoundException(`Post with ID ${postId} not found.`);
    }

    if (postData.authorId !== userId) {
      throw new ForbiddenException('You are not allowed to edit this post.');
    }

    await postRef.update({ ...updatePostInput, updatedAt: new Date() });
    return this.findPostById(postId);
  }

  async findAllByRestaurantId(restaurantId: string): Promise<Post[]> {
    const snapshot = await this.postCollection
      .where('restaurantId', '==', restaurantId)
      .get();

    if(snapshot.empty) {
      return [];
    }
    
    const restaurantService = new RestaurantService(); 
    const restaurant = await restaurantService.findById(restaurantId);
    
    const posts = await Promise.all(snapshot.docs.map(async doc => {
        const postData = doc.data();
        return {
          postId: doc.id,
          ...postData,
          restaurant, // Inject the full restaurant object
          authorId: postData.authorId
        };
    }));

    return posts as any[];
  }
}
