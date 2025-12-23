import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProfilesResolver } from './profiles.resolver';
import {
  UserDocument,
  UserSchema,
} from '../users/user.schema';
import { SwipeModule } from '../swipe/swipe.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
    ]),
    SwipeModule, 
  ],
  providers: [ProfilesResolver],
  exports: [
    MongooseModule, // 🔥 DÒNG QUAN TRỌNG NHẤT
  ],
})
export class ProfilesModule {}
