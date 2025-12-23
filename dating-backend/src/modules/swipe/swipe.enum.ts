// src/modules/swipe/dto/swipe.enum.ts
import { registerEnumType } from '@nestjs/graphql';

export enum SwipeType {
  LIKE = 'LIKE',
  PASS = 'PASS',
}

registerEnumType(SwipeType, {
  name: 'SwipeType',
});
