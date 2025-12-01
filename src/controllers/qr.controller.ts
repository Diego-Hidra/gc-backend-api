import { Controller, Req, UseGuards, Res, Post } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from 'express';
import * as QRCode from 'qrcode';

interface UserPayload {
    sub: string;
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
        const { sub: id, name, user_type, email, floor, apartament } = req.user;

        const qrData = JSON.stringify({
            id: id,
            user: name,
            email: email,
            user_type: user_type,
            floor: floor,
            apartament: apartament,
            timestamp: new Date().toISOString(),
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