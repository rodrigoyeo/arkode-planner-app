/**
 * PhaseConfigurator Component
 * Consolidated phase selection with inline configuration
 * V3.3 - Accordion-style phase configuration
 */

import React from 'react';
import { ChevronDown, ChevronUp, Check, Target, Package, GraduationCap, Clock, Plus, Trash2, Code } from 'lucide-react';

const phaseConfig = {
  clarity: {
    icon: Target,
    color: '#64748b',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200'
  },
  implementation: {
    icon: Package,
    color: '#FF6C5D',
    bgColor: 'bg-[#FF6C5D]/5',
    borderColor: 'border-[#FF6C5D]/20'
  },
  adoption: {
    icon: GraduationCap,
    color: '#059669',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  }
};

function PhaseCard({
  phase,
  title,
  titleEs,
  description,
  descriptionEs,
  isEnabled,
  onToggle,
  isExpanded,
  onToggleExpand,
  children,
  isSpanish
}) {
  const config = phaseConfig[phase];
  const Icon = config.icon;
  const displayTitle = isSpanish ? titleEs : title;
  const displayDescription = isSpanish ? descriptionEs : description;

  return (
    <div className={`rounded-xl border transition-all duration-200 ${isEnabled ? config.borderColor : 'border-[#E5E5E5]'} ${isEnabled ? config.bgColor : 'bg-white'}`}>
      {/* Phase Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Checkbox */}
          <button
            type="button"
            onClick={onToggle}
            className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              isEnabled ? 'border-[#FF6C5D] bg-[#FF6C5D]' : 'border-[#D1D5DB] bg-white hover:border-[#FF6C5D]/50'
            }`}
          >
            {isEnabled && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
          </button>

          {/* Icon */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${config.color}15` }}
          >
            <Icon className="w-4 h-4" style={{ color: config.color }} />
          </div>

          {/* Title & Description */}
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm ${isEnabled ? 'text-[#1A1A1A]' : 'text-[#666]'}`}>
              {displayTitle}
            </h3>
            <p className="text-xs text-[#888] mt-0.5">{displayDescription}</p>
          </div>

          {/* Expand/Collapse (only if enabled and has children) */}
          {isEnabled && children && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="p-1.5 text-[#888] hover:text-[#1A1A1A] transition-colors duration-200"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isEnabled && isExpanded && children && (
        <div className="px-4 pb-4 pt-0 border-t border-[#E5E5E5] mt-0">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function ModuleRow({ module, hours, isSelected, onToggle, onUpdateHours, isSpanish }) {
  const inputClasses = "w-16 px-2 py-1.5 text-sm bg-white border border-[#E5E5E5] rounded-lg text-[#1A1A1A] text-center focus:outline-none focus:border-[#FF6C5D] focus:ring-1 focus:ring-[#FF6C5D]/20";

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
      isSelected ? 'border-[#FF6C5D]/30 bg-white' : 'border-[#E5E5E5] bg-[#FAFAFA]'
    }`}>
      <button
        type="button"
        onClick={() => onToggle(module.value)}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          isSelected ? 'border-[#FF6C5D] bg-[#FF6C5D]' : 'border-[#D1D5DB] bg-white'
        }`}
      >
        {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </button>
      <span className={`flex-1 text-sm ${isSelected ? 'text-[#1A1A1A] font-medium' : 'text-[#666]'}`}>
        {isSpanish ? (module.label_es || module.label) : module.label}
      </span>
      {isSelected && (
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            value={hours}
            onChange={(e) => onUpdateHours(module.value, parseFloat(e.target.value) || 0)}
            min={1}
            className={inputClasses}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-xs text-[#888]">h</span>
        </div>
      )}
    </div>
  );
}

export default function PhaseConfigurator({
  responses,
  onUpdateResponse,
  availableModules,
  selectedModules,
  onToggleModule,
  onUpdateModuleHours,
  customModules,
  onAddCustomModule,
  onRemoveCustomModule,
  onUpdateCustomModule,
  language = 'English'
}) {
  const isSpanish = language === 'Spanish';
  const [expandedPhases, setExpandedPhases] = React.useState({
    clarity: true,
    implementation: true,
    adoption: true
  });

  const togglePhaseExpand = (phase) => {
    setExpandedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  const inputClasses = "w-full px-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder-[#999] transition-all duration-200 focus:outline-none focus:border-[#FF6C5D] focus:ring-2 focus:ring-[#FF6C5D]/10";
  const labelClasses = "block text-xs font-medium text-[#888] mb-1.5";

  // Calculate hours
  const clarityHours = parseFloat(responses.clarity_hours) || 0;
  const implementationHours = Object.values(responses.module_hours || {}).reduce((sum, h) => sum + (parseFloat(h) || 0), 0) +
    (customModules || []).reduce((sum, m) => sum + (parseFloat(m.hours) || 0), 0);
  const adoptionHours = (parseFloat(responses.training_hours) || 0) +
    (parseFloat(responses.go_live_hours) || 0) +
    ((parseFloat(responses.support_hours_per_month) || 0) * (parseInt(responses.support_months) || 0));
  const totalHours =
    (responses.clarity_phase ? clarityHours : 0) +
    (responses.implementation_phase ? implementationHours : 0) +
    (responses.adoption_phase ? adoptionHours : 0);

  // Filter popular modules for initial display
  const popularModules = availableModules.filter(m => m.popular);
  const [showAllModules, setShowAllModules] = React.useState(false);
  const displayModules = showAllModules ? availableModules : popularModules;

  return (
    <div className="space-y-4">
      {/* Clarity Phase */}
      <PhaseCard
        phase="clarity"
        title="Clarity Phase"
        titleEs="Fase de Claridad"
        description="Discovery & Requirements"
        descriptionEs="Descubrimiento y Requisitos"
        isEnabled={responses.clarity_phase}
        onToggle={() => onUpdateResponse('clarity_phase', !responses.clarity_phase)}
        isExpanded={expandedPhases.clarity}
        onToggleExpand={() => togglePhaseExpand('clarity')}
        isSpanish={isSpanish}
      >
        <div className="space-y-4">
          <div>
            <label className={labelClasses}>
              {isSpanish ? 'Horas de Claridad' : 'Clarity Hours'} *
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={responses.clarity_hours || ''}
                onChange={(e) => onUpdateResponse('clarity_hours', parseFloat(e.target.value) || 0)}
                placeholder="40"
                min={0}
                className={inputClasses}
                style={{ maxWidth: '120px' }}
              />
              <span className="text-sm text-[#888]">{isSpanish ? 'horas' : 'hours'}</span>
            </div>
          </div>
        </div>
      </PhaseCard>

      {/* Implementation Phase */}
      <PhaseCard
        phase="implementation"
        title="Implementation Phase"
        titleEs="Fase de Implementación"
        description="Configuration & Setup"
        descriptionEs="Configuración y Setup"
        isEnabled={responses.implementation_phase}
        onToggle={() => onUpdateResponse('implementation_phase', !responses.implementation_phase)}
        isExpanded={expandedPhases.implementation}
        onToggleExpand={() => togglePhaseExpand('implementation')}
        isSpanish={isSpanish}
      >
        <div className="space-y-5">
          {/* Modules Grid */}
          <div>
            <label className={labelClasses}>
              {isSpanish ? 'Módulos a Implementar' : 'Modules to Implement'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {displayModules.map((module) => (
                <ModuleRow
                  key={module.value}
                  module={module}
                  hours={responses.module_hours?.[module.value] || 20}
                  isSelected={selectedModules.includes(module.value)}
                  onToggle={onToggleModule}
                  onUpdateHours={onUpdateModuleHours}
                  isSpanish={isSpanish}
                />
              ))}
            </div>
            {availableModules.length > popularModules.length && (
              <button
                type="button"
                onClick={() => setShowAllModules(!showAllModules)}
                className="mt-2 text-xs text-[#FF6C5D] hover:text-[#E5564A] font-medium"
              >
                {showAllModules
                  ? (isSpanish ? 'Mostrar menos' : 'Show less')
                  : (isSpanish ? `Mostrar ${availableModules.length - popularModules.length} más` : `Show ${availableModules.length - popularModules.length} more`)
                }
              </button>
            )}
          </div>

          {/* Custom Modules */}
          {customModules && customModules.length > 0 && (
            <div>
              <label className={labelClasses}>
                {isSpanish ? 'Módulos Personalizados' : 'Custom Modules'}
              </label>
              <div className="space-y-2">
                {customModules.map((mod, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-3 bg-white border border-[#E5E5E5] rounded-lg">
                    <Code className="w-4 h-4 text-[#FF6C5D] flex-shrink-0" />
                    <input
                      type="text"
                      value={mod.name || ''}
                      onChange={(e) => onUpdateCustomModule(idx, 'name', e.target.value)}
                      placeholder={isSpanish ? 'Nombre del módulo' : 'Module name'}
                      className="flex-1 text-sm bg-transparent border-none focus:outline-none text-[#1A1A1A]"
                    />
                    <input
                      type="number"
                      value={mod.hours || 20}
                      onChange={(e) => onUpdateCustomModule(idx, 'hours', parseFloat(e.target.value) || 0)}
                      min={1}
                      className="w-16 px-2 py-1 text-sm bg-[#FAFAFA] border border-[#E5E5E5] rounded text-center focus:outline-none focus:border-[#FF6C5D]"
                    />
                    <span className="text-xs text-[#888]">h</span>
                    <button
                      type="button"
                      onClick={() => onRemoveCustomModule(idx)}
                      className="p-1 text-[#999] hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Custom Module Button */}
          <button
            type="button"
            onClick={onAddCustomModule}
            className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-[#D1D5DB] rounded-lg text-[#888] hover:border-[#FF6C5D] hover:text-[#FF6C5D] transition-all duration-200 text-sm"
          >
            <Plus className="w-4 h-4" />
            {isSpanish ? 'Agregar Módulo Personalizado' : 'Add Custom Module'}
          </button>

          {/* Integrations */}
          <div className="pt-3 border-t border-[#E5E5E5]">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={responses.integrations === 'Yes'}
                onChange={(e) => onUpdateResponse('integrations', e.target.checked ? 'Yes' : 'No')}
                className="w-4 h-4 rounded border-[#D1D5DB] text-[#FF6C5D] focus:ring-[#FF6C5D]/20"
              />
              <span className="text-sm text-[#1A1A1A]">
                {isSpanish ? 'Integraciones con sistemas externos' : 'External system integrations'}
              </span>
            </label>
            {responses.integrations === 'Yes' && (
              <div className="mt-3 ml-7">
                <input
                  type="text"
                  value={responses.integration_list || ''}
                  onChange={(e) => onUpdateResponse('integration_list', e.target.value)}
                  placeholder={isSpanish ? 'ej. Shopify, Stripe, FedEx' : 'e.g., Shopify, Stripe, FedEx'}
                  className={inputClasses}
                />
              </div>
            )}
          </div>

          {/* Multi-warehouse (if Inventory selected) */}
          {selectedModules.some(m => m.toLowerCase().includes('inventory')) && (
            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={responses.multi_warehouse === 'Yes'}
                  onChange={(e) => onUpdateResponse('multi_warehouse', e.target.checked ? 'Yes' : 'No')}
                  className="w-4 h-4 rounded border-[#D1D5DB] text-[#FF6C5D] focus:ring-[#FF6C5D]/20"
                />
                <span className="text-sm text-[#1A1A1A]">
                  {isSpanish ? 'Múltiples almacenes' : 'Multiple warehouses'}
                </span>
              </label>
              {responses.multi_warehouse === 'Yes' && (
                <div className="mt-3 ml-7 flex items-center gap-2">
                  <input
                    type="number"
                    value={responses.warehouse_count || 2}
                    onChange={(e) => onUpdateResponse('warehouse_count', parseInt(e.target.value) || 2)}
                    min={2}
                    className={inputClasses}
                    style={{ maxWidth: '80px' }}
                  />
                  <span className="text-sm text-[#888]">{isSpanish ? 'almacenes' : 'warehouses'}</span>
                </div>
              )}
            </div>
          )}

          {/* Implementation Hours Summary */}
          {implementationHours > 0 && (
            <div className="p-3 bg-[#1A1A1A] rounded-lg flex items-center justify-between">
              <span className="text-sm text-[#999]">{isSpanish ? 'Total Implementación' : 'Implementation Total'}</span>
              <span className="text-lg font-bold text-white">{implementationHours}<span className="text-[#FF6C5D]">h</span></span>
            </div>
          )}
        </div>
      </PhaseCard>

      {/* Adoption Phase */}
      <PhaseCard
        phase="adoption"
        title="Adoption Phase"
        titleEs="Fase de Adopción"
        description="Training & Support"
        descriptionEs="Capacitación y Soporte"
        isEnabled={responses.adoption_phase}
        onToggle={() => onUpdateResponse('adoption_phase', !responses.adoption_phase)}
        isExpanded={expandedPhases.adoption}
        onToggleExpand={() => togglePhaseExpand('adoption')}
        isSpanish={isSpanish}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                {isSpanish ? 'Horas de Capacitación' : 'Training Hours'}
              </label>
              <input
                type="number"
                value={responses.training_hours || ''}
                onChange={(e) => onUpdateResponse('training_hours', parseFloat(e.target.value) || 0)}
                placeholder="24"
                min={0}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>
                {isSpanish ? 'Horas de Go-Live' : 'Go-Live Hours'}
              </label>
              <input
                type="number"
                value={responses.go_live_hours || ''}
                onChange={(e) => onUpdateResponse('go_live_hours', parseFloat(e.target.value) || 0)}
                placeholder="8"
                min={0}
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClasses}>
                {isSpanish ? 'Horas de Soporte / Mes' : 'Support Hours / Month'}
              </label>
              <input
                type="number"
                value={responses.support_hours_per_month || ''}
                onChange={(e) => onUpdateResponse('support_hours_per_month', parseFloat(e.target.value) || 0)}
                placeholder="10"
                min={0}
                className={inputClasses}
              />
            </div>
            <div>
              <label className={labelClasses}>
                {isSpanish ? 'Meses de Soporte' : 'Support Months'}
              </label>
              <input
                type="number"
                value={responses.support_months || ''}
                onChange={(e) => onUpdateResponse('support_months', parseInt(e.target.value) || 0)}
                placeholder="3"
                min={0}
                className={inputClasses}
              />
            </div>
          </div>

          {/* Adoption Hours Summary */}
          {adoptionHours > 0 && (
            <div className="p-3 bg-[#1A1A1A] rounded-lg flex items-center justify-between">
              <span className="text-sm text-[#999]">{isSpanish ? 'Total Adopción' : 'Adoption Total'}</span>
              <span className="text-lg font-bold text-white">{adoptionHours}<span className="text-[#FF6C5D]">h</span></span>
            </div>
          )}
        </div>
      </PhaseCard>

      {/* Grand Total */}
      <div className="bg-[#1A1A1A] rounded-xl p-5">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#FF6C5D]" />
            <span className="text-sm text-[#999]">
              {isSpanish ? 'Horas Totales del Proyecto' : 'Total Project Hours'}
            </span>
          </div>
          <span className="text-3xl font-bold text-white">{totalHours}<span className="text-[#FF6C5D]">h</span></span>
        </div>
        {(responses.clarity_phase || responses.implementation_phase || responses.adoption_phase) && (
          <div className="mt-4 pt-4 border-t border-[#333] grid grid-cols-3 gap-4">
            {responses.clarity_phase && (
              <div>
                <div className="text-xs text-[#666] uppercase tracking-wide">{isSpanish ? 'Claridad' : 'Clarity'}</div>
                <div className="text-white font-semibold mt-1">{clarityHours}h</div>
              </div>
            )}
            {responses.implementation_phase && (
              <div>
                <div className="text-xs text-[#666] uppercase tracking-wide">{isSpanish ? 'Implementación' : 'Implementation'}</div>
                <div className="text-white font-semibold mt-1">{implementationHours}h</div>
              </div>
            )}
            {responses.adoption_phase && (
              <div>
                <div className="text-xs text-[#666] uppercase tracking-wide">{isSpanish ? 'Adopción' : 'Adoption'}</div>
                <div className="text-white font-semibold mt-1">{adoptionHours}h</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
