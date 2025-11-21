import {
  Controller,
  Post,
  Body,
  UseGuards,
  HttpStatus,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { QRService } from '../services/qr.service';
import { ValidateQRDto } from '../dto/validate-qr.dto';
import { CheckInQRDto } from '../dto/check-in-qr.dto';
import { CheckOutQRDto } from '../dto/check-out-qr.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/qr')
@UseGuards(JwtAuthGuard)
export class QRController {
  constructor(private readonly qrService: QRService) {}

  /**
   * POST /api/qr/validate
   * Validar código QR sin registrar acción
   */
  @Post('validate')
  @HttpCode(HttpStatus.OK)
  async validateQR(@Body(ValidationPipe) validateQRDto: ValidateQRDto) {
    const result = await this.qrService.validateQR(validateQRDto.qrCode);

    return {
      statusCode: result.isValid ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
      message: result.message,
      data: {
        isValid: result.isValid,
        type: result.type,
        ...result.data,
      },
    };
  }

  /**
   * POST /api/qr/check-in
   * Registrar entrada mediante escaneo de QR
   */
  @Post('check-in')
  @HttpCode(HttpStatus.OK)
  async checkIn(@Body(ValidationPipe) checkInQRDto: CheckInQRDto) {
    const result = await this.qrService.checkIn(
      checkInQRDto.qrCode,
      checkInQRDto.guardId,
      checkInQRDto.gateLocation,
      checkInQRDto.additionalData,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.data,
    };
  }

  /**
   * POST /api/qr/check-out
   * Registrar salida mediante escaneo de QR
   */
  @Post('check-out')
  @HttpCode(HttpStatus.OK)
  async checkOut(@Body(ValidationPipe) checkOutQRDto: CheckOutQRDto) {
    const result = await this.qrService.checkOut(
      checkOutQRDto.qrCode,
      checkOutQRDto.guardId,
      checkOutQRDto.gateLocation,
      checkOutQRDto.additionalData,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result.data,
    };
  }
}
