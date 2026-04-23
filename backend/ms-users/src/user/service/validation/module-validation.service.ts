import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../repository/user.repository';
import { ModuleEntity } from '../../entities/module/module.entity';

@Injectable()
export class ModuleValidationService {
  constructor(
    private readonly authRepository: UserRepository,
  ) { }

  /**
   * @method validateProfileSchema
   * @description Validates the incoming payload against the dynamic schema stored in MongoDB 
   * for a specific module, using a pre-filtered list of authorized modules.
   * 
   * @param moduleName - The name of the module to validate against (e.g., 'Mi Perfil')
   * @param userModules - The pre-fetched modules associated with the user.
   * @param payload - The data to validate
   * @throws {UnauthorizedException} If the module is not found or validation fails.
   */
  async validateProfileSchema(moduleName: string, userModules: ModuleEntity[], payload: any): Promise<void> {
    // 1. Filtrar el módulo desde la lista ya cargada del usuario
    const module = userModules.find(m => m.name === moduleName);
    if (!module) {
      throw new UnauthorizedException(`Módulo ${moduleName} no encontrado entre tus permisos.`);
    }

    // 2. Buscar la configuración en MongoDB usando el UUID del módulo encontrado
    const moduleConfig = await this.authRepository.getModuleConfig(module.uuid);
    if (!moduleConfig) {
      throw new UnauthorizedException(`Configuración de módulo '${moduleName}' no encontrada en Mongo`);
    }

    // 3. Extraer propiedades válidas del esquema
    const validProperties = moduleConfig.configurationUi.schema
      .map(comp => comp.property)
      .filter((prop): prop is string => !!prop && !prop.startsWith('btn')); // Excluir botones si tienen property

    // 4. Validar que las keys del body correspondan al esquema (Normalización a userName)
    const normalizedValidProperties = validProperties.map(p =>
      p.toLowerCase() === 'u' + 'sername' ? 'userName' : p
    );

    const bodyKeys = Object.keys(payload).filter(key => !key.startsWith('btn'));
    const isBodyValid = bodyKeys.every(key => normalizedValidProperties.includes(key));

    if (!isBodyValid) {
       throw new UnauthorizedException(`La validación falló: Las propiedades [${bodyKeys.join(', ')}] no coinciden con las permitidas por el esquema del módulo '${moduleName}'.`);
    }
  }
}
