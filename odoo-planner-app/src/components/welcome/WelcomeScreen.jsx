/**
 * WelcomeScreen Component
 * Landing page for the Odoo Implementation Planner
 * V3.3 - Refined design inspired by Notion, Clay, Claude
 */

import React from 'react';
import { Calendar, Users, FileCheck, ArrowRight, Target, Layers } from 'lucide-react';

export default function WelcomeScreen({ onStart, language = 'English' }) {
  const isSpanish = language === 'Spanish';

  const features = [
    {
      icon: Target,
      title: isSpanish ? 'Horas por Módulo' : 'Hours per Module',
      description: isSpanish
        ? 'Asigna horas específicas a cada módulo de Odoo'
        : 'Assign specific hours to each Odoo module'
    },
    {
      icon: Calendar,
      title: isSpanish ? 'Planes de PM Senior' : 'Senior PM Plans',
      description: isSpanish
        ? 'Genera planes estructurados como un Project Manager senior'
        : 'Generate structured plans like a senior Project Manager'
    },
    {
      icon: Users,
      title: isSpanish ? 'Asignación de Equipo' : 'Team Assignment',
      description: isSpanish
        ? 'Asigna consultores automáticamente basado en roles'
        : 'Automatically assign consultants based on roles'
    },
    {
      icon: FileCheck,
      title: isSpanish ? 'Exportación a Odoo' : 'Export to Odoo',
      description: isSpanish
        ? 'Exporta directamente a formato CSV de Odoo Projects'
        : 'Export directly to Odoo Projects CSV format'
    }
  ];

  const stats = [
    { value: '10-20', label: isSpanish ? 'Paquetes de trabajo' : 'Work packages' },
    { value: '3', label: isSpanish ? 'Fases del proyecto' : 'Project phases' },
    { value: '4', label: isSpanish ? 'Plantillas' : 'Templates' }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] relative overflow-hidden">
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Ccircle cx='1' cy='1' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header bar */}
        <header className="px-8 py-6">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FF6C5D] rounded-lg flex items-center justify-center">
                <Layers className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-[#1A1A1A] tracking-tight">Arkode</span>
            </div>
            <span className="text-xs text-[#999] font-medium tracking-wide uppercase">
              v3.3
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center px-8 py-12">
          <div className="max-w-5xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left column - Hero */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#FF6C5D]/8 rounded-full mb-8">
                  <div className="w-1.5 h-1.5 bg-[#FF6C5D] rounded-full" />
                  <span className="text-xs font-medium text-[#FF6C5D] tracking-wide">
                    {isSpanish ? 'Planificación de Proyectos' : 'Project Planning'}
                  </span>
                </div>

                <h1 className="text-[2.75rem] leading-[1.1] font-bold text-[#1A1A1A] tracking-tight mb-6">
                  {isSpanish ? (
                    <>
                      Planificador de
                      <br />
                      <span className="text-[#FF6C5D]">Implementación</span>
                    </>
                  ) : (
                    <>
                      Implementation
                      <br />
                      <span className="text-[#FF6C5D]">Planner</span>
                    </>
                  )}
                </h1>

                <p className="text-lg text-[#666] leading-relaxed mb-10 max-w-md">
                  {isSpanish
                    ? 'Genera planes de proyecto de calidad profesional para implementaciones de Odoo en minutos.'
                    : 'Generate professional-quality project plans for Odoo implementations in minutes.'}
                </p>

                <button
                  onClick={onStart}
                  className="group inline-flex items-center gap-3 bg-[#1A1A1A] text-white px-8 py-4 rounded-xl font-semibold text-base transition-all duration-200 hover:bg-[#333] hover:translate-y-[-2px] active:translate-y-0"
                >
                  {isSpanish ? 'Comenzar Planificación' : 'Start Planning'}
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>

                <p className="mt-5 text-sm text-[#999]">
                  {isSpanish ? '3-5 minutos • Sin registro' : '3-5 minutes • No signup required'}
                </p>
              </div>

              {/* Right column - Features */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="group bg-white rounded-xl p-5 border border-[#E5E5E5] transition-all duration-200 hover:border-[#FF6C5D]/30 hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-[#FAFAFA] border border-[#E5E5E5] rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-200 group-hover:bg-[#FF6C5D]/5 group-hover:border-[#FF6C5D]/20">
                        <feature.icon className="w-5 h-5 text-[#666] transition-colors duration-200 group-hover:text-[#FF6C5D]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#1A1A1A] mb-1">{feature.title}</h3>
                        <p className="text-sm text-[#888] leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Footer with stats */}
        <footer className="px-8 py-8 border-t border-[#E5E5E5]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-10">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-[#FF6C5D]">{stat.value}</span>
                    <span className="text-sm text-[#888]">{stat.label}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#999]">
                {isSpanish ? 'Desarrollado por' : 'Powered by'}{' '}
                <span className="font-semibold text-[#1A1A1A]">Arkode</span>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
