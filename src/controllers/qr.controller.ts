import { Controller, Req, UseGuards, Res, Post } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from 'express';
import * as QRCode from 'qrcode';
import * as crypto from 'crypto';

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

            // Verificar expiración
            const currentTime = Date.now();
            if (currentTime > exp) {
                const expiredMinutes = Math.floor((currentTime - exp) / 60000);
                console.log(`❌ QR EXPIRADO hace ${expiredMinutes} minuto(s)`);
                return res.status(401).json({
                    success: false,
                    message: 'QR expirado',
                    expiredMinutesAgo: expiredMinutes
                });
            }

            // Verificar firma HMAC
            const QR_SECRET = process.env.QR_SECRET || '';
            
            // Buscar residente en base de datos para obtener user_type
            // Por ahora asumimos que es 'resident'
            const user_type = 'resident';
            const dataToHash = `${id}:${user_type}:${exp}`;
            
            const expectedSignature = crypto
                .createHmac('sha256', QR_SECRET)
                .update(dataToHash)
                .digest('hex');

            if (sig !== expectedSignature) {
                console.log('❌ Firma HMAC inválida - QR adulterado');
                return res.status(401).json({
                    success: false,
                    message: 'QR inválido o adulterado'
                });
            }

            // QR válido
            const remainingMinutes = Math.floor((exp - currentTime) / 60000);
            console.log(`✅ QR VÁLIDO - Residente ID: ${id}, Expira en ${remainingMinutes} minuto(s)`);

            return res.status(200).json({
                success: true,
                message: 'QR válido - Acceso autorizado',
                data: {
                    residentId: id,
                    validatedAt: new Date().toISOString(),
                    expiresInMinutes: remainingMinutes,
                    expiresAt: new Date(exp).toISOString()
                }
            });

        } catch (error) {
            console.error('❌ Error al validar QR:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno al validar el QR'
            });
        }
    }

}