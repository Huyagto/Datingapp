import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  MatchDocument,
  MatchSchema,
} from './match.schema';
import { MatchResolver } from './match.resolver';
import { MatchService } from './match.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchDocument.name, schema: MatchSchema },
    ]),
  ],
  providers: [MatchResolver, MatchService],
  exports: [
    MongooseModule, // 🔥 BẮT BUỘC
  ],
})
export class MatchModule {}
