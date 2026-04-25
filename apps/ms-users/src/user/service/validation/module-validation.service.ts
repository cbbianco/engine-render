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

    // 3. Extraer propiedades autorizadas (No visuales y sin flag noSubmit)
    const schema = moduleConfig.configurationUi.schema || (moduleConfig.configurationUi as any).config?.schema || [];
    
    const authorizedProperties = schema
      .filter((comp: any) => comp.noSubmit === false)
      .filter((comp: any) => !['separator', 'sep', 'hr', 'title'].includes(comp.type))
      .map((comp: any) => comp.property)
      .filter((prop: any): prop is string => !!prop && !prop.startsWith('btn'));

    // 4. Match Directo (El esquema es la ley)
    const bodyKeys = Object.keys(payload)
      .filter(key => !key.startsWith('btn'))
      .filter(key => payload[key] !== undefined);

    console.log(`[Validation Debug] Module: ${moduleName}`);
    console.log(`[Validation Debug] Authorized Properties:`, authorizedProperties);
    console.log(`[Validation Debug] Incoming Body Keys:`, bodyKeys);
    console.log(`[Validation Debug] Full Payload:`, JSON.stringify(payload));

    // Identificar las llaves sobrantes que no deberían estar en el body
    const extraKeys = bodyKeys.filter(key => !authorizedProperties.includes(key));
    
    if (extraKeys.length > 0) {
       throw new UnauthorizedException(
         `La validación falló para el módulo '${moduleName}'. ` +
         `Propiedades no permitidas: [${extraKeys.join(', ')}]. ` +
         `Propiedades esperadas: [${authorizedProperties.join(', ')}].`
       );
    }

    // Opcional: Validar si faltan llaves requeridas (según tu lógica de negocio)
    const isBodyValid = bodyKeys.every(key => authorizedProperties.includes(key));
  }
}
