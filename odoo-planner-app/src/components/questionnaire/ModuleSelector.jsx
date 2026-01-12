/**
 * ModuleSelector Component
 * Grid of Odoo modules with individual hours input per module
 * V3.3 - Refined design inspired by Notion, Clay, Claude
 */

import React, { useState } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, Trash2, Code, Clock } from 'lucide-react';

export default function ModuleSelector({
  modules,
  selectedModules,
  moduleHours,
  onToggle,
  onUpdateHours,
  customModules,
  onAddCustomModule,
  onRemoveCustomModule,
  onUpdateCustomModule,
  language = 'English'
}) {
  const [showAll, setShowAll] = useState(false);
  const isSpanish = language === 'Spanish';

  const popularModules = modules.filter(m => m.popular);
  const otherModules = modules.filter(m => !m.popular);
  const visibleModules = showAll ? modules : popularModules;

  // Calculate total hours
  const standardModuleHours = selectedModules.reduce((sum, mod) => {
    return sum + (moduleHours[mod] || 20);
  }, 0);
  const customModuleHours = customModules.reduce((sum, mod) => sum + (mod.hours || 20), 0);
  const totalImplementationHours = standardModuleHours + customModuleHours;

  const inputClasses = "w-full px-3 py-2 text-sm bg-white border border-[#E5E5E5] rounded-lg text-[#1A1A1A] placeholder-[#999] transition-all duration-200 focus:outline-none focus:border-[#FF6C5D] focus:ring-2 focus:ring-[#FF6C5D]/10";

  return (
    <div className="space-y-6">
      {/* Section Title */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">
          {isSpanish ? 'Módulos a Implementar' : 'Modules to Implement'}
        </label>
        <p className="text-sm text-[#888]">
          {isSpanish
            ? 'Selecciona módulos y asigna horas a cada uno'
            : 'Select modules and assign hours to each one'}
        </p>
      </div>

      {/* Standard Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {visibleModules.map((module) => {
          const isSelected = selectedModules.includes(module.value);
          const hours = moduleHours[module.value] || 20;

          return (
            <div
              key={module.value}
              className={`
                relative rounded-lg border transition-all duration-200
                ${isSelected
                  ? 'border-[#FF6C5D] bg-[#FF6C5D]/5'
                  : 'border-[#E5E5E5] bg-white hover:border-[#FF6C5D]/30'
                }
              `}
            >
              {/* Module Header */}
              <button
                type="button"
                onClick={() => onToggle(module.value)}
                className="w-full p-4 text-left flex items-center gap-3"
              >
                {/* Checkbox indicator */}
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200
                  ${isSelected
                    ? 'bg-[#FF6C5D] border-[#FF6C5D]'
                    : 'border-[#D1D5DB] bg-white'
                  }
                `}>
                  {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>

                {/* Module name */}
                <div className="flex-1">
                  <span className={`text-sm font-medium ${isSelected ? 'text-[#1A1A1A]' : 'text-[#666]'}`}>
                    {isSpanish ? (module.label_es || module.label) : module.label}
                  </span>
                  {module.popular && !isSelected && (
                    <span className="ml-2 text-xs text-[#999]">
                      {isSpanish ? 'Popular' : 'Popular'}
                    </span>
                  )}
                </div>
              </button>

              {/* Hours Input (only shown when selected) */}
              {isSelected && (
                <div className="px-4 pb-4 pt-0">
                  <div className="flex items-center gap-2 bg-white rounded-lg border border-[#E5E5E5] px-3 py-2">
                    <Clock className="w-4 h-4 text-[#888]" />
                    <input
                      type="number"
                      value={hours}
                      onChange={(e) => onUpdateHours(module.value, parseFloat(e.target.value) || 0)}
                      min={1}
                      className="w-16 text-sm font-medium text-[#1A1A1A] bg-transparent border-none focus:outline-none focus:ring-0"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="text-sm text-[#888]">
                      {isSpanish ? 'horas' : 'hours'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more/less toggle */}
      {otherModules.length > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="flex items-center gap-2 text-sm text-[#FF6C5D] hover:text-[#E5564A] font-medium transition-colors duration-200"
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              {isSpanish ? 'Mostrar menos' : 'Show less'}
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              {isSpanish ? `Mostrar ${otherModules.length} más` : `Show ${otherModules.length} more`}
            </>
          )}
        </button>
      )}

      {/* Divider */}
      <div className="border-t border-[#E5E5E5] pt-6">
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-1">
          {isSpanish ? 'Módulos Personalizados' : 'Custom Modules'}
        </label>
        <p className="text-sm text-[#888] mb-4">
          {isSpanish
            ? 'Agrega desarrollos personalizados específicos para tu negocio'
            : 'Add custom developments specific to your business'}
        </p>

        {/* Custom Modules List */}
        <div className="space-y-3">
          {customModules.map((customModule, index) => (
            <div
              key={index}
              className="bg-white border border-[#E5E5E5] rounded-lg p-4"
            >
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="w-9 h-9 bg-[#FF6C5D]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-4 h-4 text-[#FF6C5D]" />
                </div>

                {/* Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Name */}
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">
                      {isSpanish ? 'Nombre' : 'Name'} *
                    </label>
                    <input
                      type="text"
                      value={customModule.name || ''}
                      onChange={(e) => onUpdateCustomModule(index, 'name', e.target.value)}
                      placeholder={isSpanish ? 'ej. Backlog Facturación' : 'e.g., Billing Backlog'}
                      className={inputClasses}
                    />
                  </div>

                  {/* Hours */}
                  <div>
                    <label className="block text-xs font-medium text-[#888] mb-1.5">
                      {isSpanish ? 'Horas' : 'Hours'} *
                    </label>
                    <input
                      type="number"
                      value={customModule.hours || 20}
                      onChange={(e) => onUpdateCustomModule(index, 'hours', parseFloat(e.target.value) || 0)}
                      min={1}
                      className={inputClasses}
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-1">
                    <label className="block text-xs font-medium text-[#888] mb-1.5">
                      {isSpanish ? 'Descripción' : 'Description'}
                    </label>
                    <input
                      type="text"
                      value={customModule.description || ''}
                      onChange={(e) => onUpdateCustomModule(index, 'description', e.target.value)}
                      placeholder={isSpanish ? 'Descripción breve...' : 'Brief description...'}
                      className={inputClasses}
                    />
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => onRemoveCustomModule(index)}
                  className="p-2 text-[#999] hover:text-red-500 transition-colors duration-200"
                  title={isSpanish ? 'Eliminar' : 'Remove'}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Custom Module Button */}
        <button
          type="button"
          onClick={onAddCustomModule}
          className="mt-3 w-full flex items-center justify-center gap-2 p-4 border border-dashed border-[#D1D5DB] rounded-lg text-[#888] hover:border-[#FF6C5D] hover:text-[#FF6C5D] transition-all duration-200"
        >
          <Plus className="w-4 h-4" />
          {isSpanish ? 'Agregar Módulo Personalizado' : 'Add Custom Module'}
        </button>
      </div>

      {/* Total Implementation Hours */}
      <div className="bg-[#1A1A1A] rounded-xl p-5">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-[#999]">
              {isSpanish ? 'Total Horas de Implementación' : 'Total Implementation Hours'}
            </span>
            <div className="text-xs text-[#666] mt-1">
              {selectedModules.length} {isSpanish ? 'módulos' : 'modules'} + {customModules.length} {isSpanish ? 'personalizados' : 'custom'}
            </div>
          </div>
          <div className="text-3xl font-bold text-white">
            {totalImplementationHours}<span className="text-[#FF6C5D]">h</span>
          </div>
        </div>
      </div>
    </div>
  );
}
