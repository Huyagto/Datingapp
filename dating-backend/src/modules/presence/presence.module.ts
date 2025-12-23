// src/presence/presence.module.ts
import { Module } from '@nestjs/common';
import { PresenceResolver } from './presence.resolver';
import { PresenceService } from './presence.service';

@Module({
  providers: [PresenceResolver, PresenceService],
})
export class PresenceModule {}