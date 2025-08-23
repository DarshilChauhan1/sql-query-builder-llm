import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class HttpStatusInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<object> {
    return next.handle().pipe(
      map((data) => {
        // Check if the response has a 'statusCode' field
        if (data && data.statusCode) {
          // Set the HTTP status code of the response to the value of 'data.statusCode'
          context.switchToHttp().getResponse().status(data.statusCode);
        }
        return data;
      }),
    );
  }
}