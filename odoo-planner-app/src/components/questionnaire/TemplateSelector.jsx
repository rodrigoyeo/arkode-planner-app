/**
 * TemplateSelector Component
 * Displays template cards for quick project setup
 * V3.3 - Refined design inspired by Notion, Clay, Claude
 */

import React from 'react';
import { Rocket, TrendingUp, Building2, Settings, Check, Clock } from 'lucide-react';

const iconMap = {
  Rocket: Rocket,
  TrendingUp: TrendingUp,
  Building2: Building2,
  Settings: Settings
};

function TemplateCard({ template, isSelected, onSelect, language }) {
  const Icon = iconMap[template.icon] || Settings;
  const isSpanish = language === 'Spanish';

  return (
    <button
      onClick={() => onSelect(template.id)}
      className={`
        relative p-5 rounded-xl border text-left transition-all duration-200
        ${isSelected
          ? 'border-[#FF6C5D] bg-[#FF6C5D]/5'
          : 'border-[#E5E5E5] bg-white hover:border-[#FF6C5D]/40'
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-4 right-4">
          <div className="w-5 h-5 rounded-full bg-[#FF6C5D] flex items-center justify-center">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        </div>
      )}

      {/* Icon */}
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-colors duration-200 ${
        isSelected ? 'bg-[#FF6C5D]/10' : 'bg-[#F5F5F5]'
      }`}>
        <Icon className={`w-5 h-5 transition-colors duration-200 ${
          isSelected ? 'text-[#FF6C5D]' : 'text-[#666]'
        }`} />
      </div>

      {/* Title */}
      <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">
        {isSpanish ? template.name_es : template.name}
      </h3>

      {/* Description */}
      <p className="text-sm text-[#888] mb-4 leading-relaxed">
        {isSpanish ? template.description_es : template.description}
      </p>

      {/* Template details (not for custom) */}
      {template.id !== 'custom' && (
        <div className="space-y-3">
          {/* Modules */}
          <div className="flex flex-wrap gap-1.5">
            {template.modules?.slice(0, 3).map(module => (
              <span key={module} className="text-xs px-2 py-1 bg-[#F5F5F5] text-[#666] rounded">
                {module}
              </span>
            ))}
            {template.modules?.length > 3 && (
              <span className="text-xs px-2 py-1 bg-[#F5F5F5] text-[#666] rounded">
                +{template.modules.length - 3}
              </span>
            )}
          </div>

          {/* Hours and duration */}
          {template.phases && (
            <div className="flex items-center gap-3 text-xs text-[#888]">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                ~{(template.phases.clarity?.hours || 0) + (template.phases.implementation?.hours || 0) + (template.phases.adoption?.hours || 0)}h
              </span>
              <span className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
              <span>
                {template.phases.clarity?.weeks + template.phases.implementation?.weeks + template.phases.adoption?.weeks}{' '}
                {isSpanish ? 'semanas' : 'weeks'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Custom template message */}
      {template.id === 'custom' && (
        <p className="text-sm text-[#888] italic">
          {isSpanish
            ? 'Configura todos los parámetros manualmente'
            : 'Configure all parameters manually'}
        </p>
      )}
    </button>
  );
}

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelectTemplate,
  language = 'English'
}) {
  const isSpanish = language === 'Spanish';

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">
          {isSpanish ? 'Elige tu Plantilla de Proyecto' : 'Choose Your Project Template'}
        </h2>
        <p className="text-sm text-[#888]">
          {isSpanish
            ? 'Selecciona una plantilla para pre-configurar tu proyecto rápidamente'
            : 'Select a template to quickly pre-configure your project'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            isSelected={selectedTemplate === template.id}
            onSelect={onSelectTemplate}
            language={language}
          />
        ))}
      </div>

      {selectedTemplate && selectedTemplate !== 'custom' && (
        <div className="mt-4 p-4 bg-[#FF6C5D]/5 border border-[#FF6C5D]/20 rounded-lg">
          <p className="text-sm text-[#1A1A1A]">
            <span className="font-medium text-[#FF6C5D]">
              {isSpanish ? 'Plantilla seleccionada:' : 'Selected:'}
            </span>{' '}
            {templates.find(t => t.id === selectedTemplate)?.[isSpanish ? 'name_es' : 'name']}
            <span className="text-[#888] ml-1">
              — {isSpanish
                ? 'Los valores serán pre-llenados'
                : 'Values will be pre-filled'}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
