import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MatchDocument } from './match.schema';
import { Match } from './match.type';

@Injectable()
export class MatchService {
  constructor(
    @InjectModel(MatchDocument.name)
    private matchModel: Model<MatchDocument>,
  ) {}

  async findMyMatches(userId: string): Promise<Match[]> {
    const docs = await this.matchModel.find({
      $or: [{ userA: userId }, { userB: userId }],
    });

    return docs.map((doc) => ({
      id: doc._id.toString(),
      userA: doc.userA,
      userB: doc.userB,
      createdAt: doc.createdAt,
    }));
  }
}
