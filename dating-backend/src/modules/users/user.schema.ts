import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class UserDocument extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  name: string;

  @Prop()
  gender?: string;

  @Prop()
  bio?: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop()
  birthday?: Date;

  // @Prop({
  //   type: {
  //     type: String,
  //     enum: ['Point'],
  //     default: 'Point',
  //   },
  //   coordinates: {
  //     type: [Number], 
  //     default: [0, 0],
  //   },
  // })
  // location: {
  //   type: 'Point';
  //   coordinates: [number, number];
  // };

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

// 🔥 BẮT BUỘC
UserSchema.index({ location: '2dsphere' });

