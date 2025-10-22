import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Global HTTP Exception Filter
 * API 문서(docs/api.md)의 에러 응답 형식을 준수합니다.
 *
 * 응답 형식:
 * {
 *   "success": false,
 *   "error": {
 *     "code": "AUTH_001",
 *     "message": "Error description"
 *   }
 * }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // 에러 메시지 추출
    let message: string;
    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    } else if (
      typeof exceptionResponse === 'object' &&
      'message' in exceptionResponse
    ) {
      const msgField = exceptionResponse['message'];
      if (Array.isArray(msgField)) {
        message = msgField.join(', ');
      } else if (typeof msgField === 'string') {
        message = msgField;
      } else {
        message = String(msgField);
      }
    } else {
      message = 'An error occurred';
    }

    // API 문서 형식에 맞춰 응답
    response.status(status).json({
      success: false,
      error: {
        code: this.getErrorCode(status),
        message,
      },
    });
  }

  /**
   * HTTP 상태 코드를 에러 코드로 매핑
   * API 문서(docs/api.md) 섹션 6 참고
   */
  private getErrorCode(status: number): string {
    const errorCodeMap: Record<number, string> = {
      [HttpStatus.UNAUTHORIZED]: 'AUTH_001', // 인증 실패
      [HttpStatus.FORBIDDEN]: 'AUTH_003', // 권한 없음
      [HttpStatus.NOT_FOUND]: 'DEVICE_001', // 장비를 찾을 수 없음
      [HttpStatus.BAD_REQUEST]: 'RENTAL_002', // 잘못된 요청
      [HttpStatus.SERVICE_UNAVAILABLE]: 'KIOSK_001', // 키오스크 연결 오류
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'KIOSK_002', // 내부 서버 오류
    };

    return errorCodeMap[status] || `ERROR_${status}`;
  }
}
