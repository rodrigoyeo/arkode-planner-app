/**
 * QuestionnaireWizard Component
 * Main wizard container for the questionnaire flow
 * V3.5 - Premium refined design inspired by Notion, Clay, Claude
 */

import React, { memo, useMemo } from 'react';
import { ArrowLeft, ArrowRight, Loader2, Check, Clock, Layers, ChevronDown } from 'lucide-react';
import TemplateSelector from './TemplateSelector';
import ModuleSelector from './ModuleSelector';
import PhaseConfigurator from './PhaseConfigurator';

/**
 * QuestionRenderer - Memoized component for rendering individual questions
 * Uses premium CSS classes for refined styling
 */
const QuestionRenderer = memo(function QuestionRenderer({ question, value, onChange, language }) {
  const isSpanish = language === 'Spanish';
  const questionText = isSpanish ? (question.question_es || question.question) : question.question;
  const helpText = isSpanish ? (question.help_text_es || question.help_text) : question.help_text;

  switch (question.type) {
    case 'text':
      return (
        <div className="mb-6 animate-fade-in">
          <label className="label-premium">
            {questionText}
            {question.required && <span className="label-required">*</span>}
          </label>
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            className="input-premium"
            required={question.required}
          />
          {helpText && <p className="help-text">{helpText}</p>}
        </div>
      );

    case 'textarea':
      return (
        <div className="mb-6 animate-fade-in">
          <label className="label-premium">
            {questionText}
            {question.required && <span className="label-required">*</span>}
          </label>
          <textarea
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            placeholder={question.placeholder}
            rows={question.rows || 3}
            className="input-premium resize-none"
          />
          {helpText && <p className="help-text">{helpText}</p>}
        </div>
      );

    case 'number':
      return (
        <div className="mb-6 animate-fade-in">
          <label className="label-premium">
            {questionText}
            {question.required && <span className="label-required">*</span>}
          </label>
          <input
            type="number"
            value={value ?? ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange(question.id, val === '' ? '' : parseFloat(val) || 0);
            }}
            placeholder={question.placeholder}
            min={question.min}
            max={question.max}
            className="input-premium"
          />
          {helpText && <p className="help-text">{helpText}</p>}
        </div>
      );

    case 'date':
      return (
        <div className="mb-6 animate-fade-in">
          <label className="label-premium">
            {questionText}
            {question.required && <span className="label-required">*</span>}
          </label>
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(question.id, e.target.value)}
            className="input-premium"
            required={question.required}
          />
          {helpText && <p className="help-text">{helpText}</p>}
        </div>
      );

    case 'select':
      return (
        <div className="mb-6 animate-fade-in">
          <label className="label-premium">
            {questionText}
            {question.required && <span className="label-required">*</span>}
          </label>
          <div className="select-wrapper">
            <select
              value={value || question.default || ''}
              onChange={(e) => onChange(question.id, e.target.value)}
              className="input-premium select-premium"
            >
              <option value="">{isSpanish ? 'Seleccionar...' : 'Select...'}</option>
              {question.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          {helpText && <p className="help-text">{helpText}</p>}
        </div>
      );

    case 'checkbox':
      return (
        <div className="mb-5 animate-fade-in">
          <label className={`selection-card flex items-center gap-4 ${value ?? question.default ?? false ? 'selected' : ''}`}>
            <div className={`checkbox-custom ${value ?? question.default ?? false ? 'checked' : ''}`}>
              {(value ?? question.default ?? false) && (
                <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              )}
            </div>
            <input
              type="checkbox"
              checked={value ?? question.default ?? false}
              onChange={(e) => onChange(question.id, e.target.checked)}
              className="sr-only"
            />
            <span className="text-[15px] font-medium text-[var(--ink)]">{questionText}</span>
          </label>
          {helpText && <p className="help-text ml-1">{helpText}</p>}
        </div>
      );

    case 'multiselect':
      return (
        <div className="mb-6 animate-fade-in">
          <label className="label-premium">
            {questionText}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {question.options.map((option) => {
              const optionValue = typeof option === 'object' ? option.value : option;
              const optionLabel = typeof option === 'object' ? option.label : option;
              const isSelected = value?.includes(optionValue);

              return (
                <button
                  key={optionValue}
                  type="button"
                  onClick={() => {
                    const currentValues = value || [];
                    const newValues = isSelected
                      ? currentValues.filter(v => v !== optionValue)
                      : [...currentValues, optionValue];
                    onChange(question.id, newValues);
                  }}
                  className={`selection-card text-left ${isSelected ? 'selected' : ''}`}
                >
                  <span className="text-[15px] font-medium text-[var(--ink)]">{optionLabel}</span>
                  {typeof option === 'object' && option.role && (
                    <span className="block text-[13px] text-[var(--stone)] mt-1">{option.role}</span>
                  )}
                </button>
              );
            })}
          </div>
          {helpText && <p className="help-text">{helpText}</p>}
        </div>
      );

    default:
      return null;
  }
});

/**
 * StepIndicator - Shows progress through wizard steps
 */
const StepIndicator = memo(function StepIndicator({ currentSection, totalSections }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {[...Array(totalSections)].map((_, idx) => (
            <div
              key={idx}
              className={`progress-dot ${
                idx < currentSection ? 'completed' : idx === currentSection ? 'active' : ''
              }`}
            />
          ))}
        </div>
        <span className="text-[13px] text-[var(--stone)] font-medium tabular-nums">
          {currentSection + 1} of {totalSections}
        </span>
      </div>
    </div>
  );
});

/**
 * Navigation - Back/Next/Generate buttons
 */
const Navigation = memo(function Navigation({
  showPrevious,
  currentSection,
  totalSections,
  canGenerate,
  isGenerating,
  isTemplateSection,
  selectedTemplate,
  onPrevious,
  onNext,
  onGenerate,
  isSpanish
}) {
  return (
    <div className="flex justify-between items-center mt-10 pt-6 border-t border-[var(--sand)]">
      {showPrevious && currentSection > 0 ? (
        <button
          type="button"
          onClick={onPrevious}
          className="btn-secondary"
        >
          <ArrowLeft className="w-4 h-4" />
          {isSpanish ? 'Anterior' : 'Back'}
        </button>
      ) : (
        <div />
      )}

      {currentSection === totalSections - 1 ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || isGenerating}
          className="btn-primary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {isSpanish ? 'Generando...' : 'Generating...'}
            </>
          ) : (
            <>
              {isSpanish ? 'Generar Plan' : 'Generate Plan'}
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={isTemplateSection && !selectedTemplate}
          className="btn-primary"
        >
          {isSpanish ? 'Continuar' : 'Continue'}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
});

/**
 * HoursSummary - Shows total hours breakdown
 */
const HoursSummary = memo(function HoursSummary({
  totalHours,
  clarityHours,
  implementationHours,
  adoptionHours,
  showClarity,
  showImplementation,
  showAdoption,
  isSpanish
}) {
  return (
    <div className="mt-8 p-6 bg-[var(--ink)] rounded-2xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--arkode-coral)]/20 flex items-center justify-center">
            <Clock className="w-5 h-5 text-[var(--arkode-coral)]" />
          </div>
          <span className="text-[15px] text-[var(--stone)]">
            {isSpanish ? 'Horas Totales' : 'Total Hours'}
          </span>
        </div>
        <span className="text-3xl font-bold text-white tabular-nums">
          {totalHours}<span className="text-[var(--arkode-coral)]">h</span>
        </span>
      </div>
      {(showClarity || showImplementation || showAdoption) && (
        <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-3 gap-4">
          {showClarity && (
            <div>
              <div className="text-[11px] text-[var(--stone)] uppercase tracking-wider font-medium">
                {isSpanish ? 'Claridad' : 'Clarity'}
              </div>
              <div className="text-white font-semibold mt-1.5 text-lg tabular-nums">{clarityHours || 0}h</div>
            </div>
          )}
          {showImplementation && (
            <div>
              <div className="text-[11px] text-[var(--stone)] uppercase tracking-wider font-medium">
                {isSpanish ? 'Implementación' : 'Implementation'}
              </div>
              <div className="text-white font-semibold mt-1.5 text-lg tabular-nums">{implementationHours || 0}h</div>
            </div>
          )}
          {showAdoption && (
            <div>
              <div className="text-[11px] text-[var(--stone)] uppercase tracking-wider font-medium">
                {isSpanish ? 'Adopción' : 'Adoption'}
              </div>
              <div className="text-white font-semibold mt-1.5 text-lg tabular-nums">{adoptionHours || 0}h</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
});

/**
 * PageHeader - Top header with logo
 */
function PageHeader() {
  return (
    <header className="px-8 py-5 bg-white border-b border-[var(--sand)]">
      <div className="max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--arkode-coral)] rounded-xl flex items-center justify-center shadow-sm">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-[var(--ink)] text-[15px] tracking-tight">
            Arkode Planner
          </span>
        </div>
      </div>
    </header>
  );
}

/**
 * SectionHeader - Title and description for each section
 */
const SectionHeader = memo(function SectionHeader({ title, description }) {
  return (
    <div className="mb-8">
      <h2 className="text-title">{title}</h2>
      <p className="text-subtitle mt-2">{description}</p>
    </div>
  );
});

/**
 * Main QuestionnaireWizard Component
 */
export default function QuestionnaireWizard({
  currentSection,
  totalSections,
  sectionData,
  responses,
  selectedTemplate,
  templates,
  availableModules,
  totalHours,
  implementationHours,
  adoptionHours,
  canGenerate,
  selectedModules,
  onUpdateResponse,
  onToggleModule,
  onUpdateModuleHours,
  onAddCustomModule,
  onRemoveCustomModule,
  onUpdateCustomModule,
  onApplyTemplate,
  onNext,
  onPrevious,
  onGenerate,
  isQuestionVisible,
  isGenerating,
  language = 'English'
}) {
  const isSpanish = language === 'Spanish';

  // Get section title and description
  const sectionTitle = isSpanish ? (sectionData?.title_es || sectionData?.title) : sectionData?.title;
  const sectionDescription = isSpanish ? (sectionData?.description_es || sectionData?.description) : sectionData?.description;

  // Memoize visible questions to prevent unnecessary recalculations
  const visibleQuestions = useMemo(() => {
    return sectionData?.questions?.filter(q => isQuestionVisible(q)) || [];
  }, [sectionData?.questions, isQuestionVisible]);

  // Determine which content to render based on section type
  let content;

  if (sectionData?.type === 'template_selector') {
    content = (
      <>
        <TemplateSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={onApplyTemplate}
          language={language}
        />
        <Navigation
          showPrevious={false}
          currentSection={currentSection}
          totalSections={totalSections}
          canGenerate={canGenerate}
          isGenerating={isGenerating}
          isTemplateSection={true}
          selectedTemplate={selectedTemplate}
          onPrevious={onPrevious}
          onNext={onNext}
          onGenerate={onGenerate}
          isSpanish={isSpanish}
        />
      </>
    );
  } else if (sectionData?.type === 'phase_configurator') {
    content = (
      <>
        <SectionHeader title={sectionTitle} description={sectionDescription} />
        <PhaseConfigurator
          responses={responses}
          onUpdateResponse={onUpdateResponse}
          availableModules={availableModules}
          selectedModules={selectedModules}
          onToggleModule={onToggleModule}
          onUpdateModuleHours={onUpdateModuleHours}
          customModules={responses.custom_modules || []}
          onAddCustomModule={onAddCustomModule}
          onRemoveCustomModule={onRemoveCustomModule}
          onUpdateCustomModule={onUpdateCustomModule}
          language={language}
        />
        <Navigation
          showPrevious={true}
          currentSection={currentSection}
          totalSections={totalSections}
          canGenerate={canGenerate}
          isGenerating={isGenerating}
          isTemplateSection={false}
          selectedTemplate={selectedTemplate}
          onPrevious={onPrevious}
          onNext={onNext}
          onGenerate={onGenerate}
          isSpanish={isSpanish}
        />
      </>
    );
  } else if (sectionData?.type === 'module_selector_with_hours') {
    content = (
      <>
        <SectionHeader title={sectionTitle} description={sectionDescription} />
        <ModuleSelector
          modules={availableModules}
          selectedModules={selectedModules}
          moduleHours={responses.module_hours || {}}
          onToggle={onToggleModule}
          onUpdateHours={onUpdateModuleHours}
          customModules={responses.custom_modules || []}
          onAddCustomModule={onAddCustomModule}
          onRemoveCustomModule={onRemoveCustomModule}
          onUpdateCustomModule={onUpdateCustomModule}
          language={language}
        />
        <Navigation
          showPrevious={true}
          currentSection={currentSection}
          totalSections={totalSections}
          canGenerate={canGenerate}
          isGenerating={isGenerating}
          isTemplateSection={false}
          selectedTemplate={selectedTemplate}
          onPrevious={onPrevious}
          onNext={onNext}
          onGenerate={onGenerate}
          isSpanish={isSpanish}
        />
      </>
    );
  } else {
    // Standard question section
    content = (
      <>
        <SectionHeader title={sectionTitle} description={sectionDescription} />
        <div>
          {visibleQuestions.map(question => (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={responses[question.id]}
              onChange={onUpdateResponse}
              language={language}
            />
          ))}
        </div>
        {totalHours > 0 && sectionData?.id !== 'project_basics' && (
          <HoursSummary
            totalHours={totalHours}
            clarityHours={responses.clarity_hours}
            implementationHours={implementationHours}
            adoptionHours={adoptionHours}
            showClarity={responses.clarity_phase}
            showImplementation={responses.implementation_phase}
            showAdoption={responses.adoption_phase}
            isSpanish={isSpanish}
          />
        )}
        <Navigation
          showPrevious={true}
          currentSection={currentSection}
          totalSections={totalSections}
          canGenerate={canGenerate}
          isGenerating={isGenerating}
          isTemplateSection={false}
          selectedTemplate={selectedTemplate}
          onPrevious={onPrevious}
          onNext={onNext}
          onGenerate={onGenerate}
          isSpanish={isSpanish}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)]">
      <PageHeader />
      <main className="px-6 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="card-floating p-8 animate-fade-in">
            <StepIndicator currentSection={currentSection} totalSections={totalSections} />
            {content}
          </div>
        </div>
      </main>
    </div>
  );
}
