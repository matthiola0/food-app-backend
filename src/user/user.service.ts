// src/user/user.service.ts
import { Injectable, ConflictException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { User } from './dto/user.model';
import { UserRecord } from 'firebase-admin/auth';

@Injectable()
export class UserService {
  private readonly firestore = admin.firestore();

  async register(email: string, password: string): Promise<User> {
    try {
      // 1. 在 Firebase Authentication 中建立使用者
      const userRecord = await admin.auth().createUser({
        email,
        password,
      });

      // 2. 在我們的 Firestore `users` 集合中建立對應的資料
      const userRef = this.firestore.collection('users').doc(userRecord.uid);
      await userRef.set({
        email: userRecord.email,
        createdAt: new Date(),
      });

      return {
        uid: userRecord.uid,
        email: email,
      };
    } catch (error) {
      // 處理 Email 已被註冊的錯誤
      if (error.code === 'auth/email-already-exists') {
        throw new ConflictException('This email is already registered.');
      }
      throw error;
    }
  }

  async ensureUser(firebaseUser: UserRecord): Promise<User> {
    const userRef = this.firestore.collection('users').doc(firebaseUser.uid);
    const doc = await userRef.get();

    // 情況一：使用者在我們的 Firestore 資料庫中已存在
    if (doc.exists) {
      const existingData = doc.data();
      if (!existingData) { // 一個防禦性檢查，雖然幾乎不可能發生
        throw new Error(`Firestore document for UID ${firebaseUser.uid} exists but is empty.`);
      }
      // 直接回傳現有資料
      return {
        uid: firebaseUser.uid,
        email: existingData.email,
        displayName: existingData.displayName,
      };
    } 
    // 情況二：使用者是第一次透過 Google 登入，我們需要為他建立資料
    else {
      // 準備要寫入的新使用者資料
      const newUserProfile = {
        // 我們假設從 Google 登入的使用者一定有 email，所以用 ! 告訴 TypeScript 不要擔心
        email: firebaseUser.email!, 
        displayName: firebaseUser.displayName || undefined,
        photoURL: firebaseUser.photoURL || undefined,
        createdAt: new Date(),
      };
      
      // 將新資料寫入 Firestore
      await userRef.set(newUserProfile);

      // 直接回傳我們剛剛建立的新資料，不需再讀取一次資料庫
      return {
        uid: firebaseUser.uid,
        email: newUserProfile.email,
        displayName: newUserProfile.displayName,
      };
    }
  }
}