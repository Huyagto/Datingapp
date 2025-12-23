import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { UserDocument } from '../users/user.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserDocument.name)
    private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  async register(
    username: string,
    email: string,
    phone: string,
    password: string,
  ): Promise<UserDocument> {
    const normalizedEmail = email.toLowerCase().trim();

    const exists = await this.userModel.findOne({
      email: normalizedEmail,
    });

    if (exists) {
      throw new UnauthorizedException('EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      email: normalizedEmail,
      password: hashedPassword,
      name: username,
      phone,
    });

    return user;
  }

async login(email: string, password: string) {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await this.userModel.findOne({
    email: normalizedEmail,
  });

  if (!user) {
    throw new UnauthorizedException("INVALID_CREDENTIALS");
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    throw new UnauthorizedException("INVALID_CREDENTIALS");
  }

  return this.buildAuthPayload(user);
}

  buildAuthPayload(user: UserDocument) {
    return {
      accessToken: this.jwtService.sign({
        sub: user._id.toString(),
      }),
      user: {
        id: user._id.toString(),
        name: user.name,
        gender: user.gender,
        bio: user.bio,
        photos: user.photos ?? [],
        createdAt: user.createdAt,
      },
    };
  }
}
