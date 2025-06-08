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
      const decodedToken = await admin.auth().verifyIdToken(token);
      // 將解碼後的使用者資訊附加到 request 上，方便後續使用
      gqlContext.user = decodedToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token or token expired.');
    }
  }
}
