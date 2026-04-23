import { Injectable } from '@nestjs/common';

@Injectable()
export class FunctionsExecutionsService {

  /**
   * @method executeFunction
   * @description Execute the function of module
   *
   * @param name
   * @param args
   */
  async executeFunction(name: string, args: any) {
    switch (name) {
      case 'saveModule':
        console.log('IA decidió guardar módulo:', args.datos);

        return {
          status: 'saved',
          data: args.datos,
        };

      default:
        throw new Error(`Función no soportada: ${name}`);
    }
  }
}