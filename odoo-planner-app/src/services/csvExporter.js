/**
 * CSV Exporter Service
 * Handles export of project, milestones, and tasks to CSV format for Odoo import
 */

import Papa from 'papaparse';
import { addWeeks, addDays, getNextWorkday } from '../utils/dateHelpers';

/**
 * Export project CSV
 * @param {Object} responses - Questionnaire responses
 * @param {Array} deliverables - Consolidated deliverables
 * @returns {void} - Downloads CSV file
 */
export function exportProjectCSV(responses, deliverables) {
  // Calculate total hours from deliverables
  const totalHours = deliverables.reduce((sum, d) => sum + d.allocated_hours, 0);

  const rows = [{
    'Display Name': responses.project_name || '',
    'Customer': responses.client_name || '',
    'Company': '',
    'Project Manager': responses.project_manager || '',
    'Last Update Status': 'Set Status',
    'Status': '',
    'Start Date': responses.project_start_date || '',
    'Expiration Date': responses.project_deadline || '',
    'Allocated Time': totalHours
  }];

  downloadCSV(rows, `${sanitizeFilename(responses.project_name)}_project.csv`);
}

/**
 * Export milestones CSV
 * @param {Object} responses - Questionnaire responses
 * @returns {void} - Downloads CSV file
 */
export function exportMilestonesCSV(responses) {
  const language = responses.language || 'English';
  const isSpanish = language === 'Spanish';
  const milestones = [];
  const projectStartDate = responses.project_start_date || new Date().toISOString().split('T')[0];
  const projectDeadline = responses.project_deadline || addWeeks(projectStartDate, 12);
  let currentDate = projectStartDate;

  // Clarity milestones
  if (responses.clarity_phase) {
    const mappingEnd = addWeeks(currentDate, 2);
    milestones.push({
      name: isSpanish ? 'Mapeo de Procesos' : 'Process Mapping',
      deadline: mappingEnd
    });
    currentDate = mappingEnd;

    const toBeEnd = addWeeks(currentDate, 1);
    milestones.push({
      name: isSpanish ? 'Hallazgos y TO-BE' : 'Findings & TO-BE',
      deadline: toBeEnd
    });
    currentDate = toBeEnd;

    const moiEnd = addWeeks(currentDate, 1);
    milestones.push({
      name: isSpanish ? 'Master de Implementación' : 'Master of Implementation',
      deadline: moiEnd
    });
    currentDate = moiEnd;
  }

  // Implementation milestones (per module) - using module_hours object
  if (responses.implementation_phase) {
    const moduleHours = responses.module_hours || {};
    const selectedModules = Object.keys(moduleHours).filter(mod => moduleHours[mod] > 0);
    const customModules = (responses.custom_modules || []).filter(m => m.name && m.hours > 0);

    // Calculate implementation end date - distribute modules across time
    const implementationEndDate = projectDeadline;

    selectedModules.forEach(moduleName => {
      milestones.push({
        name: isSpanish
          ? `Implementación del Módulo de ${moduleName}`
          : `${moduleName} Module Implementation`,
        deadline: implementationEndDate
      });
    });

    // Custom modules
    customModules.forEach(customMod => {
      milestones.push({
        name: isSpanish
          ? `Implementación del Módulo de ${customMod.name}`
          : `${customMod.name} Module Implementation`,
        deadline: implementationEndDate
      });
    });
  }

  // Adoption milestone - only "Capacitación y Go-Live", NO support months
  if (responses.adoption_phase) {
    milestones.push({
      name: isSpanish ? 'Capacitación y Go-Live' : 'Training & Go-Live',
      deadline: projectDeadline
    });
  }

  // Build CSV rows
  const rows = milestones.map(milestone => ({
    'Project': responses.project_name || '',
    'Milestone': milestone.name,
    'Deadline': milestone.deadline
  }));

  downloadCSV(rows, `${sanitizeFilename(responses.project_name)}_milestones.csv`);
}

/**
 * Get Odoo-compatible tag for a phase
 * @param {string} phase - Phase name (Clarity, Implementation, Adoption)
 * @returns {string} - Odoo tag name
 */
function getOdooTag(phase) {
  switch(phase) {
    case 'Clarity': return 'Process Mapping';
    case 'Implementation': return 'Odoo Implementation';
    case 'Adoption': return 'Soporte';
    default: return 'Odoo Implementation';
  }
}

/**
 * Export tasks CSV with Parent Task hierarchy
 * @param {Object} responses - Questionnaire responses
 * @param {Array} flatTasks - Flat task list (already filtered by hook)
 * @returns {void} - Downloads CSV file
 */
export function exportTasksCSV(responses, flatTasks) {
  // flatTasks is already filtered (deleted tasks removed) by useProjectPlan hook
  // Build CSV data with Parent Task relationships
  const csvData = flatTasks.map(task => {
    // Use Odoo-compatible tags only
    const tag = getOdooTag(task.phase);

    return {
      'Title': task.title,
      'Project': responses.project_name || '',
      'Assignees': task.assignee || '',
      'Allocated Time': task.allocated_hours,
      'Stage': 'Backlog',
      'Priority': task.priority === 'High' ? 'High priority' :
                  task.priority === 'Medium' ? 'Medium priority' : 'Low priority',
      'Tags': tag,
      'Parent Task': task.parent_task || '', // Key field for hierarchy
      'Description': task.description || ''
    };
  });

  downloadCSV(csvData, `${sanitizeFilename(responses.project_name)}_tasks.csv`);
}

/**
 * Export all CSVs (project, milestones, tasks)
 * @param {Object} responses - Questionnaire responses
 * @param {Array} deliverables - Consolidated deliverables (already filtered)
 * @param {Array} flatTasks - Flat task list (already filtered)
 */
export function exportAll(responses, deliverables, flatTasks) {
  exportProjectCSV(responses, deliverables);
  setTimeout(() => exportMilestonesCSV(responses), 500);
  setTimeout(() => exportTasksCSV(responses, flatTasks), 1000);
}

/**
 * Export deliverables only (no subtasks)
 * @param {Object} responses - Questionnaire responses
 * @param {Array} flatTasks - Flat task list (already filtered)
 */
export function exportDeliverablesOnlyCSV(responses, flatTasks) {
  // Filter to deliverables only (flatTasks already has deleted tasks removed)
  const deliverables = flatTasks.filter(task => task.task_type === 'deliverable');

  const csvData = deliverables.map(task => ({
    'Title': task.title,
    'Project': responses.project_name || '',
    'Assignees': task.assignee || '',
    'Allocated Time': task.allocated_hours,
    'Stage': 'Backlog',
    'Priority': task.priority === 'High' ? 'High priority' :
                task.priority === 'Medium' ? 'Medium priority' : 'Low priority',
    'Tags': getOdooTag(task.phase),
    'Parent Task': '',
    'Description': task.description || ''
  }));

  downloadCSV(csvData, `${sanitizeFilename(responses.project_name)}_deliverables.csv`);
}

/**
 * Download CSV helper
 * @param {Array} data - Array of row objects
 * @param {string} filename - Output filename
 */
function downloadCSV(data, filename) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Sanitize filename
 * @param {string} name - Raw filename
 * @returns {string} - Sanitized filename
 */
function sanitizeFilename(name) {
  if (!name) return 'project';
  return name.replace(/[^a-z0-9]/gi, '_').replace(/_+/g, '_');
}

export default {
  exportProjectCSV,
  exportMilestonesCSV,
  exportTasksCSV,
  exportAll,
  exportDeliverablesOnlyCSV
};
