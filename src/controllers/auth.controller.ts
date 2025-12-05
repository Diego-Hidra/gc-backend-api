import { Controller, Post, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
import { LoginDto } from 'src/dto/login.dto';

@Controller('api')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('auth') 
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() loginDto: LoginDto): Promise<{ success: boolean; data: { access_token: string } }> {
    const result = await this.authService.login(loginDto);
    return {
      success: true,
      data: result
    };
  }
}