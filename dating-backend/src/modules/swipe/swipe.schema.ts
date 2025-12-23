import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Swipe extends Document {
  @Prop({ required: true })
  fromUserId: string;

  @Prop({ required: true })
  toUserId: string;

  @Prop({ enum: ['LIKE', 'PASS'], required: true })
  type: string;
}

export const SwipeSchema = SchemaFactory.createForClass(Swipe);
