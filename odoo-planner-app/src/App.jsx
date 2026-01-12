/**
 * Odoo Implementation Planner - Main App
 * Version 3.1 - Arkode brand, hours per module, PM-quality plans
 */

import React, { useState } from 'react';

// Components
import WelcomeScreen from './components/welcome/WelcomeScreen';
import QuestionnaireWizard from './components/questionnaire/QuestionnaireWizard';
import PlanDisplay from './components/plan/PlanDisplay';

// Hooks
import { useQuestionnaire } from './hooks/useQuestionnaire';
import { useProjectPlan } from './hooks/useProjectPlan';

function App() {
  // App state
  const [step, setStep] = useState('welcome'); // welcome | questionnaire | plan
  const [language, setLanguage] = useState('English');

  // Questionnaire state
  const {
    currentSection,
    responses,
    selectedTemplate,
    visibleSections,
    totalHours,
    implementationHours,
    adoptionHours,
    canGenerate,
    selectedModules,
    templates,
    availableModules,
    currentSectionData,
    updateResponse,
    toggleModule,
    updateModuleHours,
    addCustomModule,
    removeCustomModule,
    updateCustomModule,
    applyTemplate,
    goToNextSection,
    goToPreviousSection,
    reset: resetQuestionnaire,
    isQuestionVisible
  } = useQuestionnaire();

  // Plan state
  const {
    plan,
    deliverables,
    flatTasks,
    stats,
    isGenerating,
    deletedTaskIds,
    expandedDeliverables,
    generatePlan,
    toggleDeliverableExpansion,
    expandAllDeliverables,
    collapseAllDeliverables,
    deleteTask,
    reset: resetPlan
  } = useProjectPlan();

  // Handle start
  const handleStart = () => {
    setStep('questionnaire');
  };

  // Handle generate plan
  const handleGeneratePlan = async () => {
    try {
      await generatePlan(responses);
      setStep('plan');
    } catch (error) {
      console.error('Failed to generate plan:', error);
      alert('Failed to generate plan. Please try again.');
    }
  };

  // Handle reset (new plan)
  const handleReset = () => {
    resetQuestionnaire();
    resetPlan();
    setStep('welcome');
  };

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    updateResponse('language', newLanguage);
  };

  // Render based on step
  switch (step) {
    case 'welcome':
      return (
        <WelcomeScreen
          onStart={handleStart}
          language={language}
        />
      );

    case 'questionnaire':
      return (
        <QuestionnaireWizard
          currentSection={currentSection}
          totalSections={visibleSections.length}
          sectionData={currentSectionData}
          responses={responses}
          selectedTemplate={selectedTemplate}
          templates={templates}
          availableModules={availableModules}
          totalHours={totalHours}
          implementationHours={implementationHours}
          adoptionHours={adoptionHours}
          canGenerate={canGenerate}
          selectedModules={selectedModules}
          onUpdateResponse={updateResponse}
          onToggleModule={toggleModule}
          onUpdateModuleHours={updateModuleHours}
          onAddCustomModule={addCustomModule}
          onRemoveCustomModule={removeCustomModule}
          onUpdateCustomModule={updateCustomModule}
          onApplyTemplate={applyTemplate}
          onNext={goToNextSection}
          onPrevious={goToPreviousSection}
          onGenerate={handleGeneratePlan}
          isQuestionVisible={isQuestionVisible}
          isGenerating={isGenerating}
          language={responses.language || language}
        />
      );

    case 'plan':
      return (
        <PlanDisplay
          plan={plan}
          deliverables={deliverables}
          flatTasks={flatTasks}
          stats={stats}
          expandedDeliverables={expandedDeliverables}
          onToggleExpand={toggleDeliverableExpansion}
          onExpandAll={expandAllDeliverables}
          onCollapseAll={collapseAllDeliverables}
          onDeleteTask={deleteTask}
          deletedTaskIds={deletedTaskIds}
          responses={responses}
          onReset={handleReset}
        />
      );

    default:
      return (
        <WelcomeScreen
          onStart={handleStart}
          language={language}
        />
      );
  }
}

export default App;
