import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Download, RefreshCw, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';

// Import task library and questionnaire structure
import taskLibrary from '../../task-library.json';
import questionnaireStructure from '../../questionnaire-structure.json';

// Import improved phase structures
import clarityPhaseImproved from '../../task-library-updates/clarity-phase-improved.json';
import adoptionPhaseImproved from '../../task-library-updates/adoption-phase-improved.json';
import customDevTemplate from '../../task-library-updates/custom-development-template.json';

// Import AI customization service
import { generateCustomTasks } from './services/aiCustomization.js';

function App() {
  const [step, setStep] = useState('welcome'); // welcome, questionnaire, review, plan, export
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState({});
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showAllModules, setShowAllModules] = useState(false);

  // Get visible sections based on previous answers
  const getVisibleSections = () => {
    return questionnaireStructure.sections.filter(section => {
      if (!section.conditional) return true;

      // Check conditional logic
      if (section.conditional === 'phases_included') {
        return responses.clarity_phase || responses.implementation_phase || responses.adoption_phase;
      }
      if (section.conditional === 'clarity_phase === true') {
        return responses.clarity_phase === true;
      }
      if (section.conditional === 'implementation_phase === true') {
        return responses.implementation_phase === true;
      }
      if (section.conditional === 'adoption_phase === true') {
        return responses.adoption_phase === true;
      }

      return true;
    });
  };

  const visibleSections = getVisibleSections();
  const currentSectionData = visibleSections[currentSection];

  // Check if question should be visible
  const isQuestionVisible = (question) => {
    if (!question.conditional) return true;

    // Parse and evaluate conditional
    const condition = question.conditional;

    // Handle >= operator
    if (condition.includes('>=')) {
      const [field, value] = condition.split('>=').map(s => s.trim());
      const fieldValue = parseInt(responses[field]) || 0;
      const compareValue = parseInt(value);
      return fieldValue >= compareValue;
    }

    // Handle <= operator
    if (condition.includes('<=')) {
      const [field, value] = condition.split('<=').map(s => s.trim());
      const fieldValue = parseInt(responses[field]) || 0;
      const compareValue = parseInt(value);
      return fieldValue <= compareValue;
    }

    // Handle > operator
    if (condition.includes('>') && !condition.includes('>=')) {
      const [field, value] = condition.split('>').map(s => s.trim());
      const fieldValue = parseInt(responses[field]) || 0;
      const compareValue = parseInt(value);
      return fieldValue > compareValue;
    }

    // Handle < operator
    if (condition.includes('<') && !condition.includes('<=')) {
      const [field, value] = condition.split('<').map(s => s.trim());
      const fieldValue = parseInt(responses[field]) || 0;
      const compareValue = parseInt(value);
      return fieldValue < compareValue;
    }

    // Handle === operator
    if (condition.includes('===')) {
      const [field, value] = condition.split('===').map(s => s.trim());
      const cleanValue = value.replace(/['"]/g, '');
      return responses[field] === cleanValue || responses[field] === (cleanValue === 'true');
    }

    // Handle !== operator
    if (condition.includes('!==')) {
      const [field, value] = condition.split('!==').map(s => s.trim());
      const cleanValue = value.replace(/['"]/g, '');
      return responses[field] !== cleanValue && responses[field] !== (cleanValue === 'true');
    }

    // Handle includes operator
    if (condition.includes('includes')) {
      const match = condition.match(/(\w+)\s*\.?\s*includes\s*\(['"](.+)['"]\)/);
      if (match) {
        const [, field, value] = match;
        return responses[field]?.includes(value);
      }
    }

    return true;
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleModuleToggle = (module) => {
    setResponses(prev => ({
      ...prev,
      modules: prev.modules?.includes(module)
        ? prev.modules.filter(m => m !== module)
        : [...(prev.modules || []), module]
    }));
  };

  const handleNext = () => {
    if (currentSection < visibleSections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      setStep('review');
    }
  };

  const handlePrevious = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  // Helper function to add days to a date and format for Odoo
  const addDays = (dateString, days) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  // Helper function to add weeks to a date
  const addWeeks = (dateString, weeks) => {
    return addDays(dateString, weeks * 7);
  };

  const generateProjectPlan = async () => {
    setIsGenerating(true);

    try {
      const plan = {
        project_info: {
          name: responses.project_name,
          client: responses.client_name,
          manager: responses.project_manager,
          timeline: responses.timeline,
          go_live_date: responses.go_live_date
        },
        tasks: []
      };

      let taskId = 1;
      const projectStartDate = responses.project_start_date || new Date().toISOString().split('T')[0];

      // Helper function to intelligently assign tasks to team members based on role tags
      const assignTaskToTeamMember = (taskTags, taskPhase) => {
        const teamMembers = responses.team_members || [];
        const processConsultants = teamMembers.filter(member =>
          member === 'Luis Muñoz' || member === 'Ricardo Gomez' ||
          member === 'Andres Solorzano' || member === 'Josue Torres'
        );
        const odooDeveloper = teamMembers.find(member => member === 'Jose Ruvalcaba');

        // Check task tags for role requirements
        const needsOdooDeveloper = taskTags.some(tag => tag === 'Odoo Developer');
        const needsProcessConsultant = taskTags.some(tag => tag === 'Process Consultant');

        // Assign based on role requirements
        if (needsOdooDeveloper && odooDeveloper) {
          return odooDeveloper;
        } else if (needsProcessConsultant && processConsultants.length > 0) {
          // Rotate through process consultants (simple round-robin by task ID)
          return processConsultants[taskId % processConsultants.length];
        } else if (processConsultants.length > 0) {
          // Default to process consultant if available
          return processConsultants[0];
        }

        // Fallback to project manager
        return responses.project_manager || '';
      };

      // Calculate phase end dates for sequencing
      const clarityEndDate = addWeeks(projectStartDate, 4); // 4 weeks for Clarity

      // Add Clarity Phase tasks (using improved structure)
      if (responses.clarity_phase) {
        const clarityHours = parseFloat(responses.clarity_hours || 0);
        const clarityTasks = clarityPhaseImproved.clarity_phase.standard_tasks;
        const totalEstimatedHours = clarityTasks.reduce((sum, t) => sum + t.estimated_hours, 0);

        // Reserve 30% of Clarity budget for AI tasks (if AI enabled), 70% for templates
        const aiReservedPercent = responses.enable_ai_customization !== false ? 0.30 : 0;
        const templateBudget = clarityHours * (1 - aiReservedPercent);
        const hourMultiplier = clarityHours > 0 ? templateBudget / totalEstimatedHours : 1;
        const language = responses.language || 'English';

        clarityTasks.forEach(task => {
          // Calculate start and due dates based on week
          const weekStart = addWeeks(projectStartDate, task.week - 1);
          const weekEnd = addWeeks(projectStartDate, task.week);

          // Assign proper milestone name based on week and deliverable structure
          let milestoneName;
          if (task.week <= 2) {
            milestoneName = language === 'Spanish' ? 'Mapeo de Procesos' : 'Process Mapping';
          } else if (task.week === 3) {
            milestoneName = language === 'Spanish' ? 'Hallazgos, Oportunidades y TO-BE' : 'Findings, Opportunities & TO-BE';
          } else { // week 4
            milestoneName = 'Master of Implementation';
          }

          plan.tasks.push({
            id: taskId++,
            title: language === 'Spanish' ? task.name_es : task.name,
            description: language === 'Spanish' ? task.description_es : task.description,
            allocated_hours: Math.round(task.estimated_hours * hourMultiplier), // FIXED: No more decimals
            priority: task.priority,
            category: task.category,
            tags: task.tags,
            phase: 'Clarity',
            assignee: assignTaskToTeamMember(task.tags, 'Clarity'),
            stage: 'New',
            start_date: weekStart,
            deadline: weekEnd,
            milestone: milestoneName,
            parent_task: '',
            task_type: task.task_type || 'native',
            week: task.week
          });
        });
      }

      // Add Implementation Phase tasks
      if (responses.implementation_phase && responses.modules?.length > 0) {
        // Calculate Implementation hours from breakdown (modules + custom + migration)
        const moduleFields = [
          'module_crm_hours', 'module_sales_hours', 'module_purchase_hours',
          'module_inventory_hours', 'module_accounting_hours', 'module_projects_hours',
          'module_fsm_hours', 'module_expenses_hours', 'module_manufacturing_hours',
          'module_ecommerce_hours', 'module_pos_hours', 'module_hr_hours',
          'module_payroll_hours', 'module_helpdesk_hours'
        ];

        let moduleHoursTotal = 0;
        moduleFields.forEach(field => {
          moduleHoursTotal += parseFloat(responses[field]) || 0;
        });

        let customHoursTotal = 0;
        const customCount = parseInt(responses.custom_modules_count) || 0;
        for (let i = 1; i <= customCount; i++) {
          customHoursTotal += parseFloat(responses[`custom_module_${i}_hours`]) || 0;
        }

        const migrationHoursTotal = parseFloat(responses.migration_hours) || 0;
        const implementationHours = moduleHoursTotal + customHoursTotal + migrationHoursTotal;

        const selectedModules = responses.modules;
        const language = responses.language || 'English';

        // Calculate custom development hours
        let customDevHours = 0;
        const customModulesCount = parseInt(responses.custom_modules_count) || 0;

        if (customModulesCount > 0) {
          // Sum up hours from all custom modules
          for (let i = 1; i <= customModulesCount; i++) {
            const moduleHours = parseFloat(responses[`custom_module_${i}_hours`]) || 0;
            customDevHours += moduleHours;
          }

          // If no hours specified, reserve 50% of implementation for custom dev
          if (customDevHours === 0 && responses.enable_ai_customization) {
            customDevHours = implementationHours * 0.5;
          }
        } else if (!responses.enable_ai_customization && responses.customizations === 'Yes') {
          // Fallback to old hardcoded template (if AI disabled and no custom modules specified)
          const customTasks = customDevTemplate.custom_development.tasks;
          const customizationScope = responses.customization_scope || '';

          customTasks.forEach(task => {
            let hours = task.estimated_hours;
            if (task.adjustable && customizationScope.length > 100) {
              hours = Math.min(80, Math.max(20, Math.round(customizationScope.length / 5)));
            }
            customDevHours += hours;
          });
        }

        // Add migration hours if specified
        let migrationHours = 0;
        if (responses.data_migration && responses.data_migration !== 'No') {
          migrationHours = parseFloat(responses.migration_hours) || 0;
        }

        // Reserve hours for custom development and migration, distribute rest to modules
        const hoursForModules = Math.max(0, implementationHours - customDevHours - migrationHours);

        // Calculate implementation duration (assume 40h/week per FTE)
        const implementationWeeks = Math.ceil(implementationHours / 40);
        const implementationEndDate = addWeeks(clarityEndDate, implementationWeeks);

        let currentImplDate = clarityEndDate;
        const daysPerTask = Math.ceil((implementationWeeks * 7) / (selectedModules.length * 5)); // Rough estimate

        selectedModules.forEach((moduleName, moduleIndex) => {
          const moduleData = taskLibrary.modules[moduleName];
          if (!moduleData) return;

          const moduleTasks = moduleData.implementation_tasks;
          const totalEstimatedHours = moduleTasks.reduce((sum, t) => sum + t.estimated_hours, 0);

          // Get module-specific hours from allocation fields
          const moduleHourMap = {
            'CRM': responses.module_crm_hours,
            'Sales': responses.module_sales_hours,
            'Purchase': responses.module_purchase_hours,
            'Inventory': responses.module_inventory_hours,
            'Accounting': responses.module_accounting_hours,
            'Projects': responses.module_projects_hours,
            'FSM': responses.module_fsm_hours,
            'Expenses': responses.module_expenses_hours,
            'Manufacturing': responses.module_manufacturing_hours,
            'eCommerce': responses.module_ecommerce_hours,
            'POS': responses.module_pos_hours,
            'HR': responses.module_hr_hours,
            'Payroll': responses.module_payroll_hours,
            'Helpdesk': responses.module_helpdesk_hours
          };

          // Use allocated hours if specified, otherwise distribute evenly
          let moduleHours = parseFloat(moduleHourMap[moduleName]);
          if (!moduleHours || moduleHours === 0) {
            // If no hours allocated for this module, distribute remaining hours evenly
            moduleHours = hoursForModules / selectedModules.length;
          }

          const hourMultiplier = moduleHours > 0 ? moduleHours / totalEstimatedHours : 1;

          moduleTasks.forEach((task, taskIndex) => {
            const taskStart = currentImplDate;
            const taskDuration = Math.max(7, Math.ceil((task.estimated_hours * hourMultiplier) / 8)); // Days (8h/day)
            const taskEnd = addDays(taskStart, taskDuration);

            plan.tasks.push({
              id: taskId++,
              title: task.name,
              description: task.description,
              allocated_hours: Math.round(task.estimated_hours * hourMultiplier), // FIXED: No more decimals
              priority: task.priority,
              category: task.category,
              tags: task.tags,
              phase: 'Implementation',
              module: moduleName,
              assignee: assignTaskToTeamMember(task.tags, 'Implementation'),
              stage: 'New',
              start_date: taskStart,
              deadline: taskEnd,
              milestone: `${moduleName} Implementation`,
              parent_task: '',
              odoo_feature: task.odoo_feature || '',
              task_type: 'native'
            });

            // Advance date for next task (but not too aggressively)
            if (taskIndex % 2 === 0) {
              currentImplDate = addDays(currentImplDate, Math.ceil(taskDuration / 2));
            }
          });
        });

        // Add Custom Development tasks if customizations are required
        // ONLY if AI customization is disabled (otherwise AI generates custom tasks)
        if (responses.customizations === 'Yes' && responses.enable_ai_customization === false) {
          console.log('📦 Using hardcoded custom development template (AI disabled)');
          const customTasks = customDevTemplate.custom_development.tasks;
          const customizationScope = responses.customization_scope || '';
          let customDevDate = currentImplDate;

          customTasks.forEach(task => {
            // Adjust hours for main development task based on scope
            let hours = task.estimated_hours;
            if (task.adjustable && customizationScope.length > 100) {
              // Estimate based on complexity (simple heuristic)
              hours = Math.min(80, Math.max(20, Math.round(customizationScope.length / 5)));
            }

            const taskDuration = Math.max(7, Math.ceil(hours / 8)); // Days (8h/day)
            const taskEnd = addDays(customDevDate, taskDuration);

            plan.tasks.push({
              id: taskId++,
              title: language === 'Spanish' ? task.name_es : task.name,
              description: language === 'Spanish' ? task.description_es : task.description,
              allocated_hours: Math.round(hours), // Whole numbers only
              priority: task.priority,
              category: task.category,
              tags: task.tags,
              phase: 'Implementation',
              module: 'Custom Development',
              assignee: assignTaskToTeamMember(task.tags, 'Implementation'),
              stage: 'New',
              start_date: customDevDate,
              deadline: taskEnd,
              milestone: 'Custom Development',
              parent_task: '',
              task_type: 'custom' // Mark as custom
            });

            customDevDate = taskEnd; // Sequence custom tasks
          });
        } else if (responses.customizations === 'Yes') {
          console.log('🤖 Skipping hardcoded custom dev template (AI will generate custom tasks)');
        }
      }

      // Add Adoption Phase tasks (using improved structure)
      if (responses.adoption_phase) {
        // Calculate Adoption hours from breakdown (training + support)
        const trainingHours = parseFloat(responses.training_hours) || 0;
        const supportPerMonth = parseFloat(responses.support_hours_per_month) || 0;
        const adoptionDurationMonths = parseInt(responses.adoption_duration_months || 2);
        const adoptionHours = trainingHours + (supportPerMonth * adoptionDurationMonths);
        const language = responses.language || 'English';

        // Adoption starts 2 weeks before implementation ends (for training prep)
        // Calculate Implementation hours from breakdown for timing purposes
        const moduleFields = [
          'module_crm_hours', 'module_sales_hours', 'module_purchase_hours',
          'module_inventory_hours', 'module_accounting_hours', 'module_projects_hours',
          'module_fsm_hours', 'module_expenses_hours', 'module_manufacturing_hours',
          'module_ecommerce_hours', 'module_pos_hours', 'module_hr_hours',
          'module_payroll_hours', 'module_helpdesk_hours'
        ];
        let implementationHoursForTiming = 0;
        moduleFields.forEach(field => {
          implementationHoursForTiming += parseFloat(responses[field]) || 0;
        });
        const customCount = parseInt(responses.custom_modules_count) || 0;
        for (let i = 1; i <= customCount; i++) {
          implementationHoursForTiming += parseFloat(responses[`custom_module_${i}_hours`]) || 0;
        }
        implementationHoursForTiming += parseFloat(responses.migration_hours) || 0;

        const implementationWeeks = Math.ceil(implementationHoursForTiming / 40);
        const implementationEndDate = addWeeks(clarityEndDate, implementationWeeks);
        const adoptionStartDate = addWeeks(implementationEndDate, -2); // Start 2 weeks before go-live
        const goLiveDate = implementationEndDate;

        // Add core adoption tasks
        const coreTasks = adoptionPhaseImproved.adoption_phase.standard_tasks;
        const coreTasksEstimatedHours = coreTasks.reduce((sum, t) => sum + t.estimated_hours, 0);

        // Reserve 50% of Adoption budget for AI tasks (if AI enabled), 50% for templates + support
        const adoptionAiReservedPercent = responses.enable_ai_customization !== false ? 0.50 : 0;
        const adoptionTemplateBudget = adoptionHours * (1 - adoptionAiReservedPercent);

        // Scale core tasks to fit within template budget (leaving room for monthly support)
        const coreTasksTargetHours = adoptionTemplateBudget * 0.4; // 40% for core tasks
        const adoptionHourMultiplier = coreTasksEstimatedHours > 0 ? coreTasksTargetHours / coreTasksEstimatedHours : 1;
        let adoptionDate = adoptionStartDate;

        coreTasks.forEach((task, index) => {
          const scaledHours = Math.round(task.estimated_hours * adoptionHourMultiplier);
          const taskDuration = Math.max(7, Math.ceil(scaledHours / 8)); // Days
          const taskEnd = addDays(adoptionDate, taskDuration);

          plan.tasks.push({
            id: taskId++,
            title: language === 'Spanish' ? task.name_es : task.name,
            description: language === 'Spanish' ? task.description_es : task.description,
            allocated_hours: scaledHours,
            priority: task.priority,
            category: task.category,
            tags: task.tags,
            phase: 'Adoption',
            assignee: assignTaskToTeamMember(task.tags, 'Adoption'),
            stage: 'New',
            start_date: adoptionDate,
            deadline: taskEnd,
            milestone: 'Adoption Phase',
            parent_task: '',
            task_type: task.task_type || 'native'
          });

          // Space out tasks, but keep go-live tasks near go-live date
          if (index < coreTasks.length - 3) {
            adoptionDate = addDays(adoptionDate, Math.ceil(taskDuration / 2));
          } else {
            adoptionDate = taskEnd;
          }
        });

        // Add dynamic monthly support tasks - use remaining template budget (60% of template budget)
        const coreTasksActualHours = coreTasksTargetHours;
        const remainingHours = adoptionTemplateBudget - coreTasksActualHours;
        if (remainingHours > 0 && adoptionDurationMonths > 0) {
          const monthlyHours = Math.round(remainingHours / adoptionDurationMonths);

          for (let month = 1; month <= adoptionDurationMonths; month++) {
            const monthStart = addWeeks(goLiveDate, (month - 1) * 4);
            const monthEnd = addWeeks(goLiveDate, month * 4);

            plan.tasks.push({
              id: taskId++,
              title: language === 'Spanish'
                ? `Soporte Continuo - Mes ${month}`
                : `Ongoing Support - Month ${month}`,
              description: language === 'Spanish'
                ? `Proporcionar soporte continuo, capacitación y asistencia a usuarios durante el mes ${month}. Incluye resolución de dudas, ajustes menores y actualización de la base de conocimiento.`
                : `Provide ongoing support, training, and assistance to users during month ${month}. Includes answering questions, minor adjustments, and knowledge base updates.`,
              allocated_hours: monthlyHours,
              priority: 'Medium',
              category: 'Ongoing Support',
              tags: ['Adoption', 'Support', `Month ${month}`],
              phase: 'Adoption',
              assignee: assignTaskToTeamMember(['Adoption', 'Support', `Month ${month}`], 'Adoption'),
              stage: 'New',
              start_date: monthStart,
              deadline: monthEnd,
              milestone: `Adoption - Month ${month}`,
              parent_task: '',
              task_type: 'native'
            });
          }
        }
      }

      // Generate AI-customized tasks if enabled
      if (responses.enable_ai_customization !== false) {
        console.log('🤖 AI Customization is ENABLED');
        console.log('📝 Checking for API keys...');
        console.log('Claude Key:', import.meta.env.VITE_CLAUDE_API_KEY ? '✅ Found' : '❌ Not found');
        console.log('OpenAI Key:', import.meta.env.VITE_OPENAI_API_KEY ? '✅ Found' : '❌ Not found');

        try {
          const aiTasksPromises = [];

          // Generate AI tasks for each enabled phase
          if (responses.clarity_phase) {
            console.log('🔄 Requesting AI tasks for Clarity phase...');
            aiTasksPromises.push(generateCustomTasks(responses, 'clarity'));
          }
          if (responses.implementation_phase) {
            console.log('🔄 Requesting AI tasks for Implementation phase...');
            aiTasksPromises.push(generateCustomTasks(responses, 'implementation'));
          }
          if (responses.adoption_phase) {
            console.log('🔄 Requesting AI tasks for Adoption phase...');
            aiTasksPromises.push(generateCustomTasks(responses, 'adoption'));
          }

          // Wait for all AI tasks to be generated
          console.log('⏳ Waiting for AI responses...');
          const aiTasksResults = await Promise.all(aiTasksPromises);
          console.log('✅ AI responses received:', aiTasksResults);

          // Add AI tasks to plan
          let totalAITasks = 0;
          aiTasksResults.forEach(aiTasks => {
            if (aiTasks && aiTasks.length > 0) {
              console.log(`✅ Adding ${aiTasks.length} AI tasks for phase:`, aiTasks[0]?.phase);
              aiTasks.forEach(task => {
                // Determine milestone based on custom module or phase
                let milestone = `${task.phase} Phase - AI Customized`;
                if (task.custom_module) {
                  const language = responses.language || 'English';
                  milestone = language === 'Spanish'
                    ? `Implementación de ${task.custom_module}`
                    : `Implementation of ${task.custom_module}`;
                }

                plan.tasks.push({
                  id: taskId++,
                  title: task.name,
                  description: task.description || '',
                  allocated_hours: Math.round(task.estimated_hours),
                  priority: task.priority || 'Medium',
                  category: task.category || 'AI Generated',
                  tags: task.tags || [task.phase],
                  phase: task.phase,
                  module: task.custom_module || '',
                  assignee: assignTaskToTeamMember(task.tags || [task.phase], task.phase),
                  stage: 'New',
                  start_date: '',
                  deadline: '',
                  milestone: milestone,
                  parent_task: '',
                  task_type: 'ai_generated'
                });
                totalAITasks++;
              });
            }
          });

          if (totalAITasks > 0) {
            console.log(`✅ SUCCESS: Added ${totalAITasks} AI-customized tasks!`);
            alert(`✅ AI Customization: Generated ${totalAITasks} context-specific tasks!`);
          } else {
            console.warn('⚠️ WARNING: No AI tasks were generated. Check API key configuration.');
            alert('⚠️ AI Customization: No tasks generated. Check console for details.\n\nUsing template tasks only.');
          }
        } catch (error) {
          console.error('❌ ERROR generating AI tasks:', error);
          alert(`❌ AI Error: ${error.message}\n\nFalling back to template tasks only.`);
          // Continue with template tasks even if AI fails
        }
      } else {
        console.log('🚫 AI Customization is DISABLED by user');
      }

      setGeneratedPlan(plan);
      setStep('plan');
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Error generating plan. Please check your inputs and try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToCSV = () => {
    if (!generatedPlan) return;

    // Prepare CSV data in Odoo format
    const csvData = generatedPlan.tasks.map(task => {
      // Add task_type to tags
      let taskTags = Array.isArray(task.tags) ? [...task.tags] : (task.tags ? [task.tags] : []);
      const typeTag = task.task_type === 'custom' ? 'Custom'
                    : task.task_type === 'ai_generated' ? 'AI Generated'
                    : 'Native';
      if (!taskTags.includes(typeTag)) {
        taskTags.push(typeTag);
      }

      return {
        'Title': task.title,
        'Project': responses.project_name,
        'Assignees': task.assignee,
        'Allocated Time': task.allocated_hours,
        'Deadline': task.deadline || '',
        'Stage': 'New',
        'Priority': task.priority === 'High' ? 'High priority' :
                    task.priority === 'Medium' ? 'Medium priority' : 'Low priority',
        'Tags': taskTags.join(','),
        'Milestone': task.milestone || '',
        'Parent Task': task.parent_task || ''
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `${responses.project_name?.replace(/\s+/g, '_')}_tasks.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetPlanner = () => {
    setStep('welcome');
    setCurrentSection(0);
    setResponses({});
    setGeneratedPlan(null);
    setEditMode(false);
  };

  const updateTask = (taskId, field, value) => {
    setGeneratedPlan(prev => ({
      ...prev,
      tasks: prev.tasks.map(task =>
        task.id === taskId ? { ...task, [field]: value } : task
      )
    }));
  };

  const removeTask = (taskId) => {
    setGeneratedPlan(prev => ({
      ...prev,
      tasks: prev.tasks.filter(task => task.id !== taskId)
    }));
  };

  const renderQuestion = (question) => {
    if (!isQuestionVisible(question)) return null;

    const value = responses[question.id];

    switch (question.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            required={question.required}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={4}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            required={question.required}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, parseFloat(e.target.value) || 0)}
            placeholder={question.placeholder}
            min={question.min || 0}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            required={question.required}
          />
        );

      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            required={question.required}
          />
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleResponseChange(question.id, e.target.value)}
            className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            required={question.required}
          >
            <option value="">-- Select --</option>
            {question.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="space-y-2">
            {question.options.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => handleResponseChange(question.id, e.target.value)}
                  className="w-4 h-4 text-purple-600"
                  required={question.required}
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleResponseChange(question.id, e.target.checked)}
              className="w-5 h-5 text-purple-600 rounded"
            />
            <span className="text-sm text-gray-600">{question.help_text}</span>
          </label>
        );

      case 'multiselect':
        const showMoreThreshold = question.show_more_threshold || 999;
        const visibleOptions = showAllModules
          ? question.options
          : question.options.filter((opt, idx) => opt.popular || idx < showMoreThreshold);
        const hasMoreOptions = question.options.length > showMoreThreshold;

        // Check if this is the modules question (for hour allocation)
        const isModulesQuestion = question.id === 'modules';

        return (
          <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
              {visibleOptions.map(option => {
                const optionValue = typeof option === 'string' ? option : option.value;
                const optionLabel = typeof option === 'string' ? option : option.label;
                const optionDesc = typeof option === 'object' ? option.description : null;
                const isSelected = responses.modules?.includes(optionValue);

                // Get the hour field ID for this module
                const hourFieldId = `module_${optionValue.toLowerCase()}_hours`;
                const allocatedHours = responses[hourFieldId] || '';

                return (
                  <div
                    key={optionValue}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => handleModuleToggle(optionValue)}
                      className="w-full text-left"
                    >
                      <div className="font-semibold text-sm">{optionLabel}</div>
                      {optionDesc && (
                        <div className={`text-xs mt-1 ${
                          isSelected ? 'text-purple-100' : 'text-gray-500'
                        }`}>
                          {optionDesc}
                        </div>
                      )}
                    </button>

                    {/* Hour input - only show if module is selected and in implementation phase */}
                    {isModulesQuestion && isSelected && responses.implementation_phase && (
                      <div className="mt-2 pt-2 border-t border-purple-400" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="number"
                          value={allocatedHours}
                          onChange={(e) => handleResponseChange(hourFieldId, e.target.value)}
                          placeholder="Hours"
                          min="0"
                          className="w-full px-2 py-1 text-sm rounded border border-purple-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <div className="text-xs text-purple-100 mt-1">Allocated hours</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {hasMoreOptions && (
              <button
                type="button"
                onClick={() => setShowAllModules(!showAllModules)}
                className="w-full py-2 px-4 text-sm font-semibold text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                {showAllModules ? '▲ Show Less' : `▼ Show More (${question.options.length - visibleOptions.length} more modules)`}
              </button>
            )}
          </div>
        );

      case 'info':
        return (
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
            <p className="text-blue-800">{question.content || question.help_text}</p>
          </div>
        );

      case 'section_header':
        return (
          <div className="border-t-2 border-gray-300 mt-6 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{question.question}</h3>
            {question.help_text && (
              <p className="text-sm text-gray-600">{question.help_text}</p>
            )}
          </div>
        );

      case 'custom_modules':
        const customModulesCount = parseInt(responses.custom_modules_count) || 0;

        return (
          <div className="space-y-4">
            {/* Number of custom modules selector */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                How many custom modules do you need?
              </label>
              <input
                type="number"
                value={responses.custom_modules_count || 0}
                onChange={(e) => handleResponseChange('custom_modules_count', e.target.value)}
                min="0"
                max="10"
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">Custom modules beyond standard Odoo (e.g., I+D module, special workflows)</p>
            </div>

            {/* Custom module cards - matching EXACT style of standard modules */}
            {customModulesCount > 0 && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                {Array.from({ length: customModulesCount }, (_, i) => i + 1).map(num => {
                  const nameField = `custom_module_${num}_name`;
                  const hoursField = `custom_module_${num}_hours`;
                  const moduleName = responses[nameField] || '';
                  const moduleHours = responses[hoursField] || '';

                  return (
                    <div
                      key={num}
                      className="p-3 rounded-lg border-2 bg-orange-600 text-white border-orange-600"
                    >
                      {/* Module name input - looks like module label */}
                      <input
                        type="text"
                        value={moduleName}
                        onChange={(e) => handleResponseChange(nameField, e.target.value)}
                        placeholder={`Custom Module ${num}`}
                        className="w-full px-0 py-0 text-sm font-semibold bg-transparent text-white placeholder-orange-200 border-none focus:ring-0 focus:outline-none mb-1"
                      />
                      <div className="text-xs text-orange-100 mb-2">Custom development</div>

                      {/* Hour input section - same as standard modules */}
                      <div className="mt-2 pt-2 border-t border-orange-400">
                        <input
                          type="number"
                          value={moduleHours}
                          onChange={(e) => handleResponseChange(hoursField, e.target.value)}
                          placeholder="Hours"
                          min="0"
                          className="w-full px-2 py-1 text-sm rounded border border-orange-300 bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <div className="text-xs text-orange-100 mt-1">Allocated hours</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'budget_tracker':
        // Calculate all phase hours
        const clarityHours = parseFloat(responses.clarity_hours) || 0;

        // Calculate Implementation hours from modules + custom + migration
        const moduleFields = [
          'module_crm_hours', 'module_sales_hours', 'module_purchase_hours',
          'module_inventory_hours', 'module_accounting_hours', 'module_projects_hours',
          'module_fsm_hours', 'module_expenses_hours', 'module_manufacturing_hours',
          'module_ecommerce_hours', 'module_pos_hours', 'module_hr_hours',
          'module_payroll_hours', 'module_helpdesk_hours'
        ];

        let moduleHours = 0;
        moduleFields.forEach(field => {
          moduleHours += parseFloat(responses[field]) || 0;
        });

        let customHours = 0;
        const customCount = parseInt(responses.custom_modules_count) || 0;
        for (let i = 1; i <= customCount; i++) {
          customHours += parseFloat(responses[`custom_module_${i}_hours`]) || 0;
        }

        const migrationHours = parseFloat(responses.migration_hours) || 0;
        const implementationHours = moduleHours + customHours + migrationHours;

        // Calculate Adoption hours from training + (support/month × months)
        const trainingHours = parseFloat(responses.training_hours) || 0;
        const supportPerMonth = parseFloat(responses.support_hours_per_month) || 0;
        const supportMonths = parseInt(responses.adoption_duration_months) || 0;
        const adoptionHours = trainingHours + (supportPerMonth * supportMonths);

        const totalProjectHours = clarityHours + implementationHours + adoptionHours;

        return (
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-blue-600" />
              {question.question}
            </h3>

            <div className="space-y-4">
              {/* Clarity Phase */}
              {responses.clarity_phase && (
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex justify-between items-center">
                    <div className="font-semibold text-gray-900">Clarity Phase</div>
                    <div className="text-2xl font-bold text-blue-600">{clarityHours}h</div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Discovery & requirements</div>
                </div>
              )}

              {/* Implementation Phase */}
              {responses.implementation_phase && (
                <div className="bg-white rounded-lg p-4 border border-purple-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-gray-900">Implementation Phase</div>
                    <div className="text-2xl font-bold text-purple-600">{implementationHours}h</div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {moduleHours > 0 && <div>• Odoo Modules: {moduleHours}h</div>}
                    {customHours > 0 && <div>• Custom Modules: {customHours}h</div>}
                    {migrationHours > 0 && <div>• Data Migration: {migrationHours}h</div>}
                  </div>
                </div>
              )}

              {/* Adoption Phase */}
              {responses.adoption_phase && (
                <div className="bg-white rounded-lg p-4 border border-green-200">
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-gray-900">Adoption Phase</div>
                    <div className="text-2xl font-bold text-green-600">{adoptionHours}h</div>
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    {trainingHours > 0 && <div>• Training: {trainingHours}h</div>}
                    {(supportPerMonth > 0 && supportMonths > 0) && (
                      <div>• Support: {supportPerMonth}h/month × {supportMonths} months = {supportPerMonth * supportMonths}h</div>
                    )}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg p-4 text-white">
                <div className="flex justify-between items-center">
                  <div className="text-lg font-bold">Total Project Hours</div>
                  <div className="text-3xl font-bold">{totalProjectHours}h</div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <p className="text-gray-500">Unsupported question type: {question.type}</p>;
    }
  };

  // Welcome Screen
  if (step === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <FileText className="w-16 h-16 text-purple-600" />
              <h1 className="text-5xl font-bold text-gray-900">Odoo Implementation Planner</h1>
            </div>
            <p className="text-gray-600 text-xl">Transform your Odoo projects into structured, actionable plans</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome to Arkode's Project Planner</h2>

            <div className="space-y-4 mb-8">
              <p className="text-gray-700">
                This tool will help you create a comprehensive project plan for your Odoo implementation in just <strong>10-15 minutes</strong>.
              </p>

              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">What you'll get:</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Detailed task breakdown for Clarity, Implementation, and Adoption phases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Module-specific tasks based on Odoo 19 official features</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Hour allocation aligned with your quoted hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>CSV file ready to import directly into Odoo 19 Project module</span>
                  </li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setStep('questionnaire')}
              className="w-full bg-purple-600 text-white py-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 text-lg"
            >
              Start Planning Your Project
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-500">
            Powered by Arkode's implementation expertise and Odoo 19 documentation
          </div>
        </div>
      </div>
    );
  }

  // Questionnaire Screen
  if (step === 'questionnaire' && currentSectionData) {
    const visibleQuestions = currentSectionData.questions.filter(isQuestionVisible);
    const progress = ((currentSection + 1) / visibleSections.length) * 100;

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Planning Questionnaire</h1>
            <p className="text-gray-600">Section {currentSection + 1} of {visibleSections.length}</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-purple-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Section Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentSectionData.title}</h2>
              <p className="text-gray-600">{currentSectionData.description}</p>
            </div>

            <div className="space-y-6">
              {visibleQuestions.map(question => (
                <div key={question.id} className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </label>

                  {renderQuestion(question)}

                  {question.help_text && question.type !== 'checkbox' && (
                    <p className="text-xs text-gray-500 flex items-start gap-1">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      {question.help_text}
                    </p>
                  )}
                </div>
              ))}

              {/* Budget Tracker for Implementation Hours */}
              {currentSectionData.id === 'scope_and_hours' && responses.implementation_phase && responses.implementation_hours && (
                <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Implementation Hours Budget Tracker
                  </h3>

                  {(() => {
                    const totalBudget = parseFloat(responses.implementation_hours) || 0;

                    // Calculate allocated hours for Odoo modules
                    const moduleFields = [
                      'module_crm_hours', 'module_sales_hours', 'module_purchase_hours',
                      'module_inventory_hours', 'module_accounting_hours', 'module_projects_hours',
                      'module_fsm_hours', 'module_expenses_hours', 'module_manufacturing_hours',
                      'module_ecommerce_hours', 'module_pos_hours', 'module_hr_hours',
                      'module_payroll_hours', 'module_helpdesk_hours'
                    ];

                    let allocatedModuleHours = 0;
                    moduleFields.forEach(field => {
                      allocatedModuleHours += parseFloat(responses[field]) || 0;
                    });

                    // Calculate custom module hours
                    let allocatedCustomHours = 0;
                    const customModulesCount = parseInt(responses.custom_modules_count) || 0;
                    for (let i = 1; i <= customModulesCount; i++) {
                      allocatedCustomHours += parseFloat(responses[`custom_module_${i}_hours`]) || 0;
                    }

                    // Calculate migration hours
                    const migrationHours = parseFloat(responses.migration_hours) || 0;

                    const totalAllocated = allocatedModuleHours + allocatedCustomHours + migrationHours;
                    const remaining = totalBudget - totalAllocated;
                    const percentageUsed = totalBudget > 0 ? (totalAllocated / totalBudget) * 100 : 0;

                    const isOverBudget = remaining < 0;
                    const isOnTrack = remaining >= 0 && remaining <= totalBudget * 0.1;
                    const hasRoomLeft = remaining > totalBudget * 0.1;

                    return (
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-gray-600">Total Budget</div>
                            <div className="text-xl font-bold text-gray-900">{totalBudget}h</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-600">Allocated</div>
                            <div className="text-xl font-bold text-blue-600">{totalAllocated}h</div>
                          </div>
                          <div className="text-center">
                            <div className="text-gray-600">Remaining</div>
                            <div className={`text-xl font-bold ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                              {remaining}h
                            </div>
                          </div>
                        </div>

                        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isOverBudget ? 'bg-red-500' : isOnTrack ? 'bg-green-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${Math.min(percentageUsed, 100)}%` }}
                          />
                        </div>

                        <div className="text-xs text-gray-600 space-y-1">
                          {allocatedModuleHours > 0 && (
                            <div>• Odoo Modules: {allocatedModuleHours}h</div>
                          )}
                          {allocatedCustomHours > 0 && (
                            <div>• Custom Modules: {allocatedCustomHours}h</div>
                          )}
                          {migrationHours > 0 && (
                            <div>• Data Migration: {migrationHours}h</div>
                          )}
                        </div>

                        {isOverBudget && (
                          <div className="flex items-start gap-2 text-sm text-red-700 bg-red-100 p-2 rounded">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Over budget by {Math.abs(remaining)}h. Consider reducing hours or increasing total budget.</span>
                          </div>
                        )}
                        {isOnTrack && (
                          <div className="flex items-start gap-2 text-sm text-green-700 bg-green-100 p-2 rounded">
                            <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Perfect! Hours are fully allocated.</span>
                          </div>
                        )}
                        {hasRoomLeft && totalAllocated > 0 && (
                          <div className="flex items-start gap-2 text-sm text-blue-700 bg-blue-100 p-2 rounded">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>You have {remaining}h unallocated. These will be distributed evenly across modules.</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex gap-4 mt-8">
              {currentSection > 0 && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>
              )}

              <button
                onClick={handleNext}
                className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                {currentSection < visibleSections.length - 1 ? (
                  <>
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </>
                ) : (
                  <>
                    Review Answers
                    <CheckCircle className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Review Screen
  if (step === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Your Answers</h1>
            <p className="text-gray-600">Please verify the information before generating your project plan</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Project Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Project Name:</strong> {responses.project_name}</div>
                  <div><strong>Client:</strong> {responses.client_name}</div>
                  <div><strong>Timeline:</strong> {responses.timeline}</div>
                  <div><strong>Project Manager:</strong> {responses.project_manager}</div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Phases & Hours</h3>
                <div className="space-y-2 text-sm">
                  {responses.clarity_phase && (
                    <div className="flex justify-between">
                      <span>✓ Clarity Phase</span>
                      <span className="font-semibold">{responses.clarity_hours || 0} hours</span>
                    </div>
                  )}
                  {responses.implementation_phase && (() => {
                    // Calculate Implementation hours from breakdown
                    const moduleFields = [
                      'module_crm_hours', 'module_sales_hours', 'module_purchase_hours',
                      'module_inventory_hours', 'module_accounting_hours', 'module_projects_hours',
                      'module_fsm_hours', 'module_expenses_hours', 'module_manufacturing_hours',
                      'module_ecommerce_hours', 'module_pos_hours', 'module_hr_hours',
                      'module_payroll_hours', 'module_helpdesk_hours'
                    ];
                    let implementationHours = 0;
                    moduleFields.forEach(field => {
                      implementationHours += parseFloat(responses[field]) || 0;
                    });
                    const customCount = parseInt(responses.custom_modules_count) || 0;
                    for (let i = 1; i <= customCount; i++) {
                      implementationHours += parseFloat(responses[`custom_module_${i}_hours`]) || 0;
                    }
                    implementationHours += parseFloat(responses.migration_hours) || 0;

                    return (
                      <div className="flex justify-between">
                        <span>✓ Implementation Phase</span>
                        <span className="font-semibold">{implementationHours} hours</span>
                      </div>
                    );
                  })()}
                  {responses.adoption_phase && (() => {
                    // Calculate Adoption hours from breakdown
                    const trainingHours = parseFloat(responses.training_hours) || 0;
                    const supportPerMonth = parseFloat(responses.support_hours_per_month) || 0;
                    const supportMonths = parseInt(responses.adoption_duration_months) || 0;
                    const adoptionHours = trainingHours + (supportPerMonth * supportMonths);

                    return (
                      <div className="flex justify-between">
                        <span>✓ Adoption Phase</span>
                        <span className="font-semibold">{adoptionHours} hours</span>
                      </div>
                    );
                  })()}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Modules</h3>
                <div className="flex flex-wrap gap-2">
                  {responses.modules?.map(module => (
                    <span key={module} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                      {module}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => { setStep('questionnaire'); setCurrentSection(0); }}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Edit Answers
            </button>
            <button
              onClick={generateProjectPlan}
              disabled={isGenerating}
              className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  Generating Plan...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Generate Project Plan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Plan Display Screen
  if (step === 'plan' && generatedPlan) {
    const tasksByPhase = generatedPlan.tasks.reduce((acc, task) => {
      if (!acc[task.phase]) acc[task.phase] = [];
      acc[task.phase].push(task);
      return acc;
    }, {});

    const totalHours = generatedPlan.tasks.reduce((sum, task) => sum + (task.allocated_hours || 0), 0);

    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{generatedPlan.project_info.name}</h1>
              <p className="text-gray-600">{generatedPlan.tasks.length} tasks | {totalHours.toFixed(1)} total hours</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={exportToCSV}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 font-semibold"
              >
                <Download className="w-5 h-5" />
                Export to CSV
              </button>
              <button
                onClick={resetPlanner}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2 font-semibold"
              >
                <RefreshCw className="w-5 h-5" />
                New Project
              </button>
            </div>
          </div>

          {/* Executive Milestones Table */}
          <div className="mb-8 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-indigo-600 text-white px-6 py-4">
              <h2 className="text-2xl font-bold">Project Milestones</h2>
              <p className="text-indigo-100">Key deliverables and dates</p>
            </div>
            <div className="p-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Milestone</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Start Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Due Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Deliverables</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(() => {
                    const projectStartDate = responses.project_start_date || new Date().toISOString().split('T')[0];
                    const language = responses.language || 'English';

                    // Build deliverable-based milestones
                    const milestones = [];
                    let currentDate = projectStartDate;

                    // Clarity Phase Milestones
                    if (responses.clarity_phase) {
                      // Milestone 1: Mapping the processes (2 weeks)
                      const mappingEnd = addWeeks(currentDate, 2);
                      milestones.push({
                        name: language === 'Spanish' ? 'Mapeo de Procesos' : 'Process Mapping',
                        name_en: 'Process Mapping',
                        name_es: 'Mapeo de Procesos',
                        start: currentDate,
                        end: mappingEnd,
                        deliverables: language === 'Spanish'
                          ? 'Procesos As-Is documentados, Análisis de brechas'
                          : 'As-Is processes documented, Gap analysis'
                      });
                      currentDate = mappingEnd;

                      // Milestone 2: Findings, Opportunities & TO-BE (1 week)
                      const toBeEnd = addWeeks(currentDate, 1);
                      milestones.push({
                        name: language === 'Spanish' ? 'Hallazgos, Oportunidades y TO-BE' : 'Findings, Opportunities & TO-BE',
                        name_en: 'Findings, Opportunities & TO-BE',
                        name_es: 'Hallazgos, Oportunidades y TO-BE',
                        start: currentDate,
                        end: toBeEnd,
                        deliverables: language === 'Spanish'
                          ? 'Procesos To-Be diseñados, Oportunidades de mejora'
                          : 'To-Be processes designed, Improvement opportunities'
                      });
                      currentDate = toBeEnd;

                      // Milestone 3: Master of Implementation (1 week)
                      const moiEnd = addWeeks(currentDate, 1);
                      milestones.push({
                        name: language === 'Spanish' ? 'Master of Implementation' : 'Master of Implementation',
                        name_en: 'Master of Implementation',
                        name_es: 'Master of Implementation',
                        start: currentDate,
                        end: moiEnd,
                        deliverables: language === 'Spanish'
                          ? 'Prototipo visual de solución Odoo, Aprobación cliente'
                          : 'Visual Odoo solution prototype, Client approval'
                      });
                      currentDate = moiEnd;
                    }

                    // Implementation Phase Milestones (per module)
                    if (responses.implementation_phase && responses.modules) {
                      const selectedModules = responses.modules;
                      const hoursPerModule = parseFloat(responses.implementation_hours || 0) / (selectedModules.length + 2); // +2 for custom/migration

                      selectedModules.forEach(moduleName => {
                        const moduleWeeks = Math.ceil(hoursPerModule / 40) || 1;
                        const moduleEnd = addWeeks(currentDate, moduleWeeks);

                        milestones.push({
                          name: language === 'Spanish'
                            ? `Implementación del módulo de ${moduleName}`
                            : `Implementation of ${moduleName} Module`,
                          name_en: `Implementation of ${moduleName} Module`,
                          name_es: `Implementación del módulo de ${moduleName}`,
                          start: currentDate,
                          end: moduleEnd,
                          deliverables: language === 'Spanish'
                            ? `Configuración de ${moduleName}, Pruebas`
                            : `${moduleName} configuration, Testing`
                        });

                        currentDate = moduleEnd;
                      });

                      // Custom Module Milestones (one per custom module)
                      const customModulesCount = parseInt(responses.custom_modules_count) || 0;
                      if (customModulesCount > 0) {
                        for (let i = 1; i <= customModulesCount; i++) {
                          const moduleName = responses[`custom_module_${i}_name`];
                          const moduleHours = parseFloat(responses[`custom_module_${i}_hours`]) || 0;

                          if (moduleName) {
                            const customWeeks = Math.ceil(moduleHours / 40) || 1;
                            const customEnd = addWeeks(currentDate, customWeeks);

                            milestones.push({
                              name: language === 'Spanish'
                                ? `Implementación de ${moduleName}`
                                : `Implementation of ${moduleName}`,
                              name_en: `Implementation of ${moduleName}`,
                              name_es: `Implementación de ${moduleName}`,
                              start: currentDate,
                              end: customEnd,
                              deliverables: language === 'Spanish'
                                ? `Desarrollo de ${moduleName}, Testing e integración`
                                : `${moduleName} development, Testing and integration`
                            });

                            currentDate = customEnd;
                          }
                        }
                      }

                      // Migration Milestone (if needed)
                      if (responses.data_migration && responses.data_migration !== 'No') {
                        const migrationWeeks = 1;
                        const migrationEnd = addWeeks(currentDate, migrationWeeks);

                        milestones.push({
                          name: language === 'Spanish' ? 'Migración de Datos' : 'Data Migration',
                          name_en: 'Data Migration',
                          name_es: 'Migración de Datos',
                          start: currentDate,
                          end: migrationEnd,
                          deliverables: language === 'Spanish'
                            ? 'Datos migrados, Validación completa'
                            : 'Data migrated, Full validation'
                        });

                        currentDate = migrationEnd;
                      }
                    }

                    const implementationEnd = currentDate;

                    // Adoption Phase Milestone
                    if (responses.adoption_phase) {
                      const adoptionMonths = parseInt(responses.adoption_duration_months || 2);
                      const adoptionEnd = addWeeks(currentDate, adoptionMonths * 4);

                      milestones.push({
                        name: language === 'Spanish' ? 'Capacitación y Go-Live' : 'Training & Go-Live',
                        name_en: 'Training & Go-Live',
                        name_es: 'Capacitación y Go-Live',
                        start: currentDate,
                        end: adoptionEnd,
                        deliverables: language === 'Spanish'
                          ? 'Usuarios capacitados, Sistema en producción, Soporte post-lanzamiento'
                          : 'Users trained, System in production, Post-launch support'
                      });
                    }

                    return milestones.map((milestone, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{milestone.name}</div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{milestone.start}</td>
                        <td className="px-4 py-3 text-sm text-gray-700 font-semibold">{milestone.end}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{milestone.deliverables}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {Object.keys(tasksByPhase).map(phase => (
            <div key={phase} className="mb-8">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-purple-600 text-white px-6 py-4">
                  <h2 className="text-2xl font-bold">{phase} Phase</h2>
                  <p className="text-purple-100">
                    {tasksByPhase[phase].length} tasks | {
                      tasksByPhase[phase].reduce((sum, t) => sum + (t.allocated_hours || 0), 0).toFixed(1)
                    } hours
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b-2 border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/3">Task</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/6">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-20">Hours</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 w-24">Priority</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Tags</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {tasksByPhase[phase].map(task => (
                        <tr key={task.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-gray-900">{task.title}</div>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded ${
                                task.task_type === 'custom'
                                  ? 'bg-orange-100 text-orange-800'
                                  : task.task_type === 'ai_generated'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {task.task_type === 'custom' ? 'Custom' : task.task_type === 'ai_generated' ? 'AI Generated' : 'Native'}
                              </span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                            {task.odoo_feature && (
                              <div className="text-xs text-purple-600 mt-1">
                                📍 {task.odoo_feature}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{task.category}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{task.allocated_hours}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              task.priority === 'High' ? 'bg-red-100 text-red-800' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-600">
                            {Array.isArray(task.tags) ? task.tags.join(', ') : task.tags}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
            <h3 className="font-bold text-blue-900 mb-2">Next Steps:</h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-800">
              <li>Review the generated tasks and verify they match your project scope</li>
              <li>Click "Export to CSV" to download the file</li>
              <li>In Odoo 19, go to Project → Tasks → Favorites → Import</li>
              <li>Upload the CSV file and map the columns if needed</li>
              <li>Verify the import and start managing your project!</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
