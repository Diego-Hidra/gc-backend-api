import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator'; 

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(), 
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; 

    if (!user || !user.user_type) {
        throw new ForbiddenException('Acceso denegado. El rol del usuario no está definido en el token.');
    }
    
    const userRoleUpperCase = user.user_type.toUpperCase(); 

    const hasRequiredRole = requiredRoles.some((requiredRole) => 
        userRoleUpperCase === requiredRole.toUpperCase() 
    );

    // Devuelve el rol del usuario
    if (!hasRequiredRole) {
        throw new ForbiddenException(`Acceso denegado. Rol requerido: ${requiredRoles.join(', ')}. Su rol: ${user.user_type}.`);
    }
    
    return true; 
  }
}