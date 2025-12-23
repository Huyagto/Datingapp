import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class MessageDocument extends Document {
  @Prop({ required: true })
  matchId: string;

  @Prop({ required: true })
  senderId: string;

  @Prop({ required: true })
  text: string;

  createdAt: Date;
}


export const MessageSchema =
  SchemaFactory.createForClass(MessageDocument);
