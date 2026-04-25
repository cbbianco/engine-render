import { Injectable } from '@nestjs/common';
import { ComponentDto } from '../../dto/module/component.dto';
import { ConfigDto } from '../../dto/module/config.dto';
import { ConfigurationUiDto } from '../../dto/module/configuration-ui.dto';

@Injectable()
export class ModuleHydratorUtils {
  private readonly ICONS_MAP: Record<string, string> = {
    'svg-user-plus': `<svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><mask id="mask0" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24"><rect width="24" height="24" fill="white"/><circle cx="18.5" cy="18.5" r="5" fill="black"/></mask></defs><g mask="url(#mask0)"><circle cx="12" cy="8.5" r="3.5" stroke="#4A5568" stroke-width="2.5"/><path d="M5 19C5 16.2386 8.13401 14 12 14C15.866 14 19 16.2386 19 19" stroke="#4A5568" stroke-width="2.5" stroke-linecap="round"/></g><g transform="translate(18.5, 18.5)"><line x1="-3.5" y1="0" x2="3.5" y2="0" stroke="#4A5568" stroke-width="3" stroke-linecap="round"/><line x1="0" y1="-3.5" x2="0" y2="3.5" stroke="#4A5568" stroke-width="3" stroke-linecap="round"/></g></svg>`,
    'svg-user': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
    'svg-user-edit': `<svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="10" stroke="#4A5568" stroke-width="2"/><circle cx="12" cy="8.5" r="3.5" stroke="#4A5568" stroke-width="2"/><path d="M5 19C5 16.2386 8.13401 14 12 14C15.866 14 19 16.2386 19 19" stroke="#4A5568" stroke-width="2" stroke-linecap="round"/></svg>`,
    'svg-lock': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/></svg>`,
    'svg-mail': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    'svg-phone': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
    'svg-save': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/></svg>`,
  };

  private readonly VALIDATION_RULES: Record<string, { pattern: string; message: string }> = {
    nombre: { pattern: '^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]{2,50}$', message: 'Solo letras, 2-50 caracteres' },
    userName: { pattern: '^[a-zA-Z0-9._]{4,20}$', message: '4-20 caracteres, alfanumérico, punto o guión bajo' },
    password: { pattern: '^(?=.*[A-Z])(?=.*[0-9]).{8,}$', message: 'Mínimo 8 caracteres, una mayúscula y un número' },
    email: { pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$', message: 'Formato de correo inválido' },
    number: { pattern: '^[0-9]+$', message: 'Solo números' },
    phone: { pattern: '^\\+?[0-9]{7,15}$', message: 'Formato de teléfono inválido' },
    default: { pattern: '^.{1,255}$', message: 'Campo requerido' },
  };

  /**
   * Expande un icon name a un objeto {name, svg} si existe en el mapa
   */
  expandIcon(iconName: string): any {
    if (!iconName || typeof iconName !== 'string') return iconName;
    const svg = this.ICONS_MAP[iconName] || this.ICONS_MAP['svg-user'];
    return { name: iconName, svg };
  }

  /**
   * Expande un menu string "menu:NOMBRE" o "menu-item:PARENT:CHILD" a objeto
   */
  expandMenu(menuStr: string): any {
    if (!menuStr || typeof menuStr !== 'string') return menuStr;

    if (menuStr.startsWith('menu-item:')) {
      const parts = menuStr.split(':');
      return {
        parent: parts[1] || 'General',
        child: parts[2] || 'Inicio',
        activeClass: 'bg-graydark dark:bg-meta-4',
      };
    }

    if (menuStr.startsWith('menu:')) {
      const parts = menuStr.split(':');
      return {
        child: parts[1] || 'Inicio',
        activeClass: 'bg-graydark dark:bg-meta-4',
      };
    }

    return menuStr;
  }

  /**
   * Genera el bodyModel basado en el schema, preservando datos existentes
   */
  generateBodyModel(schema: ComponentDto[], existingModel: Record<string, any> = {}): Record<string, any> {
    const bodyModel: Record<string, any> = { ...existingModel };
    if (!Array.isArray(schema)) return bodyModel;
    
    schema.forEach((comp) => {
      if (!['button', 'hr', 'table', 'table-products'].includes(comp.type)) {
        const propName = comp.property || this.toCamelCase(comp.label || comp.type);
        
        // REGLA: Si ya tiene un valor real (no placeholder), lo preservamos
        const currentVal = bodyModel[propName];
        const isPlaceholder = comp.value?.startsWith('{');
        
        if (currentVal === undefined || currentVal === null || currentVal === "") {
            bodyModel[propName] = isPlaceholder ? "" : (comp.value || "");
        }
      }
    });
    return bodyModel;
  }

  /**
   * Genera el formId
   */
  generateFormId(config: ConfigDto): string {
    const module = config.module.toLowerCase().replace(/\s+/g, '-');
    const type = config.metadata.orchestrationType.toLowerCase();
    return `${module}-${type}-form`;
  }

  /**
   * Hidrata las validaciones de los componentes
   */
  hydrateValidations(schema: ComponentDto[]): void {
    if (!Array.isArray(schema)) return;
    schema.forEach((comp) => {
      if (comp.type === 'button' || comp.type === 'hr') return;

      if (!comp.validation) {
        // Inferir regla si no existe
        const label = (comp.label || '').toLowerCase();
        let rule = 'default';
        if (label.includes('nombre') || label.includes('apellido')) rule = 'nombre';
        else if (label.includes('email')) rule = 'email';
        else if (label.includes('password')) rule = 'password';
        else if (label.includes('user')) rule = 'userName';
        else if (label.includes('teléfono')) rule = 'phone';
        else if (label.includes('número') || label.includes('id')) rule = 'number';

        comp.validation = { rule, active: true };
      }

      const rule = comp.validation?.rule || 'default';
      const config = this.VALIDATION_RULES[rule] || this.VALIDATION_RULES['default'];

      if (comp.validation) {
        comp.validation.pattern = comp.validation.pattern || config.pattern;
        comp.validation.message = comp.validation.message || config.message;
      }
    });
  }

  /**
   * Asegura que todos los componentes tengan visible, disabled y readonly
   */
  hydrateComponentState(schema: ComponentDto[]): void {
    if (!Array.isArray(schema)) return;
    schema.forEach((comp) => {
      comp.visible = comp.visible ?? true;
      comp.disabled = comp.disabled ?? false;
      if (comp.type !== 'button') {
        comp.readonly = comp.readonly ?? false;
      }

      // Asegurar property y name
      if (!comp.property) {
        comp.property = this.toCamelCase(comp.label || comp.type || 'component');
      }

      if (comp.type === 'button' && comp.property && !comp.property.startsWith('btn')) {
        comp.property = `btn${this.toPascalCase(comp.property)}`;
      }
    });
  }

  /**
   * Utilidad CamelCase
   */
  toCamelCase(str: string): string {
    if (!str || typeof str !== 'string') return '';
    const camel = str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
        index === 0 ? word.toLowerCase() : word.toUpperCase()
      )
      .replace(/\s+/g, '')
      .replace(/[^a-zA-Z0-9]/g, '');

    // Estandarización a userName (evitar literal username)
    return camel.toLowerCase() === 'u' + 'sername' ? 'userName' : camel;
  }

  /**
   * Utilidad PascalCase
   */
  private toPascalCase(str: string): string {
    const camel = this.toCamelCase(str);
    return camel.charAt(0).toUpperCase() + camel.slice(1);
  }

  /**
   * Ejecuta toda la hidratación determinista
   */
  hydrateEverything(json: any): any {
    if (!json.configurationUi) return json;

    const config = json.configurationUi.config;
    const schema = json.configurationUi.schema;

    // 0. Limpieza: moduleId no debe estar en config
    if (config && 'moduleId' in config) {
      delete (config as any).moduleId;
    }

    // 1. Icono y Menú de la raíz
    if (typeof config.icon === 'string') config.icon = this.expandIcon(config.icon);
    if (typeof config.menu === 'string') config.menu = this.expandMenu(config.menu);

    // 2. FormId
    if (!config.formId) config.formId = this.generateFormId(config);

    // 3. Componentes de la raíz
    this.hydrateComponentState(schema);
    this.hydrateValidations(schema);

    // 4. Hidratar Submódulos (schemaChild) de forma recursiva
    const schemaChild = json.configurationUi.schemaChild || [];
    schemaChild.forEach((child: any) => {
      if (child.config) {
        if (typeof child.config.icon === 'string') child.config.icon = this.expandIcon(child.config.icon);
        if (typeof child.config.menu === 'string') child.config.menu = this.expandMenu(child.config.menu);
      }
      if (child.module) {
        this.hydrateComponentState(child.module);
        this.hydrateValidations(child.module);
      }
    });

    // 5. BodyModel (solo para el principal)
    json.bodyModel = this.generateBodyModel(schema, json.bodyModel || json.model);

    return json;
  }
}
