// src/restaurant/restaurant.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { Restaurant } from './dto/restaurant.model';

@Injectable()
export class RestaurantService {
  private readonly db = admin.firestore();
  private readonly restaurantCollection = this.db.collection('restaurants');

  // 建立餐廳
  async createRestaurant(name: string, address: string, tags: string[]): Promise<string> {
    const docRef = this.restaurantCollection.doc(); // 產生一個新的文件參照
    await docRef.set({
      name,
      address,
      tags,
      createdAt: new Date(),
    });
    return docRef.id; // 回傳新建立的餐廳 ID
  }

  // 查詢所有餐廳
  async findAll(): Promise<Restaurant[]> {
    const snapshot = await this.restaurantCollection.orderBy('name').get();
    if (snapshot.empty) {
      return [];
    }
    return snapshot.docs.map(doc => ({
      restaurantId: doc.id,
      ...doc.data(),
    })) as Restaurant[];
  }

  // 根據 ID 查詢單一餐廳
  async findById(id: string): Promise<Restaurant> {
    const doc = await this.restaurantCollection.doc(id).get();
    if (!doc.exists) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    return {
      restaurantId: doc.id,
      ...doc.data(),
    } as Restaurant;
  }
}