import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ChatResolver } from './chat.resolver';
import {
  MessageDocument,
  MessageSchema,
} from './message.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MessageDocument.name,
        schema: MessageSchema,
      },
    ]),
  ],
  providers: [ChatResolver],
})
export class ChatModule {}
