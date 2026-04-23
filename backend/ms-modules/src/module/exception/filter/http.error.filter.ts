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

    const responseException = exception.getResponse() as any;

    const status: number = exception.getStatus();

    console.log(responseException);

    response.status(status).json({
      message: typeof responseException === "string" ? responseException : responseException.error,
      error: responseException?.message ?? [],
      timestamp: new Date().toISOString(),
    });
  }
}
