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
        console.warn(`User with UID ${decodedToken.uid} authenticated but not found in Firestore. Assigning default role.`);
        gqlContext.user = {
            ...decodedToken,
            role: 'NORMAL', // 賦予一個安全的預設角色
        };
      } else {
        // 如果使用者存在，就將 Firebase Auth 和 Firestore 的資料合併
        gqlContext.user = {
            ...decodedToken,
            ...userDoc.data(),
        };
      }
      
      // 新增偵錯日誌
      console.log('AuthGuard 檢查到的使用者資料:', gqlContext.user);

      return true;

    } catch (error) {
      console.error("AuthGuard Error:", error);
      throw new UnauthorizedException('Invalid token or token expired.');
    }
  }
}