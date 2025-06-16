// src/auth/auth.guard.ts

import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import * as admin from 'firebase-admin';

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context).getContext();
    const { req } = gqlContext;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization header not found or incorrect.');
    }

    const token = authHeader.split('Bearer ')[1];
    if (!token) {
      throw new UnauthorizedException('Token not found.');
    }

    try {
      // 驗證 Token
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // 用 uid 從 Firestore 查詢使用者資料
      const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
      if (!userDoc.exists) {
        throw new UnauthorizedException('User not found in database.');
      }

      // 將 Firebase 的資訊和我們資料庫的資訊合併
      gqlContext.user = {
        ...decodedToken, 
        ...userDoc.data(),
      };
      
      // 新增偵錯日誌
      console.log('AuthGuard 檢查到的使用者資料:', gqlContext.user);

      return true;

    } catch (error) {
      console.error("AuthGuard Error:", error);
      throw new UnauthorizedException('Invalid token or token expired.');
    }
  }
}