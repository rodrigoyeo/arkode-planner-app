/**
 * PlanDisplay Component
 * Displays the generated project plan with clean, minimalistic layout
 * V3.3 - Refined design inspired by Notion, Clay, Claude
 */

import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Download,
  RefreshCw,
  Trash2,
  Clock,
  Users,
  Calendar,
  Package,
  Target,
  GraduationCap,
  Layers,
  Flag,
  ListTodo
} from 'lucide-react';
import { exportAll, exportTasksCSV, exportMilestonesCSV, exportProjectCSV, exportDeliverablesOnlyCSV } from '../../services/csvExporter';

// Phase icons
const phaseIcons = {
  Clarity: Target,
  Implementation: Package,
  Adoption: GraduationCap
};

// Phase colors - refined, subtle
const phaseColors = {
  Clarity: {
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    header: 'bg-slate-700',
    accent: '#64748b'
  },
  Implementation: {
    bg: 'bg-[#FF6C5D]/5',
    border: 'border-[#FF6C5D]/20',
    header: 'bg-[#FF6C5D]',
    accent: '#FF6C5D'
  },
  Adoption: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    header: 'bg-emerald-600',
    accent: '#059669'
  }
};

function WorkPackageCard({ deliverable, isExpanded, onToggleExpand, onDeleteTask, deletedTaskIds }) {
  const colors = phaseColors[deliverable.phase] || phaseColors.Implementation;
  const hasSubtasks = deliverable.subtasks && deliverable.subtasks.length > 0;
  const isDeleted = deletedTaskIds.has(deliverable.id);

  return (
    <div className={`bg-white border border-[#E5E5E5] rounded-lg transition-all duration-200 ${isDeleted ? 'opacity-40' : 'hover:border-[#D1D5DB]'}`}>
      {/* Work Package Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => hasSubtasks && onToggleExpand(deliverable.id)}
      >
        <div className="flex items-center gap-3">
          {/* Expand/Collapse */}
          <div className="w-5 flex-shrink-0">
            {hasSubtasks ? (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-[#888]" />
              ) : (
                <ChevronRight className="w-4 h-4 text-[#888]" />
              )
            ) : (
              <div className="w-4" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-[#1A1A1A] text-sm">
              {deliverable.title}
            </h4>
            {deliverable.description && (
              <p className="text-xs text-[#888] mt-0.5 line-clamp-1">
                {deliverable.description}
              </p>
            )}
          </div>

          {/* Hours */}
          <div className="flex items-center gap-1.5 text-sm text-[#666] flex-shrink-0">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-medium">{deliverable.allocated_hours}h</span>
          </div>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask(deliverable.id);
            }}
            className="p-1.5 text-[#D1D5DB] hover:text-red-500 transition-colors duration-200"
            title="Remove"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Subtasks */}
      {isExpanded && hasSubtasks && (
        <div className="border-t border-[#E5E5E5]">
          {deliverable.subtasks.map((subtask) => (
            <div
              key={subtask.id}
              className={`flex items-center gap-3 px-4 py-3 pl-12 border-b border-[#F5F5F5] last:border-b-0 ${
                deletedTaskIds.has(subtask.id) ? 'opacity-40 bg-red-50' : 'bg-[#FAFAFA]'
              }`}
            >
              {/* Bullet */}
              <div className="w-1.5 h-1.5 rounded-full bg-[#D1D5DB] flex-shrink-0" />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <span className="text-xs text-[#666]">
                  {subtask.title}
                </span>
              </div>

              {/* Hours */}
              <div className="flex items-center gap-1 text-xs text-[#888] flex-shrink-0">
                <Clock className="w-3 h-3" />
                <span>{subtask.allocated_hours}h</span>
              </div>

              {/* Delete subtask */}
              <button
                onClick={() => onDeleteTask(subtask.id)}
                className="p-1 text-[#D1D5DB] hover:text-red-500 transition-colors duration-200"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PhaseSection({ phase, deliverables, expandedDeliverables, onToggleExpand, onDeleteTask, deletedTaskIds, isSpanish }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const phaseDeliverables = deliverables.filter(d => d.phase === phase);

  if (phaseDeliverables.length === 0) return null;

  const totalHours = phaseDeliverables.reduce((sum, d) => sum + d.allocated_hours, 0);
  const colors = phaseColors[phase];
  const PhaseIcon = phaseIcons[phase] || Package;

  const phaseLabels = {
    Clarity: { en: 'Clarity Phase', es: 'Fase de Claridad' },
    Implementation: { en: 'Implementation Phase', es: 'Fase de Implementación' },
    Adoption: { en: 'Adoption Phase', es: 'Fase de Adopción' }
  };

  return (
    <div className="mb-6">
      {/* Phase Header */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`w-full flex items-center justify-between px-4 py-3 ${colors.header} text-white rounded-t-lg transition-all duration-200`}
      >
        <div className="flex items-center gap-2">
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
          <PhaseIcon className="w-4 h-4" />
          <h3 className="text-sm font-semibold">
            {isSpanish ? phaseLabels[phase].es : phaseLabels[phase].en}
          </h3>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded ml-1">
            {phaseDeliverables.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Clock className="w-3.5 h-3.5" />
          <span className="font-medium">{totalHours}h</span>
        </div>
      </button>

      {/* Work Packages */}
      {!isCollapsed && (
        <div className={`${colors.bg} border-x ${colors.border} border-b rounded-b-lg p-3 space-y-2`}>
          {phaseDeliverables.map(deliverable => (
            <WorkPackageCard
              key={deliverable.id}
              deliverable={deliverable}
              isExpanded={expandedDeliverables.has(deliverable.id)}
              onToggleExpand={onToggleExpand}
              onDeleteTask={onDeleteTask}
              deletedTaskIds={deletedTaskIds}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Milestones View Component
 */
function MilestonesView({ milestones, isSpanish }) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-8 text-center">
        <Flag className="w-10 h-10 text-[#D1D5DB] mx-auto mb-3" />
        <p className="text-sm text-[#888]">
          {isSpanish ? 'No hay hitos en este plan' : 'No milestones in this plan'}
        </p>
      </div>
    );
  }

  // Group milestones by phase
  const clarityMilestones = milestones.filter(m => m.phase === 'Clarity').sort((a, b) => a.order - b.order);
  const implMilestones = milestones.filter(m => m.phase === 'Implementation').sort((a, b) => a.order - b.order);
  const adoptionMilestones = milestones.filter(m => m.phase === 'Adoption').sort((a, b) => a.order - b.order);

  const phaseLabels = {
    Clarity: { en: 'Clarity', es: 'Claridad' },
    Implementation: { en: 'Implementation', es: 'Implementación' },
    Adoption: { en: 'Adoption', es: 'Adopción' }
  };

  const renderMilestoneGroup = (phase, phaseMilestones) => {
    if (phaseMilestones.length === 0) return null;
    const colors = phaseColors[phase];

    return (
      <div key={phase} className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: colors.accent }} />
          <h3 className="text-sm font-semibold text-[#1A1A1A]">
            {isSpanish ? phaseLabels[phase].es : phaseLabels[phase].en}
          </h3>
        </div>
        <div className="space-y-2 ml-5">
          {phaseMilestones.map((milestone, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-white border border-[#E5E5E5] rounded-lg p-4 hover:border-[#D1D5DB] transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${colors.accent}15` }}>
                <Flag className="w-4 h-4" style={{ color: colors.accent }} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-[#1A1A1A]">{milestone.name}</span>
              </div>
              <div className="text-xs text-[#888] bg-[#F5F5F5] px-2 py-1 rounded">
                #{milestone.order}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {renderMilestoneGroup('Clarity', clarityMilestones)}
      {renderMilestoneGroup('Implementation', implMilestones)}
      {renderMilestoneGroup('Adoption', adoptionMilestones)}
    </div>
  );
}

export default function PlanDisplay({
  plan,
  deliverables,
  flatTasks,
  stats,
  expandedDeliverables,
  onToggleExpand,
  onExpandAll,
  onCollapseAll,
  onDeleteTask,
  deletedTaskIds,
  responses,
  onReset
}) {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'milestones'
  const isSpanish = responses?.language === 'Spanish';

  const handleExport = (type) => {
    switch (type) {
      case 'all':
        exportAll(responses, deliverables, flatTasks, deletedTaskIds);
        break;
      case 'tasks':
        exportTasksCSV(responses, flatTasks, deletedTaskIds);
        break;
      case 'deliverables':
        exportDeliverablesOnlyCSV(responses, flatTasks, deletedTaskIds);
        break;
      case 'milestones':
        exportMilestonesCSV(responses);
        break;
      case 'project':
        exportProjectCSV(responses, deliverables);
        break;
    }
    setShowExportMenu(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Header */}
      <header className="px-8 py-5 border-b border-[#E5E5E5] bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#FF6C5D] rounded-md flex items-center justify-center">
              <Layers className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-[#1A1A1A] text-sm">Arkode Planner</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Project Header Card */}
          <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-bold text-[#1A1A1A]">
                  {plan?.project_info?.name || 'Project Plan'}
                </h1>
                <div className="flex items-center gap-4 text-[#888] text-sm mt-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {plan?.project_info?.client}
                  </span>
                  {plan?.project_info?.manager && (
                    <span className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5" />
                      PM: {plan?.project_info?.manager}
                    </span>
                  )}
                  {plan?.project_info?.deadline && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(plan.project_info.deadline).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Expand/Collapse */}
                <div className="flex border border-[#E5E5E5] rounded-lg">
                  <button
                    onClick={onCollapseAll}
                    className="p-2 text-[#888] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors duration-200 rounded-l-lg"
                    title={isSpanish ? 'Colapsar' : 'Collapse'}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onExpandAll}
                    className="p-2 text-[#888] hover:text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors duration-200 border-l border-[#E5E5E5] rounded-r-lg"
                    title={isSpanish ? 'Expandir' : 'Expand'}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1.5 bg-[#1A1A1A] text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#333]"
                  >
                    <Download className="w-3.5 h-3.5" />
                    {isSpanish ? 'Exportar' : 'Export'}
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg border border-[#E5E5E5] py-1 z-10 shadow-lg">
                      <button
                        onClick={() => handleExport('all')}
                        className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors duration-200"
                      >
                        {isSpanish ? 'Exportar Todo (3 CSV)' : 'Export All (3 CSVs)'}
                      </button>
                      <button
                        onClick={() => handleExport('tasks')}
                        className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors duration-200"
                      >
                        {isSpanish ? 'Solo Tareas' : 'Tasks Only'}
                      </button>
                      <button
                        onClick={() => handleExport('deliverables')}
                        className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors duration-200"
                      >
                        {isSpanish ? 'Solo Entregables' : 'Deliverables Only'}
                      </button>
                      <button
                        onClick={() => handleExport('milestones')}
                        className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors duration-200"
                      >
                        {isSpanish ? 'Solo Hitos' : 'Milestones Only'}
                      </button>
                      <button
                        onClick={() => handleExport('project')}
                        className="w-full text-left px-4 py-2 text-sm text-[#1A1A1A] hover:bg-[#F5F5F5] transition-colors duration-200"
                      >
                        {isSpanish ? 'Solo Proyecto' : 'Project Only'}
                      </button>
                    </div>
                  )}
                </div>

                {/* New Plan Button */}
                <button
                  onClick={onReset}
                  className="flex items-center gap-1.5 border border-[#E5E5E5] text-[#666] px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-[#F5F5F5] hover:text-[#1A1A1A]"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isSpanish ? 'Nuevo' : 'New'}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 pt-5 border-t border-[#E5E5E5] flex gap-8">
              <div>
                <span className="text-2xl font-bold text-[#1A1A1A]">{stats?.deliverableCount || 0}</span>
                <span className="text-xs text-[#888] ml-1.5">{isSpanish ? 'Paquetes' : 'Packages'}</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#1A1A1A]">{stats?.subtaskCount || 0}</span>
                <span className="text-xs text-[#888] ml-1.5">{isSpanish ? 'Subtareas' : 'Subtasks'}</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-[#FF6C5D]">{stats?.totalHours || 0}h</span>
                <span className="text-xs text-[#888] ml-1.5">{isSpanish ? 'Total' : 'Total'}</span>
              </div>
              {stats?.deletedCount > 0 && (
                <div>
                  <span className="text-2xl font-bold text-[#999]">{stats?.deletedCount}</span>
                  <span className="text-xs text-[#888] ml-1.5">{isSpanish ? 'Eliminadas' : 'Removed'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white border border-[#E5E5E5] rounded-lg p-1">
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'tasks'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#666] hover:bg-[#F5F5F5]'
              }`}
            >
              <ListTodo className="w-4 h-4" />
              {isSpanish ? 'Tareas' : 'Tasks'}
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                activeTab === 'tasks' ? 'bg-white/20' : 'bg-[#E5E5E5]'
              }`}>
                {stats?.totalTasks || 0}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('milestones')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'milestones'
                  ? 'bg-[#1A1A1A] text-white'
                  : 'text-[#666] hover:bg-[#F5F5F5]'
              }`}
            >
              <Flag className="w-4 h-4" />
              {isSpanish ? 'Hitos' : 'Milestones'}
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                activeTab === 'milestones' ? 'bg-white/20' : 'bg-[#E5E5E5]'
              }`}>
                {plan?.milestones?.length || 0}
              </span>
            </button>
          </div>

          {/* Tasks View */}
          {activeTab === 'tasks' && (
            <>
              <PhaseSection
                phase="Clarity"
                deliverables={deliverables}
                expandedDeliverables={expandedDeliverables}
                onToggleExpand={onToggleExpand}
                onDeleteTask={onDeleteTask}
                deletedTaskIds={deletedTaskIds}
                isSpanish={isSpanish}
              />

              <PhaseSection
                phase="Implementation"
                deliverables={deliverables}
                expandedDeliverables={expandedDeliverables}
                onToggleExpand={onToggleExpand}
                onDeleteTask={onDeleteTask}
                deletedTaskIds={deletedTaskIds}
                isSpanish={isSpanish}
              />

              <PhaseSection
                phase="Adoption"
                deliverables={deliverables}
                expandedDeliverables={expandedDeliverables}
                onToggleExpand={onToggleExpand}
                onDeleteTask={onDeleteTask}
                deletedTaskIds={deletedTaskIds}
                isSpanish={isSpanish}
              />
            </>
          )}

          {/* Milestones View */}
          {activeTab === 'milestones' && (
            <MilestonesView milestones={plan?.milestones} isSpanish={isSpanish} />
          )}

          {/* Footer */}
          <div className="text-center mt-8 pt-6 border-t border-[#E5E5E5]">
            <p className="text-xs text-[#999]">
              {isSpanish ? 'Generado con' : 'Generated with'}{' '}
              <span className="font-medium text-[#666]">Arkode Implementation Planner</span>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
