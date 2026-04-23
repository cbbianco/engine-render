import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status: number = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    response.status(status).json({
      message: (exceptionResponse as any).message || exception.message,
      error: (exceptionResponse as any).error || null,
      statusCode: status,
      timestamp: new Date().toISOString(),
    });
  }
}
