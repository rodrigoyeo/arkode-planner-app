/**
 * Task Consolidator Service
 *
 * Consolidates 80+ granular tasks into 15-30 deliverables with subtasks.
 * Maintains parent-child relationships for Odoo export via Parent Task field.
 */

import deliverableGroups from '../data/deliverable-groups.json';

/**
 * Main consolidation function
 * @param {Array} rawTasks - Array of granular tasks from task library
 * @param {Object} responses - Questionnaire responses
 * @param {string} language - 'English' or 'Spanish'
 * @returns {Object} - { deliverables: Array, flatTasks: Array }
 */
export function consolidateTasks(rawTasks, responses, language = 'English') {
  const isSpanish = language === 'Spanish';
  const deliverables = [];
  let taskIdCounter = 1;

  // Group tasks by phase
  const clarityTasks = rawTasks.filter(t => t.phase === 'Clarity');
  const implementationTasks = rawTasks.filter(t => t.phase === 'Implementation');
  const adoptionTasks = rawTasks.filter(t => t.phase === 'Adoption');

  // Consolidate Clarity Phase
  if (responses.clarity_phase) {
    const clarityDeliverables = consolidateClarityPhase(
      clarityTasks,
      responses,
      isSpanish,
      taskIdCounter
    );
    taskIdCounter += clarityDeliverables.reduce((sum, d) => sum + 1 + d.subtasks.length, 0);
    deliverables.push(...clarityDeliverables);
  }

  // Consolidate Implementation Phase
  if (responses.implementation_phase) {
    const implDeliverables = consolidateImplementationPhase(
      implementationTasks,
      responses,
      isSpanish,
      taskIdCounter
    );
    taskIdCounter += implDeliverables.reduce((sum, d) => sum + 1 + d.subtasks.length, 0);
    deliverables.push(...implDeliverables);
  }

  // Consolidate Adoption Phase
  if (responses.adoption_phase) {
    const adoptionDeliverables = consolidateAdoptionPhase(
      adoptionTasks,
      responses,
      isSpanish,
      taskIdCounter
    );
    deliverables.push(...adoptionDeliverables);
  }

  // Generate flat task list for CSV export
  const flatTasks = generateFlatTaskList(deliverables, responses);

  return {
    deliverables,
    flatTasks,
    stats: {
      deliverableCount: deliverables.length,
      subtaskCount: deliverables.reduce((sum, d) => sum + d.subtasks.length, 0),
      totalTasks: flatTasks.length
    }
  };
}

/**
 * Consolidate Clarity phase tasks into 2-3 deliverables
 */
function consolidateClarityPhase(tasks, responses, isSpanish, startId) {
  const groups = deliverableGroups.clarity_deliverables;
  const deliverables = [];
  const clarityHours = parseFloat(responses.clarity_hours) || 40;
  let currentId = startId;

  for (const group of groups) {
    const matchingTasks = tasks.filter(task =>
      group.task_patterns.some(pattern =>
        task.title?.toLowerCase().includes(pattern.toLowerCase()) ||
        task.category?.toLowerCase().includes(pattern.toLowerCase())
      )
    );

    if (matchingTasks.length > 0) {
      const allocatedHours = Math.round(clarityHours * (group.default_hours_percent / 100));

      const deliverable = {
        id: currentId++,
        title: isSpanish ? group.name_es : group.name,
        description: isSpanish ? group.description_es : group.description,
        allocated_hours: allocatedHours,
        priority: group.priority,
        phase: 'Clarity',
        milestone: isSpanish ? group.milestone_es : group.milestone,
        task_type: 'deliverable',
        parent_task: '',
        subtasks: matchingTasks.map(task => ({
          id: currentId++,
          title: isSpanish ? (task.name_es || task.title) : task.title,
          description: isSpanish ? (task.description_es || task.description) : task.description,
          allocated_hours: Math.round(task.estimated_hours * (allocatedHours / matchingTasks.reduce((sum, t) => sum + t.estimated_hours, 0))),
          priority: task.priority || 'Medium',
          phase: 'Clarity',
          milestone: isSpanish ? group.milestone_es : group.milestone,
          task_type: 'subtask',
          parent_task: isSpanish ? group.name_es : group.name,
          category: task.category,
          tags: task.tags || []
        }))
      };

      // Adjust subtask hours to match deliverable total
      normalizeSubtaskHours(deliverable);
      deliverables.push(deliverable);
    }
  }

  return deliverables;
}

/**
 * Consolidate Implementation phase tasks by module
 */
function consolidateImplementationPhase(tasks, responses, isSpanish, startId) {
  const moduleGroups = deliverableGroups.module_deliverable_groups;
  const specialDeliverables = deliverableGroups.special_deliverables;
  const deliverables = [];
  let currentId = startId;

  const selectedModules = responses.modules || [];
  const totalImplHours = calculateImplementationHours(responses);

  // Calculate hours per module (evenly distributed)
  const hoursPerModule = selectedModules.length > 0
    ? Math.round(totalImplHours * 0.7 / selectedModules.length) // 70% to modules, 30% to special
    : 0;

  // Process each selected module
  for (const moduleName of selectedModules) {
    const moduleTasks = tasks.filter(t =>
      t.module === moduleName ||
      t.title?.includes(moduleName) ||
      t.category?.includes(moduleName)
    );

    for (const group of moduleGroups) {
      const matchingTasks = moduleTasks.filter(task =>
        group.task_patterns.some(pattern =>
          task.title?.toLowerCase().includes(pattern.toLowerCase()) ||
          task.category?.toLowerCase().includes(pattern.toLowerCase())
        )
      );

      if (matchingTasks.length > 0) {
        const groupHours = Math.round(hoursPerModule * (group.default_hours_percent / 100));
        const deliverableName = group.name_template.replace('{module}', moduleName);
        const deliverableNameEs = group.name_template_es.replace('{module}', moduleName);

        const deliverable = {
          id: currentId++,
          title: isSpanish ? deliverableNameEs : deliverableName,
          description: (isSpanish ? group.description_template_es : group.description_template).replace('{module}', moduleName),
          allocated_hours: groupHours,
          priority: group.priority,
          phase: 'Implementation',
          module: moduleName,
          milestone: isSpanish
            ? `Implementación del Módulo de ${moduleName}`
            : `Implementation of ${moduleName} Module`,
          task_type: 'deliverable',
          parent_task: '',
          subtasks: matchingTasks.map(task => ({
            id: currentId++,
            title: isSpanish ? (task.name_es || task.title) : task.title,
            description: isSpanish ? (task.description_es || task.description) : task.description,
            allocated_hours: Math.round(task.estimated_hours * (groupHours / matchingTasks.reduce((sum, t) => sum + t.estimated_hours, 0)) || 2),
            priority: task.priority || 'Medium',
            phase: 'Implementation',
            module: moduleName,
            milestone: isSpanish
              ? `Implementación del Módulo de ${moduleName}`
              : `Implementation of ${moduleName} Module`,
            task_type: 'subtask',
            parent_task: isSpanish ? deliverableNameEs : deliverableName,
            category: task.category,
            tags: task.tags || [],
            odoo_feature: task.odoo_feature
          }))
        };

        normalizeSubtaskHours(deliverable);
        deliverables.push(deliverable);
      }
    }
  }

  // Add Security deliverable
  const securityHours = specialDeliverables.security.default_hours;
  deliverables.push({
    id: currentId++,
    title: isSpanish ? specialDeliverables.security.name_es : specialDeliverables.security.name,
    description: isSpanish ? specialDeliverables.security.description_es : specialDeliverables.security.description,
    allocated_hours: securityHours,
    priority: specialDeliverables.security.priority,
    phase: 'Implementation',
    milestone: isSpanish ? 'Configuración de Seguridad' : 'Security Configuration',
    task_type: 'deliverable',
    parent_task: '',
    subtasks: []
  });

  // Add Multi-Warehouse deliverable if enabled
  if (responses.multi_warehouse === 'Yes') {
    const warehouseCount = parseInt(responses.warehouse_count) || 2;
    const warehouseHours = specialDeliverables.warehouse.hours_per_warehouse * warehouseCount;

    deliverables.push({
      id: currentId++,
      title: isSpanish ? specialDeliverables.warehouse.name_es : specialDeliverables.warehouse.name,
      description: isSpanish ? specialDeliverables.warehouse.description_es : specialDeliverables.warehouse.description,
      allocated_hours: warehouseHours,
      priority: specialDeliverables.warehouse.priority,
      phase: 'Implementation',
      milestone: isSpanish ? 'Configuración Multi-Almacén' : 'Multi-Warehouse Setup',
      task_type: 'deliverable',
      parent_task: '',
      subtasks: Array.from({ length: warehouseCount }, (_, i) => ({
        id: currentId++,
        title: isSpanish ? `Almacén ${i + 1} - Configuración` : `Warehouse ${i + 1} Configuration`,
        description: isSpanish
          ? `Configuración de ubicaciones, rutas y reglas para almacén ${i + 1}`
          : `Setup locations, routes, and rules for warehouse ${i + 1}`,
        allocated_hours: specialDeliverables.warehouse.hours_per_warehouse,
        priority: 'Medium',
        phase: 'Implementation',
        milestone: isSpanish ? 'Configuración Multi-Almacén' : 'Multi-Warehouse Setup',
        task_type: 'subtask',
        parent_task: isSpanish ? specialDeliverables.warehouse.name_es : specialDeliverables.warehouse.name
      }))
    });
  }

  // Add Integration deliverable if enabled
  if (responses.integrations === 'Yes' && responses.integration_list) {
    deliverables.push({
      id: currentId++,
      title: isSpanish ? specialDeliverables.integration.name_es : specialDeliverables.integration.name,
      description: `${isSpanish ? specialDeliverables.integration.description_es : specialDeliverables.integration.description}: ${responses.integration_list}`,
      allocated_hours: specialDeliverables.integration.base_hours,
      priority: specialDeliverables.integration.priority,
      phase: 'Implementation',
      milestone: isSpanish ? 'Integraciones' : 'Integrations',
      task_type: 'deliverable',
      parent_task: '',
      subtasks: []
    });
  }

  // Add Custom Module deliverables
  const customModulesCount = parseInt(responses.custom_modules_count) || 0;
  for (let i = 1; i <= customModulesCount; i++) {
    const moduleName = responses[`custom_module_${i}_name`];
    const moduleHours = parseFloat(responses[`custom_module_${i}_hours`]) || 20;
    const moduleDescription = responses[`custom_module_${i}_description`] || '';

    if (moduleName) {
      const customDeliverableName = specialDeliverables.custom_module.name_template.replace('{name}', moduleName);
      const customDeliverableNameEs = specialDeliverables.custom_module.name_template_es.replace('{name}', moduleName);

      deliverables.push({
        id: currentId++,
        title: isSpanish ? customDeliverableNameEs : customDeliverableName,
        description: moduleDescription || (isSpanish
          ? `Desarrollo e implementación del módulo personalizado: ${moduleName}`
          : `Development and implementation of custom module: ${moduleName}`),
        allocated_hours: moduleHours,
        priority: specialDeliverables.custom_module.priority,
        phase: 'Implementation',
        module: moduleName,
        milestone: isSpanish ? `Módulo Personalizado: ${moduleName}` : `Custom Module: ${moduleName}`,
        task_type: 'deliverable',
        parent_task: '',
        is_custom: true,
        subtasks: generateCustomModuleSubtasks(moduleName, moduleHours, isSpanish, currentId, customDeliverableName, customDeliverableNameEs)
      });
      currentId += 3; // 3 subtasks per custom module
    }
  }

  return deliverables;
}

/**
 * Generate subtasks for a custom module (2-3 tasks)
 */
function generateCustomModuleSubtasks(moduleName, totalHours, isSpanish, startId, parentName, parentNameEs) {
  const subtasks = [
    {
      id: startId,
      title: isSpanish ? `${moduleName} - Diseño y Desarrollo` : `${moduleName} - Design & Development`,
      description: isSpanish
        ? `Diseño técnico y desarrollo del módulo ${moduleName}`
        : `Technical design and development of ${moduleName} module`,
      allocated_hours: Math.round(totalHours * 0.6),
      priority: 'High',
      phase: 'Implementation',
      task_type: 'subtask',
      parent_task: isSpanish ? parentNameEs : parentName
    },
    {
      id: startId + 1,
      title: isSpanish ? `${moduleName} - Testing y QA` : `${moduleName} - Testing & QA`,
      description: isSpanish
        ? `Pruebas unitarias y de integración para ${moduleName}`
        : `Unit and integration testing for ${moduleName}`,
      allocated_hours: Math.round(totalHours * 0.25),
      priority: 'High',
      phase: 'Implementation',
      task_type: 'subtask',
      parent_task: isSpanish ? parentNameEs : parentName
    },
    {
      id: startId + 2,
      title: isSpanish ? `${moduleName} - Documentación` : `${moduleName} - Documentation`,
      description: isSpanish
        ? `Documentación técnica y de usuario para ${moduleName}`
        : `Technical and user documentation for ${moduleName}`,
      allocated_hours: Math.round(totalHours * 0.15),
      priority: 'Medium',
      phase: 'Implementation',
      task_type: 'subtask',
      parent_task: isSpanish ? parentNameEs : parentName
    }
  ];

  return subtasks;
}

/**
 * Consolidate Adoption phase tasks into 2 deliverables
 */
function consolidateAdoptionPhase(tasks, responses, isSpanish, startId) {
  const groups = deliverableGroups.adoption_deliverables;
  const deliverables = [];
  let currentId = startId;

  const trainingHours = parseFloat(responses.training_hours) || 16;
  const supportHoursPerMonth = parseFloat(responses.support_hours_per_month) || 20;
  const supportMonths = Math.min(parseInt(responses.adoption_duration_months) || 2, 3); // Cap at 3
  const totalAdoptionHours = trainingHours + (supportHoursPerMonth * supportMonths);

  for (const group of groups) {
    const matchingTasks = tasks.filter(task =>
      group.task_patterns.some(pattern =>
        task.title?.toLowerCase().includes(pattern.toLowerCase()) ||
        task.category?.toLowerCase().includes(pattern.toLowerCase())
      )
    );

    const allocatedHours = Math.round(totalAdoptionHours * (group.default_hours_percent / 100));

    const deliverable = {
      id: currentId++,
      title: isSpanish ? group.name_es : group.name,
      description: isSpanish ? group.description_es : group.description,
      allocated_hours: allocatedHours,
      priority: group.priority,
      phase: 'Adoption',
      milestone: isSpanish ? group.milestone_es : group.milestone,
      task_type: 'deliverable',
      parent_task: '',
      subtasks: matchingTasks.length > 0 ? matchingTasks.map(task => ({
        id: currentId++,
        title: isSpanish ? (task.name_es || task.title) : task.title,
        description: isSpanish ? (task.description_es || task.description) : task.description,
        allocated_hours: Math.round(task.estimated_hours * (allocatedHours / matchingTasks.reduce((sum, t) => sum + t.estimated_hours, 0)) || 2),
        priority: task.priority || 'Medium',
        phase: 'Adoption',
        milestone: isSpanish ? group.milestone_es : group.milestone,
        task_type: 'subtask',
        parent_task: isSpanish ? group.name_es : group.name,
        category: task.category
      })) : []
    };

    if (deliverable.subtasks.length > 0) {
      normalizeSubtaskHours(deliverable);
    }
    deliverables.push(deliverable);
  }

  return deliverables;
}

/**
 * Normalize subtask hours to match deliverable total
 */
function normalizeSubtaskHours(deliverable) {
  if (deliverable.subtasks.length === 0) return;

  const currentTotal = deliverable.subtasks.reduce((sum, st) => sum + st.allocated_hours, 0);
  if (currentTotal === 0) return;

  const scaleFactor = deliverable.allocated_hours / currentTotal;

  let runningTotal = 0;
  deliverable.subtasks.forEach((subtask, index) => {
    if (index === deliverable.subtasks.length - 1) {
      // Last subtask gets the remainder to ensure exact match
      subtask.allocated_hours = deliverable.allocated_hours - runningTotal;
    } else {
      subtask.allocated_hours = Math.round(subtask.allocated_hours * scaleFactor);
      runningTotal += subtask.allocated_hours;
    }
  });
}

/**
 * Calculate total implementation hours from responses
 */
function calculateImplementationHours(responses) {
  let total = 0;

  // Module hours (auto-distributed, so use a base calculation)
  const selectedModules = responses.modules || [];
  const baseHoursPerModule = 20;
  total += selectedModules.length * baseHoursPerModule;

  // Custom module hours
  const customCount = parseInt(responses.custom_modules_count) || 0;
  for (let i = 1; i <= customCount; i++) {
    total += parseFloat(responses[`custom_module_${i}_hours`]) || 0;
  }

  // If total hours were explicitly specified in template
  if (responses.implementation_hours) {
    return parseFloat(responses.implementation_hours);
  }

  return total;
}

/**
 * Generate flat task list for CSV export
 * Includes both deliverables and subtasks with Parent Task relationships
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
      is_custom: deliverable.is_custom || false
    });

    // Add subtasks
    for (const subtask of deliverable.subtasks) {
      flatTasks.push({
        id: subtask.id,
        title: subtask.title,
        description: subtask.description,
        allocated_hours: subtask.allocated_hours,
        priority: subtask.priority,
        phase: subtask.phase,
        module: subtask.module || deliverable.module || '',
        milestone: subtask.milestone || deliverable.milestone,
        task_type: 'subtask',
        parent_task: deliverable.title,
        assignee: assignTask(subtask, teamMembers),
        tags: [subtask.phase, 'Subtask'],
        category: subtask.category,
        odoo_feature: subtask.odoo_feature
      });
    }
  }

  return flatTasks;
}

/**
 * Team member roles mapping
 */
const TEAM_MEMBER_ROLES = {
  'Luis Angel Muñoz Zermeño': 'Process Consultant',
  'Jose Ricardo Gomez Duran': 'Process Consultant',
  'Josué Isaías Torres Gonzalez': 'Process Consultant',
  'José De Jesus Ruvalcaba Luna': 'Odoo Developer',
  'Martin Zollneritsch': 'Process Consultant',
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
      const index = (typeof task.id === 'number' ? task.id : 0) % odooDevelopers.length;
      return odooDevelopers[index];
    }
    if (processConsultants.length > 0) {
      const index = (typeof task.id === 'number' ? task.id : 0) % processConsultants.length;
      return processConsultants[index];
    }
  }

  // Clarity and Adoption phase tasks go to Process Consultant
  if (phase === 'Clarity' || phase === 'Adoption') {
    if (processConsultants.length > 0) {
      const index = (typeof task.id === 'number' ? task.id : 0) % processConsultants.length;
      return processConsultants[index];
    }
    if (odooDevelopers.length > 0) {
      return odooDevelopers[0];
    }
  }

  // Default: distribute among all team members
  const index = (typeof task.id === 'number' ? task.id : 0) % teamMembers.length;
  return teamMembers[index] || '';
}

export default {
  consolidateTasks
};
