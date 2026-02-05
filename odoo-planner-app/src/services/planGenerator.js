/**
 * Plan Generator Service
 * V3.2 - Generates senior PM-quality project plans with meaningful work packages
 *
 * Structure per module:
 * - Configuration & Setup (40% of hours)
 * - Data Migration (30% of hours)
 * - Testing & Validation (30% of hours)
 */

/**
 * Module-specific configuration activities
 */
const MODULE_ACTIVITIES = {
  CRM: {
    config: ['Pipeline stages and sales team structure', 'Lead scoring rules and automation', 'Email integration and templates', 'Custom fields and views'],
    config_es: ['Etapas de pipeline y estructura de equipo de ventas', 'Reglas de scoring de leads y automatización', 'Integración de email y plantillas', 'Campos personalizados y vistas'],
    migration: ['Import contacts and companies', 'Import leads and opportunities', 'Historical activities and notes'],
    migration_es: ['Importar contactos y empresas', 'Importar leads y oportunidades', 'Actividades históricas y notas'],
    testing: ['Sales workflow validation', 'Lead conversion testing', 'Report accuracy verification'],
    testing_es: ['Validación del flujo de ventas', 'Pruebas de conversión de leads', 'Verificación de precisión de reportes']
  },
  Sales: {
    config: ['Quotation templates and pricing rules', 'Product catalog structure', 'Approval workflows', 'Discount policies'],
    config_es: ['Plantillas de cotización y reglas de precios', 'Estructura del catálogo de productos', 'Flujos de aprobación', 'Políticas de descuento'],
    migration: ['Import product catalog', 'Import historical orders', 'Customer payment terms'],
    migration_es: ['Importar catálogo de productos', 'Importar órdenes históricas', 'Términos de pago de clientes'],
    testing: ['Order-to-invoice flow', 'Pricing rules validation', 'Discount and approval testing'],
    testing_es: ['Flujo de orden a factura', 'Validación de reglas de precios', 'Pruebas de descuentos y aprobaciones']
  },
  Inventory: {
    config: ['Warehouse locations and zones', 'Routes and reordering rules', 'Lot/serial number tracking', 'Barcode configuration'],
    config_es: ['Ubicaciones y zonas de almacén', 'Rutas y reglas de reabastecimiento', 'Seguimiento de lotes/números de serie', 'Configuración de código de barras'],
    migration: ['Import product inventory', 'Opening stock balances', 'Supplier lead times'],
    migration_es: ['Importar inventario de productos', 'Saldos de stock inicial', 'Tiempos de entrega de proveedores'],
    testing: ['Stock movement validation', 'Reordering rule testing', 'Inventory adjustment flows'],
    testing_es: ['Validación de movimientos de stock', 'Pruebas de reglas de reabastecimiento', 'Flujos de ajuste de inventario']
  },
  Purchase: {
    config: ['Vendor management setup', 'RFQ and PO workflows', 'Approval matrix', 'Purchase agreements'],
    config_es: ['Configuración de gestión de proveedores', 'Flujos de RFQ y PO', 'Matriz de aprobación', 'Acuerdos de compra'],
    migration: ['Import vendor master data', 'Purchase history', 'Open purchase orders'],
    migration_es: ['Importar datos maestros de proveedores', 'Historial de compras', 'Órdenes de compra abiertas'],
    testing: ['Requisition to PO flow', 'Three-way matching', 'Vendor performance tracking'],
    testing_es: ['Flujo de requisición a PO', 'Conciliación tripartita', 'Seguimiento de desempeño de proveedores']
  },
  Accounting: {
    config: ['Chart of accounts setup', 'Tax configuration and rules', 'Payment terms and methods', 'Bank reconciliation setup'],
    config_es: ['Configuración del plan de cuentas', 'Configuración de impuestos y reglas', 'Términos y métodos de pago', 'Configuración de conciliación bancaria'],
    migration: ['Opening balances', 'Customer/vendor balances', 'Fixed asset register'],
    migration_es: ['Saldos de apertura', 'Saldos de clientes/proveedores', 'Registro de activos fijos'],
    testing: ['Invoice to payment flow', 'Tax calculation validation', 'Financial report accuracy'],
    testing_es: ['Flujo de factura a pago', 'Validación de cálculo de impuestos', 'Precisión de reportes financieros']
  },
  Manufacturing: {
    config: ['Bill of Materials structure', 'Work centers and routings', 'Manufacturing orders workflow', 'Quality control points'],
    config_es: ['Estructura de Lista de Materiales', 'Centros de trabajo y rutas', 'Flujo de órdenes de manufactura', 'Puntos de control de calidad'],
    migration: ['Import BOMs', 'Work center capacity', 'WIP inventory'],
    migration_es: ['Importar BOMs', 'Capacidad de centros de trabajo', 'Inventario en proceso'],
    testing: ['MO creation and completion', 'Material consumption tracking', 'Production scheduling'],
    testing_es: ['Creación y completación de MO', 'Seguimiento de consumo de materiales', 'Programación de producción']
  },
  'Project': {
    config: ['Project stages and templates', 'Task types and workflows', 'Time tracking setup', 'Billing rules'],
    config_es: ['Etapas y plantillas de proyecto', 'Tipos de tarea y flujos', 'Configuración de seguimiento de tiempo', 'Reglas de facturación'],
    migration: ['Import active projects', 'Historical timesheets', 'Project templates'],
    migration_es: ['Importar proyectos activos', 'Hojas de tiempo históricas', 'Plantillas de proyecto'],
    testing: ['Project lifecycle flow', 'Timesheet to billing', 'Resource allocation'],
    testing_es: ['Flujo del ciclo de vida del proyecto', 'Hoja de tiempo a facturación', 'Asignación de recursos']
  },
  'HR': {
    config: ['Employee records structure', 'Department hierarchy', 'Leave types and policies', 'Expense categories'],
    config_es: ['Estructura de registros de empleados', 'Jerarquía departamental', 'Tipos de ausencia y políticas', 'Categorías de gastos'],
    migration: ['Import employee data', 'Leave balances', 'Expense history'],
    migration_es: ['Importar datos de empleados', 'Saldos de ausencias', 'Historial de gastos'],
    testing: ['Leave request workflow', 'Expense approval flow', 'Payroll integration'],
    testing_es: ['Flujo de solicitud de ausencia', 'Flujo de aprobación de gastos', 'Integración con nómina']
  }
};

/**
 * Get default activities for a module
 */
function getModuleActivities(moduleName, isSpanish) {
  const moduleKey = Object.keys(MODULE_ACTIVITIES).find(
    key => key.toLowerCase() === moduleName.toLowerCase()
  );

  if (moduleKey && MODULE_ACTIVITIES[moduleKey]) {
    const activities = MODULE_ACTIVITIES[moduleKey];
    return {
      config: isSpanish ? activities.config_es : activities.config,
      migration: isSpanish ? activities.migration_es : activities.migration,
      testing: isSpanish ? activities.testing_es : activities.testing
    };
  }

  // Default activities for unknown modules
  return {
    config: isSpanish
      ? ['Configuración inicial del módulo', 'Campos y vistas personalizadas', 'Reglas de automatización']
      : ['Initial module configuration', 'Custom fields and views', 'Automation rules'],
    migration: isSpanish
      ? ['Preparación de datos', 'Importación y validación']
      : ['Data preparation', 'Import and validation'],
    testing: isSpanish
      ? ['Pruebas de flujo de trabajo', 'Validación con usuarios']
      : ['Workflow testing', 'User validation']
  };
}

/**
 * Generate the complete project plan
 */
export function generateProjectPlan(responses) {
  const isSpanish = responses.language === 'Spanish';
  const deliverables = [];
  const milestones = [];
  let taskIdCounter = 1;

  // Calculate total allocated hours
  const clarityHours = responses.clarity_phase ? (parseFloat(responses.clarity_hours) || 0) : 0;
  const implementationHours = Object.values(responses.module_hours || {}).reduce((sum, h) => sum + (parseFloat(h) || 0), 0) +
    (responses.custom_modules || []).reduce((sum, m) => sum + (parseFloat(m.hours) || 0), 0);
  const trainingHours = responses.adoption_phase ? (parseFloat(responses.training_hours) || 0) : 0;
  const goLiveHoursTotal = responses.adoption_phase ? (parseFloat(responses.go_live_hours) || 0) : 0;
  const supportHours = responses.adoption_phase ?
    ((parseFloat(responses.support_hours_per_month) || 0) * (parseInt(responses.support_months) || 0)) : 0;
  const adoptionHours = trainingHours + goLiveHoursTotal + supportHours;
  const totalAllocatedHours = clarityHours + implementationHours + adoptionHours;

  // Project info
  const projectInfo = {
    name: responses.project_name,
    client: responses.client_name,
    manager: responses.project_manager,
    start_date: responses.project_start_date,
    deadline: responses.project_deadline,
    language: responses.language,
    allocated_hours: totalAllocatedHours
  };

  // Calculate dates for milestones
  const startDate = responses.project_start_date ? new Date(responses.project_start_date) : new Date();
  const deadline = responses.project_deadline ? new Date(responses.project_deadline) : null;

  // Generate Clarity Phase
  if (responses.clarity_phase) {
    const clarityDeliverables = generateClarityPhase(clarityHours, isSpanish, taskIdCounter, responses);
    taskIdCounter += clarityDeliverables.length * 5;
    deliverables.push(...clarityDeliverables);

    // Milestones for Clarity: Mapeo de Procesos, Hallazgos y TO-BE, Master de Implementación
    milestones.push({
      phase: 'Clarity',
      name: isSpanish ? 'Mapeo de Procesos' : 'Process Mapping',
      order: 1
    });
    milestones.push({
      phase: 'Clarity',
      name: isSpanish ? 'Hallazgos y TO-BE' : 'Findings and TO-BE',
      order: 2
    });
    milestones.push({
      phase: 'Clarity',
      name: isSpanish ? 'Master de Implementación' : 'Master of Implementation',
      order: 3
    });
  }

  // Generate Implementation Phase
  if (responses.implementation_phase) {
    const moduleHours = responses.module_hours || {};
    const customModules = responses.custom_modules || [];

    // First, add general Odoo setup tasks
    const setupDeliverables = generateOdooSetupTasks(isSpanish, taskIdCounter, responses);
    taskIdCounter += setupDeliverables.length * 5;
    deliverables.push(...setupDeliverables);

    let moduleOrder = 1;

    // Standard modules
    for (const [moduleName, hours] of Object.entries(moduleHours)) {
      if (hours > 0) {
        const moduleDeliverables = generateModuleWorkPackage(
          moduleName,
          hours,
          isSpanish,
          taskIdCounter,
          responses
        );
        taskIdCounter += 10;
        deliverables.push(...moduleDeliverables);

        // Milestone per module: "Implementación del Módulo de X"
        milestones.push({
          phase: 'Implementation',
          name: isSpanish ? `Implementación del Módulo de ${moduleName}` : `${moduleName} Module Implementation`,
          order: 10 + moduleOrder
        });
        moduleOrder++;
      }
    }

    // Custom modules
    for (const customMod of customModules) {
      if (customMod.name && customMod.hours > 0) {
        const customDeliverables = generateCustomModuleWorkPackage(
          customMod,
          isSpanish,
          taskIdCounter,
          responses
        );
        taskIdCounter += 10;
        deliverables.push(...customDeliverables);

        milestones.push({
          phase: 'Implementation',
          name: isSpanish ? `Implementación del Módulo de ${customMod.name}` : `${customMod.name} Module Implementation`,
          order: 10 + moduleOrder
        });
        moduleOrder++;
      }
    }

    // Add integrations task (included in general Odoo setup hours)
    if (responses.integrations === 'Yes' && responses.integration_list) {
      const integrationDeliverable = {
        id: taskIdCounter++,
        title: isSpanish ? 'Integraciones con Sistemas Externos' : 'External System Integrations',
        description: isSpanish
          ? `Desarrollo e integración con: ${responses.integration_list}`
          : `Development and integration with: ${responses.integration_list}`,
        allocated_hours: 16,
        priority: 'High',
        phase: 'Implementation',
        milestone: isSpanish ? 'Capacitación y Go-Live' : 'Training and Go-Live',
        task_type: 'deliverable',
        parent_task: '',
        stage: 'backlog',
        subtasks: [
          {
            id: taskIdCounter++,
            title: isSpanish ? 'Análisis de requerimientos de integración' : 'Integration requirements analysis',
            description: isSpanish
              ? 'Documentar endpoints, formatos de datos y flujos de integración requeridos'
              : 'Document endpoints, data formats and required integration flows',
            allocated_hours: 4,
            priority: 'High',
            phase: 'Implementation',
            task_type: 'subtask',
            stage: 'backlog'
          },
          {
            id: taskIdCounter++,
            title: isSpanish ? 'Desarrollo de conectores' : 'Connector development',
            description: isSpanish
              ? 'Desarrollo de conectores API y transformación de datos entre sistemas'
              : 'API connector development and data transformation between systems',
            allocated_hours: 8,
            priority: 'High',
            phase: 'Implementation',
            task_type: 'subtask',
            stage: 'backlog'
          },
          {
            id: taskIdCounter++,
            title: isSpanish ? 'Pruebas de integración' : 'Integration testing',
            description: isSpanish
              ? 'Validar sincronización de datos, manejo de errores y casos límite'
              : 'Validate data sync, error handling and edge cases',
            allocated_hours: 4,
            priority: 'High',
            phase: 'Implementation',
            task_type: 'subtask',
            stage: 'backlog'
          }
        ]
      };
      deliverables.push(integrationDeliverable);
    }

    // Multi-warehouse (adds to Inventory hours if present)
    if (responses.multi_warehouse === 'Yes') {
      const warehouseCount = parseInt(responses.warehouse_count) || 2;
      deliverables.push({
        id: taskIdCounter++,
        title: isSpanish ? 'Configuración Multi-Almacén' : 'Multi-Warehouse Configuration',
        description: isSpanish
          ? `Configuración de ${warehouseCount} almacenes con ubicaciones, rutas y reglas`
          : `Configuration of ${warehouseCount} warehouses with locations, routes, and rules`,
        allocated_hours: warehouseCount * 4,
        priority: 'Medium',
        phase: 'Implementation',
        milestone: isSpanish ? 'Capacitación y Go-Live' : 'Training and Go-Live',
        task_type: 'deliverable',
        parent_task: '',
        stage: 'backlog',
        subtasks: []
      });
    }
  }

  // Generate Adoption Phase
  if (responses.adoption_phase) {
    const adoptionDeliverables = generateAdoptionPhase(responses, isSpanish, taskIdCounter);
    deliverables.push(...adoptionDeliverables);

    // Only one milestone for adoption: Capacitación y Go-Live
    milestones.push({
      phase: 'Adoption',
      name: isSpanish ? 'Capacitación y Go-Live' : 'Training and Go-Live',
      order: 100
    });
  }

  // Generate flat task list
  const flatTasks = generateFlatTaskList(deliverables, responses);

  // Calculate stats
  const totalHours = deliverables.reduce((sum, d) => sum + d.allocated_hours, 0);
  const stats = {
    deliverableCount: deliverables.length,
    subtaskCount: deliverables.reduce((sum, d) => sum + (d.subtasks?.length || 0), 0),
    totalTasks: flatTasks.length,
    totalHours
  };

  return {
    project_info: projectInfo,
    milestones,
    deliverables,
    flatTasks,
    stats,
    generated_at: new Date().toISOString()
  };
}

/**
 * Generate general Odoo setup tasks
 */
function generateOdooSetupTasks(isSpanish, startId, responses) {
  const deliverables = [];
  let id = startId;

  // Configuration hours are distributed across general setup (about 8h)
  const setupDeliverable = {
    id: id++,
    title: isSpanish ? 'Configuración General de Odoo' : 'General Odoo Configuration',
    description: isSpanish
      ? 'Configuración inicial de la instancia, empresas, usuarios y roles'
      : 'Initial instance configuration, companies, users and roles setup',
    allocated_hours: 8,
    priority: 'High',
    phase: 'Implementation',
    milestone: isSpanish ? 'Capacitación y Go-Live' : 'Training and Go-Live',
    task_type: 'deliverable',
    parent_task: '',
    stage: 'backlog',
    subtasks: [
      {
        id: id++,
        title: isSpanish ? 'Configuración de instancia Odoo' : 'Odoo instance configuration',
        description: isSpanish
          ? 'Configuración base de la instancia: idioma, zona horaria, moneda y ajustes generales'
          : 'Base instance setup: language, timezone, currency and general settings',
        allocated_hours: 2,
        priority: 'High',
        phase: 'Implementation',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Configuración de empresa(s)' : 'Company(ies) setup',
        description: isSpanish
          ? 'Datos de empresa, logo, información fiscal y configuración multi-compañía si aplica'
          : 'Company data, logo, tax info and multi-company setup if applicable',
        allocated_hours: 2,
        priority: 'High',
        phase: 'Implementation',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Configuración de usuarios y roles' : 'Users and roles setup',
        description: isSpanish
          ? 'Crear usuarios, asignar grupos de acceso y configurar perfiles por departamento'
          : 'Create users, assign access groups and configure profiles by department',
        allocated_hours: 2,
        priority: 'High',
        phase: 'Implementation',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Configuración de accesos y seguridad' : 'Access and security configuration',
        description: isSpanish
          ? 'Reglas de registro, permisos por grupo y restricciones de seguridad'
          : 'Record rules, group permissions and security restrictions',
        allocated_hours: 2,
        priority: 'Medium',
        phase: 'Implementation',
        task_type: 'subtask',
        stage: 'backlog'
      }
    ]
  };

  deliverables.push(setupDeliverable);
  return deliverables;
}

/**
 * Generate Clarity phase work packages
 */
function generateClarityPhase(totalHours, isSpanish, startId, responses) {
  const deliverables = [];
  let id = startId;

  // Mapeo de Procesos Actuales (40%)
  const mappingHours = Math.round(totalHours * 0.4);
  deliverables.push({
    id: id++,
    title: isSpanish ? 'Mapeo de Procesos Actuales' : 'Current Process Mapping',
    description: isSpanish
      ? 'Sesiones de discovery y documentación de procesos AS-IS por área'
      : 'Discovery sessions and AS-IS process documentation by area',
    allocated_hours: mappingHours,
    priority: 'High',
    phase: 'Clarity',
    milestone: isSpanish ? 'Mapeo de Procesos' : 'Process Mapping',
    task_type: 'deliverable',
    parent_task: '',
    stage: 'backlog',
    subtasks: [
      {
        id: id++,
        title: isSpanish ? 'Sesiones de discovery' : 'Discovery sessions',
        description: isSpanish
          ? 'Reuniones con stakeholders para entender procesos y requerimientos actuales'
          : 'Meetings with stakeholders to understand current processes and requirements',
        allocated_hours: Math.round(mappingHours * 0.4),
        priority: 'High',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Documentar proceso AS-IS por departamento' : 'Document AS-IS process by department',
        description: isSpanish
          ? 'Crear diagramas de flujo y documentación de procesos actuales por área'
          : 'Create flowcharts and documentation of current processes by area',
        allocated_hours: Math.round(mappingHours * 0.4),
        priority: 'High',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Identificar áreas de oportunidad' : 'Identify opportunity areas',
        description: isSpanish
          ? 'Detectar ineficiencias, cuellos de botella y oportunidades de mejora'
          : 'Detect inefficiencies, bottlenecks and improvement opportunities',
        allocated_hours: Math.round(mappingHours * 0.2),
        priority: 'Medium',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      }
    ]
  });

  // Diseño de Proceso TO-BE (35%)
  const designHours = Math.round(totalHours * 0.35);
  deliverables.push({
    id: id++,
    title: isSpanish ? 'Diseño de Proceso TO-BE' : 'TO-BE Process Design',
    description: isSpanish
      ? 'Diseño de procesos futuros, mapeo a módulos de Odoo e identificación de personalizaciones'
      : 'Future process design, Odoo module mapping and customization identification',
    allocated_hours: designHours,
    priority: 'High',
    phase: 'Clarity',
    milestone: isSpanish ? 'Hallazgos y TO-BE' : 'Findings and TO-BE',
    task_type: 'deliverable',
    parent_task: '',
    stage: 'backlog',
    subtasks: [
      {
        id: id++,
        title: isSpanish ? 'Mapear requisitos a módulos de Odoo' : 'Map requirements to Odoo modules',
        description: isSpanish
          ? 'Relacionar necesidades del negocio con funcionalidades estándar de Odoo'
          : 'Relate business needs to standard Odoo functionalities',
        allocated_hours: Math.round(designHours * 0.35),
        priority: 'High',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Identificar necesidades de personalización' : 'Identify customization needs',
        description: isSpanish
          ? 'Documentar gaps entre funcionalidad estándar y requerimientos específicos'
          : 'Document gaps between standard functionality and specific requirements',
        allocated_hours: Math.round(designHours * 0.35),
        priority: 'High',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Definir workflows y reglas de negocio' : 'Define workflows and business rules',
        description: isSpanish
          ? 'Diseñar flujos de trabajo y reglas de automatización para cada proceso'
          : 'Design workflows and automation rules for each process',
        allocated_hours: Math.round(designHours * 0.3),
        priority: 'High',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      }
    ]
  });

  // Master de Implementación (25%)
  const masterHours = Math.round(totalHours * 0.25);
  deliverables.push({
    id: id++,
    title: isSpanish ? 'Master de Implementación' : 'Master of Implementation',
    description: isSpanish
      ? 'Definición de módulos, propiedades, reglas de negocio y maquetado de Odoo'
      : 'Module definition, properties, business rules and Odoo layout design',
    allocated_hours: masterHours,
    priority: 'High',
    phase: 'Clarity',
    milestone: isSpanish ? 'Master de Implementación' : 'Master of Implementation',
    task_type: 'deliverable',
    parent_task: '',
    stage: 'backlog',
    subtasks: [
      {
        id: id++,
        title: isSpanish ? 'Definir módulos a implementar' : 'Define modules to implement',
        description: isSpanish
          ? 'Listado final de módulos con alcance y dependencias'
          : 'Final module list with scope and dependencies',
        allocated_hours: Math.round(masterHours * 0.3),
        priority: 'High',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Bajar propiedades y reglas de negocio' : 'Document properties and business rules',
        description: isSpanish
          ? 'Especificación detallada de campos, valores por defecto y validaciones'
          : 'Detailed specification of fields, default values and validations',
        allocated_hours: Math.round(masterHours * 0.4),
        priority: 'High',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      },
      {
        id: id++,
        title: isSpanish ? 'Diseñar maquetado de Odoo' : 'Design Odoo layout',
        description: isSpanish
          ? 'Estructura de menús, vistas y dashboards personalizados'
          : 'Menu structure, views and custom dashboards',
        allocated_hours: Math.round(masterHours * 0.3),
        priority: 'High',
        phase: 'Clarity',
        task_type: 'subtask',
        stage: 'backlog'
      }
    ]
  });

  return deliverables;
}

/**
 * Generate work packages for a standard module
 */
function generateModuleWorkPackage(moduleName, totalHours, isSpanish, startId, responses) {
  const deliverables = [];
  let id = startId;
  const activities = getModuleActivities(moduleName, isSpanish);

  // Main module deliverable - renamed to "Implementación del Módulo de X"
  const moduleTitle = isSpanish
    ? `Implementación del Módulo de ${moduleName}`
    : `${moduleName} Module Implementation`;

  const moduleDeliverable = {
    id: id++,
    title: moduleTitle,
    description: isSpanish
      ? `Configuración, migración y pruebas del módulo de ${moduleName}`
      : `Configuration, migration and testing of ${moduleName} module`,
    allocated_hours: totalHours,
    priority: 'High',
    phase: 'Implementation',
    module: moduleName,
    milestone: isSpanish ? `Implementación del Módulo de ${moduleName}` : `${moduleName} Module Implementation`,
    task_type: 'deliverable',
    parent_task: '',
    stage: 'backlog',
    subtasks: []
  };

  // Configuration & Setup (70%)
  const configHours = Math.round(totalHours * 0.7);
  moduleDeliverable.subtasks.push({
    id: id++,
    title: isSpanish ? `Configuración y Setup de ${moduleName}` : `${moduleName} Configuration & Setup`,
    description: activities.config.join(', '),
    allocated_hours: configHours,
    priority: 'High',
    phase: 'Implementation',
    module: moduleName,
    task_type: 'subtask',
    parent_task: moduleTitle,
    stage: 'backlog'
  });

  // Data Migration (15%)
  const migrationHours = Math.round(totalHours * 0.15);
  moduleDeliverable.subtasks.push({
    id: id++,
    title: isSpanish ? `Migración de Datos de ${moduleName}` : `${moduleName} Data Migration`,
    description: activities.migration.join(', '),
    allocated_hours: migrationHours,
    priority: 'High',
    phase: 'Implementation',
    module: moduleName,
    task_type: 'subtask',
    parent_task: moduleTitle,
    stage: 'backlog'
  });

  // Testing & Validation (15%)
  const testingHours = Math.round(totalHours * 0.15);
  moduleDeliverable.subtasks.push({
    id: id++,
    title: isSpanish ? `Testing y Validación de ${moduleName}` : `${moduleName} Testing & Validation`,
    description: activities.testing.join(', '),
    allocated_hours: testingHours,
    priority: 'High',
    phase: 'Implementation',
    module: moduleName,
    task_type: 'subtask',
    parent_task: moduleTitle,
    stage: 'backlog'
  });

  deliverables.push(moduleDeliverable);
  return deliverables;
}

/**
 * Generate work packages for a custom module
 */
function generateCustomModuleWorkPackage(customModule, isSpanish, startId, responses) {
  const deliverables = [];
  let id = startId;
  const totalHours = customModule.hours || 20;

  const moduleTitle = isSpanish
    ? `Implementación del Módulo de ${customModule.name}`
    : `${customModule.name} Module Implementation`;

  const moduleDeliverable = {
    id: id++,
    title: moduleTitle,
    description: customModule.description || (isSpanish
      ? `Desarrollo del módulo personalizado: ${customModule.name}`
      : `Development of custom module: ${customModule.name}`),
    allocated_hours: totalHours,
    priority: 'High',
    phase: 'Implementation',
    module: customModule.name,
    is_custom: true,
    milestone: isSpanish ? `Implementación del Módulo de ${customModule.name}` : `${customModule.name} Module Implementation`,
    task_type: 'deliverable',
    parent_task: '',
    stage: 'backlog',
    subtasks: []
  };

  // Development (60%)
  const devHours = Math.round(totalHours * 0.6);
  moduleDeliverable.subtasks.push({
    id: id++,
    title: isSpanish ? `Diseño y Desarrollo de ${customModule.name}` : `${customModule.name} Design & Development`,
    description: isSpanish
      ? `Diseño técnico y desarrollo del módulo ${customModule.name}`
      : `Technical design and development of ${customModule.name} module`,
    allocated_hours: devHours,
    priority: 'High',
    phase: 'Implementation',
    module: customModule.name,
    task_type: 'subtask',
    parent_task: moduleTitle,
    stage: 'backlog'
  });

  // Testing (25%)
  const testHours = Math.round(totalHours * 0.25);
  moduleDeliverable.subtasks.push({
    id: id++,
    title: isSpanish ? `Testing y QA de ${customModule.name}` : `${customModule.name} Testing & QA`,
    description: isSpanish
      ? `Pruebas unitarias y de integración para ${customModule.name}`
      : `Unit and integration testing for ${customModule.name}`,
    allocated_hours: testHours,
    priority: 'High',
    phase: 'Implementation',
    module: customModule.name,
    task_type: 'subtask',
    parent_task: moduleTitle,
    stage: 'backlog'
  });

  // Documentation (15%)
  const docHours = Math.round(totalHours * 0.15);
  moduleDeliverable.subtasks.push({
    id: id++,
    title: isSpanish ? `Documentación de ${customModule.name}` : `${customModule.name} Documentation`,
    description: isSpanish
      ? `Documentación técnica y de usuario para ${customModule.name}`
      : `Technical and user documentation for ${customModule.name}`,
    allocated_hours: docHours,
    priority: 'Medium',
    phase: 'Implementation',
    module: customModule.name,
    task_type: 'subtask',
    parent_task: moduleTitle,
    stage: 'backlog'
  });

  deliverables.push(moduleDeliverable);
  return deliverables;
}

/**
 * Generate Adoption phase work packages
 */
function generateAdoptionPhase(responses, isSpanish, startId) {
  const deliverables = [];
  let id = startId;

  const trainingHours = parseFloat(responses.training_hours) || 24;
  const supportHoursPerMonth = parseFloat(responses.support_hours_per_month) || 10;
  const supportMonths = parseInt(responses.support_months) || 2;

  // Training & Knowledge Transfer
  if (trainingHours > 0) {
    deliverables.push({
      id: id++,
      title: isSpanish ? 'Capacitación' : 'Training',
      description: isSpanish
        ? 'Capacitación de administradores y usuarios finales del sistema'
        : 'Admin and end-user training sessions',
      allocated_hours: trainingHours,
      priority: 'High',
      phase: 'Adoption',
      milestone: isSpanish ? 'Capacitación y Go-Live' : 'Training and Go-Live',
      task_type: 'deliverable',
      parent_task: '',
      stage: 'backlog',
      subtasks: [
        {
          id: id++,
          title: isSpanish ? 'Capacitación de administradores (power users)' : 'Admin training (power users)',
          description: isSpanish
            ? 'Entrenamiento avanzado para usuarios clave que darán soporte interno'
            : 'Advanced training for key users who will provide internal support',
          allocated_hours: Math.round(trainingHours * 0.35),
          priority: 'High',
          phase: 'Adoption',
          task_type: 'subtask',
          stage: 'backlog'
        },
        {
          id: id++,
          title: isSpanish ? 'Capacitación de usuarios finales' : 'End-user training',
          description: isSpanish
            ? 'Sesiones de capacitación por departamento para usuarios del día a día'
            : 'Training sessions by department for day-to-day users',
          allocated_hours: Math.round(trainingHours * 0.5),
          priority: 'High',
          phase: 'Adoption',
          task_type: 'subtask',
          stage: 'backlog'
        },
        {
          id: id++,
          title: isSpanish ? 'Materiales de capacitación' : 'Training materials',
          description: isSpanish
            ? 'Guías rápidas, videos tutoriales y documentación de usuario'
            : 'Quick guides, tutorial videos and user documentation',
          allocated_hours: Math.round(trainingHours * 0.15),
          priority: 'Medium',
          phase: 'Adoption',
          task_type: 'subtask',
          stage: 'backlog'
        }
      ]
    });
  }

  // Go-Live (using user-defined hours)
  const goLiveHours = parseFloat(responses.go_live_hours) || 8;
  if (goLiveHours > 0) {
    const prepHours = Math.round(goLiveHours * 0.25);
    const supportHours = goLiveHours - prepHours;

    deliverables.push({
      id: id++,
      title: isSpanish ? 'Go-Live' : 'Go-Live',
      description: isSpanish
        ? 'Preparación y ejecución de go-live con soporte intensivo'
        : 'Go-live preparation and execution with intensive support',
      allocated_hours: goLiveHours,
      priority: 'High',
      phase: 'Adoption',
      milestone: isSpanish ? 'Capacitación y Go-Live' : 'Training and Go-Live',
      task_type: 'deliverable',
      parent_task: '',
      stage: 'backlog',
      subtasks: [
        {
          id: id++,
          title: isSpanish ? 'Preparación y checklist de go-live' : 'Go-live preparation & checklist',
          description: isSpanish
            ? 'Verificar configuración, datos, usuarios y permisos antes de producción'
            : 'Verify configuration, data, users and permissions before production',
          allocated_hours: prepHours,
          priority: 'High',
          phase: 'Adoption',
          task_type: 'subtask',
          stage: 'backlog'
        },
        {
          id: id++,
          title: isSpanish ? 'Soporte de go-live' : 'Go-live support',
          description: isSpanish
            ? 'Soporte intensivo durante los primeros días de producción'
            : 'Intensive support during first days in production',
          allocated_hours: supportHours,
          priority: 'High',
          phase: 'Adoption',
          task_type: 'subtask',
          stage: 'backlog'
        }
      ]
    });
  }

  // Monthly Support (no individual milestones per month)
  if (supportMonths > 0 && supportHoursPerMonth > 0) {
    const supportDeliverable = {
      id: id++,
      title: isSpanish ? 'Soporte Post Go-Live' : 'Post Go-Live Support',
      description: isSpanish
        ? `${supportMonths} meses de soporte con ${supportHoursPerMonth} horas por mes`
        : `${supportMonths} months of support with ${supportHoursPerMonth} hours per month`,
      allocated_hours: supportHoursPerMonth * supportMonths,
      priority: 'Medium',
      phase: 'Adoption',
      milestone: isSpanish ? 'Capacitación y Go-Live' : 'Training and Go-Live',
      task_type: 'deliverable',
      parent_task: '',
      stage: 'backlog',
      subtasks: []
    };

    for (let month = 1; month <= supportMonths; month++) {
      supportDeliverable.subtasks.push({
        id: id++,
        title: isSpanish ? `Mes ${month}: Soporte y optimización` : `Month ${month}: Support and optimization`,
        description: isSpanish
          ? `Soporte técnico, resolución de incidencias y mejoras menores durante el mes ${month}`
          : `Technical support, incident resolution and minor improvements during month ${month}`,
        allocated_hours: supportHoursPerMonth,
        priority: 'Medium',
        phase: 'Adoption',
        task_type: 'subtask',
        stage: 'backlog'
      });
    }

    deliverables.push(supportDeliverable);
  }

  return deliverables;
}

/**
 * Generate flat task list for CSV export
 */
function generateFlatTaskList(deliverables, responses) {
  const flatTasks = [];
  const teamMembers = responses.team_members || [];

  for (const deliverable of deliverables) {
    // Add deliverable as parent task
    flatTasks.push({
      id: deliverable.id,
      title: deliverable.title,
      description: deliverable.description,
      allocated_hours: deliverable.allocated_hours,
      priority: deliverable.priority,
      phase: deliverable.phase,
      module: deliverable.module || '',
      milestone: deliverable.milestone,
      task_type: 'deliverable',
      parent_task: '',
      assignee: assignTask(deliverable, teamMembers),
      tags: [deliverable.phase, 'Deliverable'],
      is_custom: deliverable.is_custom || false,
      stage: 'backlog'
    });

    // Add subtasks
    for (const subtask of deliverable.subtasks || []) {
      flatTasks.push({
        id: subtask.id,
        title: subtask.title,
        description: subtask.description || '',
        allocated_hours: subtask.allocated_hours,
        priority: subtask.priority,
        phase: subtask.phase,
        module: subtask.module || deliverable.module || '',
        milestone: deliverable.milestone,
        task_type: 'subtask',
        parent_task: deliverable.title,
        assignee: assignTask(subtask, teamMembers),
        tags: [subtask.phase, 'Subtask'],
        stage: 'backlog'
      });
    }
  }

  return flatTasks;
}

/**
 * Team member roles mapping
 */
const TEAM_MEMBER_ROLES = {
  'Andrés Solórzano': 'Process Consultant',
  'Jose Ricardo Gomez Duran': 'Process Consultant',
  'Josué Isaías Torres Gonzalez': 'Process Consultant',
  'José De Jesus Ruvalcaba Luna': 'Odoo Developer',
  'Kenneth André Parrales Aguirre': 'Odoo Developer',
  'Martin Zollneritsch': 'Process Consultant',
  'Rodrigo Yeo': 'Process Consultant',
  'Salvador Perez Barrera': 'Process Consultant'
};

/**
 * Assign task to team member based on phase
 * - Implementation phase → Odoo Developer
 * - Clarity and Adoption phases → Process Consultant
 */
function assignTask(task, teamMembers) {
  if (teamMembers.length === 0) return '';

  const phase = task.phase;

  // Get team members by role
  const odooDevelopers = teamMembers.filter(m => TEAM_MEMBER_ROLES[m] === 'Odoo Developer');
  const processConsultants = teamMembers.filter(m => TEAM_MEMBER_ROLES[m] === 'Process Consultant');

  // Implementation phase tasks go to Odoo Developer
  if (phase === 'Implementation') {
    if (odooDevelopers.length > 0) {
      // Distribute among developers using task id for consistency
      const index = (typeof task.id === 'number' ? task.id : 0) % odooDevelopers.length;
      return odooDevelopers[index];
    }
    // Fallback to consultants if no developer selected
    if (processConsultants.length > 0) {
      const index = (typeof task.id === 'number' ? task.id : 0) % processConsultants.length;
      return processConsultants[index];
    }
  }

  // Clarity and Adoption phase tasks go to Process Consultant
  if (phase === 'Clarity' || phase === 'Adoption') {
    if (processConsultants.length > 0) {
      // Distribute among consultants using task id for consistency
      const index = (typeof task.id === 'number' ? task.id : 0) % processConsultants.length;
      return processConsultants[index];
    }
    // Fallback to developers if no consultant selected
    if (odooDevelopers.length > 0) {
      return odooDevelopers[0];
    }
  }

  // Default: distribute among all team members
  const index = (typeof task.id === 'number' ? task.id : 0) % teamMembers.length;
  return teamMembers[index] || '';
}

export default { generateProjectPlan };
