import { Controller, Req, UseGuards, Res, Post, Body, Param, HttpCode, HttpStatus } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from 'express';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';
import { QrService } from '../services/qr.service';

interface UserPayload {
    userId: string;
    name: string;
    email: string;
    user_type: string;
    floor: string;
    apartament: string;
}

interface RequestWithResident extends Request {
    user: UserPayload;
}

@Controller('api/access')
export class QrController{
    constructor(private readonly qrService: QrService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('resident/qr')
    async generateQr(
        @Req() req: RequestWithResident,
        @Res() res: Response,
    ) {
        console.log("Datos de usuario inyectados (req.user):", req.user);
        const QR_SECRET = process.env.QR_SECRET || '';
        const { userId: id, user_type} = req.user;

        const timestamp = Date.now();
        const expiryTime = timestamp + (5 * 60 * 1000);

        const dataToHash = `${id}:${user_type}:${expiryTime}`;

        const signature = crypto
            .createHmac('sha256', QR_SECRET)
            .update(dataToHash)
            .digest('hex');

        const qrData = JSON.stringify({
            id: id,
            exp: expiryTime, 
            sig: signature,  
        });

        try {
            const qrCodeDataURL = await QRCode.toDataURL(qrData);

            res.setHeader('Content-Type', 'image/png');

            const base64Image = qrCodeDataURL.split(';base64,').pop();
            const imageBuffer = Buffer.from(base64Image ?? '', 'base64');

            res.send(imageBuffer)

        } 
        catch (error) {
          console.error('Error al generar QR:', error);
          res.status(500).send('Error interno al generar el código QR.');
        }
    }

    @Post('validate-qr')
    async validateQr(@Req() req: Request, @Res() res: Response) {
        try {
            const { qrData } = req.body;

            if (!qrData) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos del QR no proporcionados'
                });
            }

            console.log('\n🔍 Validando QR escaneado...');
            
            // Parsear datos del QR
            let parsedData;
            try {
                parsedData = JSON.parse(qrData);
            } catch (parseError) {
                console.error('❌ Error al parsear QR:', parseError);
                return res.status(400).json({
                    success: false,
                    message: 'Formato de QR inválido'
                });
            }

            const { id, exp, sig } = parsedData;

            if (!id || !exp || !sig) {
                return res.status(400).json({
                    success: false,
                    message: 'QR incompleto o corrupto'
                });
            }

            const ipAddress = req.ip || req.connection?.remoteAddress;
            const userAgent = req.headers['user-agent'];

            // Usar el servicio para validar y crear entry_log
            const result = await this.qrService.validateResidentQR(
                id,
                exp,
                sig,
                ipAddress,
                userAgent,
            );

            return res.status(200).json(result);

        } catch (error) {
            console.error('❌ Error al validar QR:', error);
            
            // Manejar errores conocidos
            if (error.status) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno al validar el QR'
            });
        }
    }

    /**
     * POST /api/access/validate-visitor-qr
     * Validar QR de visitante, crear visitor y registrar check-in
     */
    @Post('validate-visitor-qr')
    @HttpCode(HttpStatus.OK)
    async validateVisitorQr(@Req() req: Request, @Res() res: Response) {
        try {
            const { qrData } = req.body;

            if (!qrData) {
                return res.status(400).json({
                    success: false,
                    message: 'Datos del QR no proporcionados'
                });
            }

            const ipAddress = req.ip || req.connection?.remoteAddress;
            const userAgent = req.headers['user-agent'];

            const result = await this.qrService.validateVisitorQR(
                qrData,
                ipAddress,
                userAgent,
            );

            return res.status(200).json(result);

        } catch (error) {
            console.error('❌ Error al validar QR de visitante:', error);
            
            // Manejar errores conocidos
            if (error.status) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno al validar el QR del visitante'
            });
        }
    }

    /**
     * POST /api/access/visitor/:id/checkout
     * Registrar salida (check-out) de un visitante
     */
    @Post('visitor/:id/checkout')
    @HttpCode(HttpStatus.OK)
    async checkOutVisitor(
        @Param('id') visitorId: string,
        @Req() req: Request,
        @Res() res: Response
    ) {
        try {
            const ipAddress = req.ip || req.connection?.remoteAddress;
            const userAgent = req.headers['user-agent'];

            const result = await this.qrService.checkOutVisitor(
                visitorId,
                ipAddress,
                userAgent,
            );

            return res.status(200).json(result);

        } catch (error) {
            console.error('❌ Error al registrar check-out:', error);
            
            if (error.status) {
                return res.status(error.status).json({
                    success: false,
                    message: error.message
                });
            }

            return res.status(500).json({
                success: false,
                message: 'Error interno al registrar el check-out'
            });
        }
    }

}