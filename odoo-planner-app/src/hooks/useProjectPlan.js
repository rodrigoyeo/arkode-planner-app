/**
 * useProjectPlan Hook
 * Manages the generated project plan state
 * V3.1 - Uses new PM-quality plan generator
 */

import { useState, useCallback, useMemo } from 'react';
import { generateProjectPlan } from '../services/planGenerator';

export function useProjectPlan() {
  const [plan, setPlan] = useState(null);
  const [deliverables, setDeliverables] = useState([]);
  const [flatTasks, setFlatTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [deletedTaskIds, setDeletedTaskIds] = useState(new Set());
  const [expandedDeliverables, setExpandedDeliverables] = useState(new Set());

  /**
   * Generate the project plan from questionnaire responses
   */
  const generatePlan = useCallback(async (responses) => {
    setIsGenerating(true);

    try {
      // Use the new PM-quality plan generator
      const result = generateProjectPlan(responses);

      setPlan({
        project_info: result.project_info,
        stats: result.stats,
        milestones: result.milestones,
        generated_at: result.generated_at
      });
      setMilestones(result.milestones);
      setDeliverables(result.deliverables);
      setFlatTasks(result.flatTasks);
      setDeletedTaskIds(new Set());
      setExpandedDeliverables(new Set());

      return result;
    } catch (error) {
      console.error('Error generating plan:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Toggle deliverable expansion
   */
  const toggleDeliverableExpansion = useCallback((deliverableId) => {
    setExpandedDeliverables(prev => {
      const next = new Set(prev);
      if (next.has(deliverableId)) {
        next.delete(deliverableId);
      } else {
        next.add(deliverableId);
      }
      return next;
    });
  }, []);

  /**
   * Expand all deliverables
   */
  const expandAllDeliverables = useCallback(() => {
    setExpandedDeliverables(new Set(deliverables.map(d => d.id)));
  }, [deliverables]);

  /**
   * Collapse all deliverables
   */
  const collapseAllDeliverables = useCallback(() => {
    setExpandedDeliverables(new Set());
  }, []);

  /**
   * Delete a task (soft delete)
   */
  const deleteTask = useCallback((taskId) => {
    setDeletedTaskIds(prev => new Set([...prev, taskId]));
  }, []);

  /**
   * Restore a deleted task
   */
  const restoreTask = useCallback((taskId) => {
    setDeletedTaskIds(prev => {
      const next = new Set(prev);
      next.delete(taskId);
      return next;
    });
  }, []);

  /**
   * Update task hours
   */
  const updateTaskHours = useCallback((taskId, hours) => {
    setFlatTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, allocated_hours: hours } : task
    ));

    setDeliverables(prev => prev.map(deliverable => {
      if (deliverable.id === taskId) {
        return { ...deliverable, allocated_hours: hours };
      }
      return {
        ...deliverable,
        subtasks: (deliverable.subtasks || []).map(subtask =>
          subtask.id === taskId ? { ...subtask, allocated_hours: hours } : subtask
        )
      };
    }));
  }, []);

  /**
   * Update task assignee
   */
  const updateTaskAssignee = useCallback((taskId, assignee) => {
    setFlatTasks(prev => prev.map(task =>
      task.id === taskId ? { ...task, assignee } : task
    ));

    setDeliverables(prev => prev.map(deliverable => {
      if (deliverable.id === taskId) {
        return { ...deliverable, assignee };
      }
      return {
        ...deliverable,
        subtasks: (deliverable.subtasks || []).map(subtask =>
          subtask.id === taskId ? { ...subtask, assignee } : subtask
        )
      };
    }));
  }, []);

  /**
   * Get active tasks (excluding deleted)
   */
  const activeFlatTasks = useMemo(() => {
    return flatTasks.filter(task => !deletedTaskIds.has(task.id));
  }, [flatTasks, deletedTaskIds]);

  /**
   * Get active deliverables (excluding deleted)
   */
  const activeDeliverables = useMemo(() => {
    return deliverables
      .filter(d => !deletedTaskIds.has(d.id))
      .map(d => ({
        ...d,
        subtasks: (d.subtasks || []).filter(st => !deletedTaskIds.has(st.id))
      }));
  }, [deliverables, deletedTaskIds]);

  /**
   * Calculate total hours from active deliverables
   */
  const totalHours = useMemo(() => {
    return activeDeliverables.reduce((sum, d) => sum + d.allocated_hours, 0);
  }, [activeDeliverables]);

  /**
   * Get stats
   */
  const stats = useMemo(() => {
    if (!plan) return null;

    return {
      deliverableCount: activeDeliverables.length,
      subtaskCount: activeDeliverables.reduce((sum, d) => sum + (d.subtasks?.length || 0), 0),
      totalTasks: activeFlatTasks.length,
      totalHours,
      deletedCount: deletedTaskIds.size
    };
  }, [plan, activeDeliverables, activeFlatTasks, totalHours, deletedTaskIds.size]);

  /**
   * Reset plan
   */
  const reset = useCallback(() => {
    setPlan(null);
    setDeliverables([]);
    setFlatTasks([]);
    setMilestones([]);
    setDeletedTaskIds(new Set());
    setExpandedDeliverables(new Set());
  }, []);

  return {
    // State
    plan,
    deliverables: activeDeliverables,
    flatTasks: activeFlatTasks,
    allFlatTasks: flatTasks,
    milestones,
    isGenerating,
    deletedTaskIds,
    expandedDeliverables,
    stats,
    totalHours,

    // Actions
    generatePlan,
    toggleDeliverableExpansion,
    expandAllDeliverables,
    collapseAllDeliverables,
    deleteTask,
    restoreTask,
    updateTaskHours,
    updateTaskAssignee,
    reset
  };
}

export default useProjectPlan;
