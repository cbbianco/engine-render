import { HttpException } from '@nestjs/common';

export class UnauthorizedSYSException extends HttpException {

  constructor(message: string, status: number) {
    super(message, status);
  }
}
