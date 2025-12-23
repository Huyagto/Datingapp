// src/presence/presence.resolver.ts
import { Resolver, Mutation, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { PresenceService } from './presence.service';
import { GqlAuthGuard } from 'src/common/guards/gql-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';

@Resolver()
@UseGuards(GqlAuthGuard)
export class PresenceResolver {
  constructor(private presence: PresenceService) {}

  @Mutation(() => Boolean)
  pingOnline(@CurrentUser() user: { id: string }) {
    this.presence.setOnline(user.id);
    return true;
  }

  @Query(() => Boolean)
  isOnline(@Args('userId') userId: string) {
    return this.presence.isOnline(userId);
  }

  @Query(() => Date, { nullable: true })
  getLastSeen(@Args('userId') userId: string) {
    const timestamp = this.presence.getLastSeen(userId);
    return timestamp ? new Date(timestamp) : null;
  }

  @Query(() => [String])
  getOnlineUsers() {
    return this.presence.getOnlineUsers();
  }
}