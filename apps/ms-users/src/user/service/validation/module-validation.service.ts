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
   * @param identifier - The name or id of the module to validate against (e.g., 'Mi Perfil' or 'uuid')
   * @param userModules - The pre-fetched modules associated with the user.
   * @param payload - The data to validate
   * @throws {UnauthorizedException} If the module is not found or validation fails.
   */
  async validateProfileSchema(identifier: string, userModules: ModuleEntity[], payload: any): Promise<void> {
    // 1. Filtrar el módulo por Nombre o por _id (Soporte dinámico)
    const module = userModules.find(m => 
      m.name === identifier || 
      (m as any)._id?.toString() === identifier || 
      (m as any).uuid === identifier
    );

    if (!module) {
      throw new UnauthorizedException(`Acceso denegado: El módulo con identificador '${identifier}' no está asignado a tu perfil.`);
    }

    // 2. Buscar la configuración en MongoDB usando el UUID del módulo encontrado
    const moduleConfig = await this.authRepository.getModuleConfig(module.uuid);
    if (!moduleConfig) {
      throw new UnauthorizedException(`Configuración de metadata para '${module.name}' no encontrada.`);
    }

    // 3. Extraer propiedades autorizadas (Padre + Hijos)
    const rawSchema = moduleConfig.configurationUi.schema || (moduleConfig.configurationUi as any).config?.schema || [];
    const schemaChild = moduleConfig.configurationUi.schemaChild || [];
    
    // Unificamos todos los campos que pueden recibir datos
    const allComponents = [
      ...rawSchema,
      ...schemaChild.flatMap((c: any) => c.module || c.schema || [])
    ];
    
    const authorizedProperties = allComponents
      .filter((comp: any) => comp.noSubmit === false)
      .filter((comp: any) => !['separator', 'sep', 'hr', 'title'].includes(comp.type))
      .map((comp: any) => comp.property)
      .filter((prop: any): prop is string => !!prop && !prop.startsWith('btn'));

    // 4. Match Directo (El esquema es la ley)
    const bodyKeys = Object.keys(payload)
      .filter(key => !key.startsWith('btn'))
      .filter(key => payload[key] !== undefined);

    console.log(`[Validation Debug] Module: ${module.name}`);
    console.log(`[Validation Debug] Authorized Properties:`, authorizedProperties);
    console.log(`[Validation Debug] Incoming Body Keys:`, bodyKeys);
    console.log(`[Validation Debug] Full Payload:`, JSON.stringify(payload));

    // Identificar las llaves sobrantes que no deberían estar en el body
    const extraKeys = bodyKeys.filter(key => !authorizedProperties.includes(key));
    
    if (extraKeys.length > 0) {
       throw new UnauthorizedException(
         `La validación falló para el módulo '${module.name}'. ` +
         `Propiedades no permitidas: [${extraKeys.join(', ')}]. ` +
         `Propiedades esperadas: [${authorizedProperties.join(', ')}].`
       );
    }

    // Opcional: Validar si faltan llaves requeridas (según tu lógica de negocio)
    const isBodyValid = bodyKeys.every(key => authorizedProperties.includes(key));
  }
}
