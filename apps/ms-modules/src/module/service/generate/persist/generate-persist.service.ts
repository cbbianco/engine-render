import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GenerateJsonDto } from '../../../dto/jwt/generate-json.dto';

@Injectable()
export class GeneratePersistService {
  constructor(
    @InjectRepository(GenerateJsonDto, 'mongo')
    private readonly repository: Repository<GenerateJsonDto>,
  ) { }

  async saveModule(datos: any, userId: number) {
    // La IA devuelve: { configurationUi: { config, schema, model }, bodyModel, orchestrationDetails }
    const ui = datos?.configurationUi ?? datos?.configuracion_ui ?? {};
    const config = ui?.config ?? datos?.config ?? {};
    const schema = ui?.schema ?? datos?.schema ?? [];
    const model = ui?.model ?? datos?.model ?? {};

    const nuevoModulo = this.repository.create({
      modulo: config?.module || config?.modulo || datos?.modulo || 'Modulo_IA',
      userId: userId,
      instruccion: ui?.config?.metadata?.orchestrationType || datos?.instruccion || 'CREATE',
      configurationUi: {
        config: config,
        schema: schema,
        model: model,
        schemaChild: ui?.schemaChild || datos?.schemaChild || [],
      },
      orchestrationDetails: datos?.orchestrationDetails ?? datos?.orchestration ?? { status: 'AUTONOMOUS' },
    });

    const guardado = await this.repository.save(nuevoModulo);
    console.log('✅ Guardado con éxito en MongoDB, ID:', guardado['_id']);

    return guardado;
  }
}
