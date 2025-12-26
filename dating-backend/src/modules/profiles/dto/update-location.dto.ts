// src/users/dto/update-location.dto.ts
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  ArrayMinSize,
  ArrayMaxSize
} from 'class-validator';
import { IsValidCoordinates } from '../../../common/validators/is-valid-coordinates.validator';

export class UpdateLocationDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsValidCoordinates()
  coordinates?: number[]; // [longitude, latitude]

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsBoolean()
  shareLocation?: boolean;
}