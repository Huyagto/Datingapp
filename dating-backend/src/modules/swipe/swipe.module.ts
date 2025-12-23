import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Swipe, SwipeSchema } from './swipe.schema';
import { SwipeResolver } from './swipe.resolver';
import { MatchModule } from '../match/match.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Swipe.name, schema: SwipeSchema },
    ]),
    MatchModule, // 🔥 BẮT BUỘC
  ],
  providers: [SwipeResolver],
  exports: [
    MongooseModule, // 🔥 DÒNG QUAN TRỌNG NHẤT
  ],
})
export class SwipeModule {}
