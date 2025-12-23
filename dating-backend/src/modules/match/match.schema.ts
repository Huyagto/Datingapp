import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MatchDocument extends Document {
  @Prop({ required: true })
  userA: string;

  @Prop({ required: true })
  userB: string;

  createdAt: Date;
}

export const MatchSchema = SchemaFactory.createForClass(MatchDocument);
