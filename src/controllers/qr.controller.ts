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

}