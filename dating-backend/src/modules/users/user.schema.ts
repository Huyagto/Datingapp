// src/users/user.schema.ts
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

  @Prop({ 
    type: [String], 
    default: [],
    validate: {
      validator: function(photos: string[]) {
        return photos.length <= 10;
      },
      message: 'Tối đa 10 ảnh được phép'
    }
  })
  photos: string[];

  @Prop()
  birthday?: Date;

  @Prop({ 
    type: [String], 
    default: [],
    validate: {
      validator: function(interests: string[]) {
        return interests.length <= 10;
      },
      message: 'Tối đa 10 sở thích được phép'
    }
  })
  interests: string[];

  // 🔥 THÊM CÁC TRƯỜNG VỊ TRÍ
  @Prop({
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    }
  })
  locationType?: string;

  @Prop({
    type: [Number], // [longitude, latitude]
    index: '2dsphere' // Tạo index để hỗ trợ truy vấn địa lý
  })
  coordinates?: number[];

  @Prop()
  address?: string;

  @Prop()
  city?: string;

  @Prop()
  country?: string;

  @Prop({ default: false })
  shareLocation?: boolean; // Cho phép người dùng bật/tắt chia sẻ vị trí

  createdAt: Date;
  updatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(UserDocument);

// Tạo index cho location nếu có coordinates
UserSchema.index({ coordinates: '2dsphere' });