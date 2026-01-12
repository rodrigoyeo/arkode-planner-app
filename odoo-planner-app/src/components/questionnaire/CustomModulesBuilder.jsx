/**
 * CustomModulesBuilder Component
 * Interface for adding custom development modules
 */

import React from 'react';
import { Plus, Trash2, Code } from 'lucide-react';

export default function CustomModulesBuilder({
  responses,
  onUpdateResponse,
  onAddModule,
  onRemoveModule,
  language = 'English'
}) {
  const isSpanish = language === 'Spanish';
  const customModulesCount = responses.custom_modules_count || 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isSpanish ? 'Módulos Personalizados' : 'Custom Modules'}
        </h2>
        <p className="text-gray-600">
          {isSpanish
            ? 'Define módulos de desarrollo personalizado para tu proyecto'
            : 'Define custom development modules for your project'}
        </p>
      </div>

      {/* Custom modules list */}
      <div className="space-y-4">
        {Array.from({ length: customModulesCount }, (_, index) => {
          const i = index + 1;
          return (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Code className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">
                      {isSpanish ? 'Módulo Personalizado' : 'Custom Module'} #{i}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveModule(i)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  title={isSpanish ? 'Eliminar módulo' : 'Remove module'}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Module Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isSpanish ? 'Nombre del Módulo' : 'Module Name'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="text"
                    value={responses[`custom_module_${i}_name`] || ''}
                    onChange={(e) => onUpdateResponse(`custom_module_${i}_name`, e.target.value)}
                    placeholder={isSpanish ? 'ej. Backlog Facturación' : 'e.g., Billing Backlog'}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>

                {/* Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isSpanish ? 'Horas Estimadas' : 'Estimated Hours'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input
                    type="number"
                    value={responses[`custom_module_${i}_hours`] || 20}
                    onChange={(e) => onUpdateResponse(`custom_module_${i}_hours`, parseFloat(e.target.value) || 0)}
                    min={1}
                    placeholder="20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isSpanish ? 'Descripción (para IA)' : 'Description (for AI)'}
                </label>
                <textarea
                  value={responses[`custom_module_${i}_description`] || ''}
                  onChange={(e) => onUpdateResponse(`custom_module_${i}_description`, e.target.value)}
                  placeholder={isSpanish
                    ? 'Describe brevemente qué debe hacer este módulo. La IA usará esto para generar tareas específicas.'
                    : 'Briefly describe what this module should do. AI will use this to generate specific tasks.'}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {isSpanish
                    ? 'La IA generará 2-3 tareas específicas basadas en esta descripción'
                    : 'AI will generate 2-3 specific tasks based on this description'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add module button */}
      <button
        type="button"
        onClick={onAddModule}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-purple-400 hover:text-purple-600 transition-colors"
      >
        <Plus className="w-5 h-5" />
        {isSpanish ? 'Agregar Módulo Personalizado' : 'Add Custom Module'}
      </button>

      {/* Info box */}
      {customModulesCount === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            {isSpanish
              ? 'Los módulos personalizados son desarrollos específicos para tu negocio que no están cubiertos por los módulos estándar de Odoo. Cada módulo generará tareas de diseño, desarrollo, testing y documentación.'
              : 'Custom modules are specific developments for your business that are not covered by standard Odoo modules. Each module will generate design, development, testing, and documentation tasks.'}
          </p>
        </div>
      )}

      {/* Summary */}
      {customModulesCount > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-purple-700">
              {customModulesCount} {isSpanish ? 'módulos personalizados' : 'custom modules'}
            </span>
            <span className="text-sm font-medium text-purple-700">
              {Array.from({ length: customModulesCount }, (_, i) =>
                parseFloat(responses[`custom_module_${i + 1}_hours`]) || 0
              ).reduce((sum, h) => sum + h, 0)}h {isSpanish ? 'total' : 'total'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
