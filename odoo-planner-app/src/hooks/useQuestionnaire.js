/**
 * useQuestionnaire Hook
 * Manages questionnaire form state, navigation, and template application
 * V3.1 - Hours per module, simplified adoption fields
 */

import { useState, useCallback, useMemo } from 'react';
import questionnaireStructure from '../data/questionnaire-structure.json';
import projectTemplates from '../data/project-templates.json';

/**
 * Initial response state with defaults
 */
const getInitialResponses = () => ({
  // Project basics
  project_name: '',
  client_name: '',
  language: 'English',
  project_manager: '',
  team_members: [],
  project_start_date: new Date().toISOString().split('T')[0],
  project_deadline: '',

  // Phases
  clarity_phase: true,
  clarity_hours: 40,
  implementation_phase: true,
  adoption_phase: true,

  // Adoption fields
  training_hours: 24,
  go_live_hours: 8,
  support_hours_per_month: 10,
  support_months: 2,

  // Module hours (object keyed by module name)
  module_hours: {},

  // Custom modules (array of objects)
  custom_modules: [],

  // Implementation details
  integrations: 'No',
  integration_list: '',
  multi_warehouse: 'No',
  warehouse_count: 2,

  // Template
  selected_template: null
});

export function useQuestionnaire() {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState(getInitialResponses());
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  /**
   * Get visible sections based on conditional logic
   * V3.3 - Simplified since phase configuration is now consolidated
   */
  const visibleSections = useMemo(() => {
    return questionnaireStructure.sections.filter(section => {
      // All sections without conditionals are visible
      if (!section.conditional) return true;

      const conditional = section.conditional;

      // Handle legacy conditionals (for backward compatibility)
      if (conditional === 'implementation_phase === true') {
        return responses.implementation_phase === true;
      }
      if (conditional === 'clarity_phase === true') {
        return responses.clarity_phase === true;
      }
      if (conditional === 'adoption_phase === true') {
        return responses.adoption_phase === true;
      }

      return true;
    });
  }, [responses.implementation_phase, responses.clarity_phase, responses.adoption_phase]);

  /**
   * Check if a question should be visible
   */
  const isQuestionVisible = useCallback((question) => {
    if (!question.conditional) return true;

    const conditional = question.conditional;

    // Handle common conditionals
    if (conditional === 'clarity_phase === true') {
      return responses.clarity_phase === true;
    }
    if (conditional === 'implementation_phase === true') {
      return responses.implementation_phase === true;
    }
    if (conditional === 'adoption_phase === true') {
      return responses.adoption_phase === true;
    }
    if (conditional === "integrations === 'Yes'") {
      return responses.integrations === 'Yes';
    }
    if (conditional === "multi_warehouse === 'Yes'") {
      return responses.multi_warehouse === 'Yes';
    }
    // Multi-warehouse only shows if Inventory module is selected
    if (conditional === "modules.includes('Inventory')") {
      const selectedModules = Object.keys(responses.module_hours || {}).filter(
        mod => (responses.module_hours[mod] || 0) > 0
      );
      return selectedModules.some(m => m.toLowerCase().includes('inventory'));
    }

    // Generic conditional parsing
    try {
      const match = conditional.match(/(\w+)\s*(===|!==|>=|<=|>|<)\s*(.+)/);
      if (match) {
        const [, field, operator, value] = match;
        const fieldValue = responses[field];
        const compareValue = value.replace(/['"]/g, '');

        switch (operator) {
          case '===': return String(fieldValue) === compareValue || fieldValue === (compareValue === 'true');
          case '!==': return String(fieldValue) !== compareValue && fieldValue !== (compareValue === 'true');
          case '>=': return Number(fieldValue) >= Number(compareValue);
          case '<=': return Number(fieldValue) <= Number(compareValue);
          case '>': return Number(fieldValue) > Number(compareValue);
          case '<': return Number(fieldValue) < Number(compareValue);
          default: return true;
        }
      }
    } catch (e) {
      console.warn('Failed to parse conditional:', conditional);
    }

    return true;
  }, [responses]);

  /**
   * Update a single response value
   */
  const updateResponse = useCallback((questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  }, []);

  /**
   * Get selected modules
   */
  const selectedModules = useMemo(() => {
    return Object.keys(responses.module_hours || {}).filter(
      mod => responses.module_hours[mod] > 0
    );
  }, [responses.module_hours]);

  /**
   * Toggle a module selection
   */
  const toggleModule = useCallback((module) => {
    setResponses(prev => {
      const currentHours = prev.module_hours || {};
      if (currentHours[module]) {
        // Remove module
        const { [module]: removed, ...rest } = currentHours;
        return { ...prev, module_hours: rest };
      } else {
        // Add module with default 20 hours
        return {
          ...prev,
          module_hours: { ...currentHours, [module]: 20 }
        };
      }
    });
  }, []);

  /**
   * Update hours for a specific module
   */
  const updateModuleHours = useCallback((module, hours) => {
    setResponses(prev => ({
      ...prev,
      module_hours: {
        ...prev.module_hours,
        [module]: hours
      }
    }));
  }, []);

  /**
   * Add a custom module
   */
  const addCustomModule = useCallback(() => {
    setResponses(prev => ({
      ...prev,
      custom_modules: [
        ...(prev.custom_modules || []),
        { name: '', description: '', hours: 20 }
      ]
    }));
  }, []);

  /**
   * Remove a custom module
   */
  const removeCustomModule = useCallback((index) => {
    setResponses(prev => ({
      ...prev,
      custom_modules: prev.custom_modules.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * Update a custom module field
   */
  const updateCustomModule = useCallback((index, field, value) => {
    setResponses(prev => ({
      ...prev,
      custom_modules: prev.custom_modules.map((mod, i) =>
        i === index ? { ...mod, [field]: value } : mod
      )
    }));
  }, []);

  /**
   * Apply a project template
   */
  const applyTemplate = useCallback((templateId) => {
    const template = projectTemplates.templates.find(t => t.id === templateId);

    // Custom template: reset all hours to 0
    if (templateId === 'custom') {
      setSelectedTemplate('custom');
      setResponses(prev => ({
        ...prev,
        selected_template: 'custom',
        // Reset phases to unchecked with 0 hours
        clarity_phase: false,
        clarity_hours: 0,
        implementation_phase: false,
        adoption_phase: false,
        // Reset adoption fields
        training_hours: 0,
        go_live_hours: 0,
        support_hours_per_month: 0,
        support_months: 0,
        // Clear modules
        module_hours: {},
        custom_modules: [],
        // Reset features
        integrations: 'No',
        multi_warehouse: 'No',
        warehouse_count: 2
      }));
      return;
    }

    if (!template) {
      setSelectedTemplate(null);
      return;
    }

    setSelectedTemplate(templateId);

    // Build module_hours object from template modules
    const moduleHours = {};
    const defaultHoursPerModule = Math.round(
      (template.phases?.implementation?.hours || 120) / (template.modules?.length || 5)
    );
    (template.modules || []).forEach(mod => {
      moduleHours[mod] = defaultHoursPerModule;
    });

    setResponses(prev => ({
      ...prev,
      selected_template: templateId,
      // Phases
      clarity_phase: template.phases?.clarity?.enabled ?? true,
      clarity_hours: template.phases?.clarity?.hours || 40,
      implementation_phase: template.phases?.implementation?.enabled ?? true,
      adoption_phase: template.phases?.adoption?.enabled ?? true,
      // Adoption (simplified)
      training_hours: template.training_hours || 24,
      go_live_hours: 8,
      support_hours_per_month: template.support_hours_per_month || 10,
      support_months: template.support_months || 2,
      // Modules with individual hours
      module_hours: moduleHours,
      // Custom modules as array
      custom_modules: [],
      // Features
      integrations: template.features?.integrations ? 'Yes' : 'No',
      multi_warehouse: template.features?.multi_warehouse ? 'Yes' : 'No',
      warehouse_count: template.features?.warehouse_count || 2
    }));
  }, []);

  /**
   * Navigation
   */
  const goToNextSection = useCallback(() => {
    if (currentSection < visibleSections.length - 1) {
      setCurrentSection(prev => prev + 1);
    }
  }, [currentSection, visibleSections.length]);

  const goToPreviousSection = useCallback(() => {
    if (currentSection > 0) {
      setCurrentSection(prev => prev - 1);
    }
  }, [currentSection]);

  const goToSection = useCallback((index) => {
    if (index >= 0 && index < visibleSections.length) {
      setCurrentSection(index);
    }
  }, [visibleSections.length]);

  /**
   * Reset questionnaire
   */
  const reset = useCallback(() => {
    setResponses(getInitialResponses());
    setCurrentSection(0);
    setSelectedTemplate(null);
  }, []);

  /**
   * Calculate implementation hours (sum of all module hours)
   */
  const implementationHours = useMemo(() => {
    const standardHours = Object.values(responses.module_hours || {}).reduce(
      (sum, h) => sum + (parseFloat(h) || 0), 0
    );
    const customHours = (responses.custom_modules || []).reduce(
      (sum, mod) => sum + (parseFloat(mod.hours) || 0), 0
    );
    return standardHours + customHours;
  }, [responses.module_hours, responses.custom_modules]);

  /**
   * Calculate adoption hours
   */
  const adoptionHours = useMemo(() => {
    if (!responses.adoption_phase) return 0;
    const training = parseFloat(responses.training_hours) || 0;
    const goLive = parseFloat(responses.go_live_hours) || 0;
    const support = (parseFloat(responses.support_hours_per_month) || 0) *
                    (parseInt(responses.support_months) || 0);
    return training + goLive + support;
  }, [responses.adoption_phase, responses.training_hours, responses.go_live_hours, responses.support_hours_per_month, responses.support_months]);

  /**
   * Calculate total hours
   */
  const totalHours = useMemo(() => {
    let total = 0;
    if (responses.clarity_phase) {
      total += parseFloat(responses.clarity_hours) || 0;
    }
    if (responses.implementation_phase) {
      total += implementationHours;
    }
    if (responses.adoption_phase) {
      total += adoptionHours;
    }
    return total;
  }, [responses.clarity_phase, responses.clarity_hours, responses.implementation_phase, implementationHours, responses.adoption_phase, adoptionHours]);

  /**
   * Check if ready to generate
   */
  const canGenerate = useMemo(() => {
    return (
      responses.project_name &&
      responses.client_name &&
      responses.project_deadline &&
      (responses.clarity_phase || responses.implementation_phase || responses.adoption_phase)
    );
  }, [responses]);

  return {
    // State
    currentSection,
    responses,
    selectedTemplate,
    visibleSections,
    totalHours,
    implementationHours,
    adoptionHours,
    canGenerate,
    selectedModules,

    // Sections data
    sections: questionnaireStructure.sections,
    currentSectionData: visibleSections[currentSection],

    // Templates
    templates: projectTemplates.templates,
    availableModules: projectTemplates.available_modules,

    // Actions
    updateResponse,
    toggleModule,
    updateModuleHours,
    addCustomModule,
    removeCustomModule,
    updateCustomModule,
    applyTemplate,
    goToNextSection,
    goToPreviousSection,
    goToSection,
    reset,
    isQuestionVisible
  };
}

export default useQuestionnaire;
