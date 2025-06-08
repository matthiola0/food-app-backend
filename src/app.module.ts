// src/app.module.ts
import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';

import { RestaurantModule } from './restaurant/restaurant.module';
import { PostModule } from './post/post.module';
import { UserModule } from './user/user.module';
import * as serviceAccount from './firebase/serviceAccountKey.json';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      playground: true,
    }),
    RestaurantModule,
    PostModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        // 2. 將 serviceAccount 斷言為 ServiceAccount 型別
        credential: admin.credential.cert(serviceAccount as ServiceAccount),
      });
      console.log('Firebase Admin Initialized!');
    }
  }
}