import {
  Injectable,
  InternalServerErrorException,
  OnModuleInit,
} from '@nestjs/common';
import { performance } from 'perf_hooks';
import { FunctionCallingConfigMode, GoogleGenAI, Type } from '@google/genai';
import * as dotenv from 'dotenv';
import * as path from 'path';

import { ModuleRequestDto } from '../../dto/module/module-request.dto';
import { ModelResponseDto } from '../../dto/response/model.response.dto';

import { GeneratePersistService } from '../generate/persist/generate-persist.service';
import { PromptUtils } from '../../utils/prompt/prompt.utils';
import { ModuleHydratorUtils } from '../../utils/hydrator/module-hydrator.utils';
import { FunctionsExecutionsService } from './functions/functions.executions.service';

// Cargar .env desde la raíz de la app, apps/ o la raíz del monorepo
dotenv.config(); // Por defecto
dotenv.config({ path: path.join(process.cwd(), '../.env') }); // apps/.env
dotenv.config({ path: path.join(process.cwd(), '../../.env') }); // root/.env


@Injectable()
export class IAService implements OnModuleInit {
  private ai: GoogleGenAI;

  constructor(
    private readonly persistService: GeneratePersistService,
    private readonly functions: FunctionsExecutionsService,
    private readonly prompt: PromptUtils,
    private readonly hydrator: ModuleHydratorUtils,
  ) { }

  onModuleInit() {
    const apiKey = process.env.API_KEY_GOOGLE_GENAI;

    if (!apiKey) {
      throw new Error('API_KEY_GOOGLE_GENAI no configurada');
    }

    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Deep merge para evitar que el modelo borre el schema y otros datos críticos
   */
  private deepMerge(target: any, source: any, keyName?: string) {
    if (!source || (source instanceof Object && Object.keys(source).length === 0 && target instanceof Object && Object.keys(target).length > 0)) {
        return target;
    }
    if (!target) return source;

    // 1. Manejo especial para el array de componentes (schema o module dentro de hijos)
    if ((keyName === 'schema' || keyName === 'module') && Array.isArray(target) && Array.isArray(source)) {
      return target.map((originalComp: any) => {
        const aiComp = source.find(
          (s: any) =>
            (s.label && s.label === originalComp.label) || 
            (s.property && s.property === originalComp.property),
        );
        if (!aiComp) return originalComp;

        // Mezclar propiedades. Priorizar target para identificadores y placeholders.
        return {
          ...originalComp,
          ...aiComp,
          // Blindaje de propiedades críticas
          type: originalComp.type || aiComp.type,
          label: originalComp.label || aiComp.label,
          placeholder: originalComp.placeholder || aiComp.placeholder,
          value: originalComp.value?.startsWith('{') ? originalComp.value : (aiComp.value || originalComp.value),
          property: originalComp.property || aiComp.property,
          options: originalComp.options || aiComp.options, // Preservar opciones de select
        };
      });
    }

    // 2. Manejo especial para schemaChild (Submódulos) - Mezcla recursiva por moduleId
    if (keyName === 'schemaChild' && Array.isArray(target) && Array.isArray(source)) {
        return target.map((originalChild: any) => {
            const aiChild = source.find((s: any) => s.moduleId === originalChild.moduleId);
            if (!aiChild) return originalChild;

            // Mergear el hijo de forma recursiva
            return this.deepMerge(originalChild, aiChild);
        });
    }

    // 3. Otros Arrays: Mantener el original si el de la IA viene vacío
    if (Array.isArray(source) || Array.isArray(target)) {
      return (Array.isArray(source) && source.length > 0) ? source : target;
    }

    // 4. Manejo de Objetos de forma recursiva
    const output = { ...target };
    if (source instanceof Object && target instanceof Object) {
      Object.keys(source).forEach((key) => {
        if (
          source[key] instanceof Object &&
          key in target
        ) {
          output[key] = this.deepMerge(target[key], source[key], key);
        } else if (source[key] !== undefined && source[key] !== null) {
          // Solo sobrescribir si el valor de la IA es válido
          output[key] = source[key];
        }
      });
    }
    return output;
  }

  async generateJson(
    generate: ModuleRequestDto,
    userId: number,
  ): Promise<ModelResponseDto> {
    const promptBase = await this.prompt.getPrompt(generate);

    try {
      const tools = [
        {
          functionDeclarations: [
            {
              name: 'saveModule',
              description: 'Guarda la estructura lógica del módulo.',
              parameters: {
                type: Type.OBJECT,
                properties: {
                  datos: {
                    type: Type.OBJECT,
                    properties: {
                      configurationUi: {
                        type: Type.OBJECT,
                        properties: {
                          config: {
                            type: Type.OBJECT,
                            description: "Configuración general del módulo. NOTA: moduleId NUNCA debe ir aquí.",
                            properties: {
                              module: { type: Type.STRING },
                              path: { type: Type.STRING },
                              method: { type: Type.STRING },
                              order: { type: Type.NUMBER },
                              icon: { type: Type.STRING, description: "Nombre del icono (ej: svg-user)" },
                              menu: { type: Type.STRING, description: "Cuerda de menú (ej: menu-item:PARENT:CHILD)" },
                              breadcrumb: {
                                type: Type.ARRAY,
                                items: {
                                  type: Type.OBJECT,
                                  properties: {
                                    label: { type: Type.STRING },
                                    path: { type: Type.STRING },
                                  },
                                  required: ['label'],
                                },
                              },
                              isReauthenticating: { type: Type.BOOLEAN, description: "¿Requiere re-autenticación? (ej: perfiles, contraseñas)" },
                            },
                          },
                          schema: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                type: { type: Type.STRING },
                                label: { type: Type.STRING },
                                property: { type: Type.STRING },
                                column: { type: Type.STRING },
                                placeholder: { type: Type.STRING, description: "Texto de ayuda dentro del input (ej: Ingrese su nombre)" },
                                validation: {
                                  type: Type.OBJECT,
                                  properties: {
                                    rule: { type: Type.STRING },
                                  },
                                },
                                endpoint: {
                                  type: Type.OBJECT,
                                  properties: {
                                    method: { type: Type.STRING },
                                    uri: { type: Type.STRING },
                                    endpoint: { type: Type.STRING },
                                    backend: { type: Type.STRING },
                                  },
                                },
                              },
                              required: ['type', 'label'],
                            },
                          },
                          schemaChild: {
                            type: Type.ARRAY,
                            items: {
                              type: Type.OBJECT,
                              properties: {
                                moduleId: { type: Type.STRING },
                                path: { type: Type.STRING },
                                config: { type: Type.OBJECT },
                                module: { type: Type.ARRAY, items: { type: Type.OBJECT } }
                              }
                            }
                          }
                        },
                      },
                      orchestrationDetails: { type: Type.OBJECT },
                    },
                  },
                },
              },
            },
          ],
        },
      ];

      const t0 = performance.now();
      console.log('[IAService] Enviando prompt a Gemini...');
      const result = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            role: 'user',
            parts: [{ text: promptBase }],
          },
        ],
        config: {
          temperature: 0.1,
          tools,
          toolConfig: {
            functionCallingConfig: {
              mode: FunctionCallingConfigMode.ANY,
            },
          },
        },
      });

      const t1 = performance.now();
      console.log(`[IAService] Respuesta recibida de Gemini. Tiempo: ${((t1 - t0) / 1000).toFixed(2)}s`);

      const parts = result.candidates?.[0]?.content?.parts ?? [];
      const functionCall = parts.find((p) => p.functionCall)?.functionCall;

      if (!functionCall) {
        throw new InternalServerErrorException('El modelo no retornó functionCall');
      }

      const { name, args } = functionCall;

      if (name !== 'saveModule' || !args?.datos) {
        throw new InternalServerErrorException('FunctionCall inválido');
      }

      // 1. Preparar base con datos originales para no perder nada (Deep Copy)
      const t2 = performance.now();
      const datosBase = JSON.parse(JSON.stringify({
        configurationUi: generate.configurationUi,
        orchestrationDetails: generate.orchestrationDetails ?? {},
      }));

      // 2. Mezclar con lo que propuso la IA (Heurísticas)
      console.log('[IAService] Iniciando deepMerge...');
      const datosPropuestos = this.deepMerge(datosBase, args.datos);
      const t3 = performance.now();
      console.log(`[IAService] deepMerge completado. Tiempo: ${((t3 - t2) / 1000).toFixed(4)}s`);

      // 3. Hidratación DETERMINISTA (SVG, CamelCase, BodyModel, etc.)
      console.log('[IAService] Iniciando hidratación...');
      const datosHidratados = this.hydrator.hydrateEverything(datosPropuestos);
      const t4 = performance.now();
      console.log(`[IAService] Hidratación completada. Tiempo: ${((t4 - t3) / 1000).toFixed(4)}s`);

      datosHidratados.updatedAt = new Date();

      /**
       * Sincroniza nombre de módulo
       */
      console.log('[IAService] Sincronizando metadatos...');
      datosHidratados.modulo =
        datosHidratados.configurationUi?.config?.metadata?.title ||
        generate['modulo'];

      const t5 = performance.now();
      const execution = await this.functions.executeFunction(name, {
        datos: datosHidratados,
      });

      if (execution.status === 'saved' || execution.status === 'success') {
        const jsonSaved = await this.persistService.saveModule(
          datosHidratados,
          userId,
        );
        const t6 = performance.now();
        console.log(`[IAService] Guardado en MongoDB. Tiempo: ${((t6 - t5) / 1000).toFixed(4)}s`);

        console.log(`[IAService] CICLO TOTAL COMPLETADO. Tiempo Total: ${((t6 - t0) / 1000).toFixed(2)}s`);

        return {
          id: jsonSaved['_id'],
          message: 'Módulo generado e hidratado correctamente',
        };
      }

      throw new InternalServerErrorException(
        'No se pudo ejecutar la función saveModule',
      );
    } catch (error) {
      console.error('Error IAService:', error);

      throw new InternalServerErrorException(
        'Error en la generación dinámica del módulo',
      );
    }
  }
}
