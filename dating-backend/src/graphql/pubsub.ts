import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';

export const pubsub = new RedisPubSub({
  publisher: new Redis({
    host: '127.0.0.1',
    port: 6379,
  }),
  subscriber: new Redis({
    host: '127.0.0.1',
    port: 6379,
  }),
});
