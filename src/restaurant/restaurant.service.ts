// src/restaurant/restaurant.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as ngeohash from 'ngeohash';
import { Restaurant } from './dto/restaurant.model';
import { MenuItem } from './dto/menu-item.model';

@Injectable()
export class RestaurantService {
  private readonly db = admin.firestore();
  private readonly restaurantCollection = this.db.collection('restaurants');

  // 建立餐廳
  async createRestaurant(name: string, address: string, lat: number, lng: number, info?: string): Promise<string> {
    const geohash = ngeohash.encode(lat, lng);
    const docRef = this.restaurantCollection.doc();
    await docRef.set({
      name,
      address,
      lat,
      lng,
      geohash,
      info: info || '',
      menu: [],
      hashtagCounts: {},
    });
    return docRef.id;
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
  
  async findNearby(geohashPrefix: string): Promise<Restaurant[]> {
    const endPrefix = geohashPrefix + '~'; // Geohash 查詢的結束邊界
    const querySnapshot = await this.restaurantCollection
      .where('geohash', '>=', geohashPrefix)
      .where('geohash', '<', endPrefix)
      .limit(50) // 限制最多回傳 50 筆
      .get();

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        restaurantId: doc.id,
        name: data.name,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        geohash: data.geohash,
      };
    });
  }

  async updateRestaurantDetails(id: string, info?: string, menu?: MenuItem[]): Promise<Restaurant> {
    const updates = {};
    if (info !== undefined) updates['info'] = info;
    if (menu !== undefined) updates['menu'] = menu.map(item => ({...item})); // 確保是普通物件
    await this.restaurantCollection.doc(id).update(updates);
    return this.findById(id);
  }
}

