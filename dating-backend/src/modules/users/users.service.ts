import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './user.schema';
import { User } from './user.type';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(UserDocument.name)
    private userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    const docs = await this.userModel.find();

    return docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      gender: doc.gender,
      bio: doc.bio,
      photos: doc.photos,
      createdAt: doc.createdAt,
    }));
  }
}
