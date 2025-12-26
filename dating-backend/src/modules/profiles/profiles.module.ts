// src/profiles/profiles.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfilesResolver } from './profiles.resolver';
import { ProfilesService } from './profile.service';
import { UserDocument, UserSchema } from '../users/user.schema';
import { Swipe, SwipeSchema } from '../swipe/swipe.schema';
import { CloudinaryModule } from '../../cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserDocument.name, schema: UserSchema },
      { name: Swipe.name, schema: SwipeSchema },
    ]),
    CloudinaryModule,
  ],
  providers: [ProfilesResolver, ProfilesService],
  exports: [ProfilesService],
})
export class ProfilesModule {}