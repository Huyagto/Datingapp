import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloDriver,
  ApolloDriverConfig,
} from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { SwipeModule } from './modules/swipe/swipe.module';
import { MatchModule } from './modules/match/match.module';
import { ChatModule } from './modules/chat/chat.module';
import { PresenceModule } from './modules/presence/presence.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(
      process.env.MONGO_URI as string,
    ),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      subscriptions: {
        'graphql-ws': true,
      },
      context: ({ req, connectionParams }) => {
        if (req) {
          return { req };
        }
        if (connectionParams) {
          return {
            req: {
              headers: {
                authorization:
                  connectionParams.Authorization ||
                  connectionParams.authorization ||
                  '',
              },
            },
          };
        }

        return {};
      },
    }),
    AuthModule,
    UsersModule,
    ProfilesModule,
    SwipeModule,
    MatchModule,
    ChatModule,
    PresenceModule,
  ],
})
export class AppModule {}