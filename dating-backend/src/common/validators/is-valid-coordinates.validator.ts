// src/common/validators/is-valid-coordinates.validator.ts
import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  isNumber
} from 'class-validator';

export function IsValidCoordinates(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isValidCoordinates',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (!Array.isArray(value) || value.length !== 2) {
            return false;
          }

          const [longitude, latitude] = value;
          
          // Validate là số
          if (!isNumber(longitude) || !isNumber(latitude)) {
            return false;
          }

          // Validate range
          if (longitude < -180 || longitude > 180) {
            return false;
          }

          if (latitude < -90 || latitude > 90) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          return 'Tọa độ không hợp lệ. Phải là mảng [longitude, latitude] với longitude từ -180 đến 180 và latitude từ -90 đến 90';
        }
      }
    });
  };
}