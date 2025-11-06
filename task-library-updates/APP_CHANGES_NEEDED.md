# App.jsx Changes Needed

## Priority 1: Quick Fixes (High Impact, Easy)

### 1. Fix Decimal Hours ⚡ CRITICAL
**Current Code:**
```javascript
allocated_hours: Math.round(task.estimated_hours * hourMultiplier * 10) / 10
```

**New Code:**
```javascript
allocated_hours: Math.round(task.estimated_hours * hourMultiplier)
```

**Impact:** No more 2.5, 3.7 hours. All whole numbers.

**Locations to Change:**
- Line ~220: Clarity phase task generation
- Line ~240: Implementation phase task generation
- Line ~260: Adoption phase task generation

---

### 2. Use New Clarity Phase Structure ⚡ CRITICAL
**Current:** Loads from `taskLibrary.clarity_phase.standard_tasks`

**New:** Load from `clarityPhaseImproved.clarity_phase.standard_tasks`

**What to do:**
1. Import the new clarity phase:
```javascript
import clarityPhaseImproved from '../../task-library-updates/clarity-phase-improved.json';
```

2. Replace task generation logic to use new structure with week info
3. Add language support: use `task.name_es` when language === 'Spanish'

---

### 3. Use New Adoption Phase Structure ⚡ CRITICAL
**Current:** Loads all 10 tasks including "Hypercare"

**New:**
- Load 7 core tasks from `adoptionPhaseImproved.adoption_phase.standard_tasks`
- Generate dynamic monthly support tasks based on `adoption_duration_months`

**Logic:**
```javascript
// Core tasks
const coreTasks = adoptionPhaseImproved.adoption_phase.standard_tasks;

// Calculate remaining hours
const coreTasksHours = coreTasks.reduce((sum, t) => sum + t.estimated_hours, 0);
const remainingHours = adoptionHours - coreTasksHours;
const monthlyHours = Math.round(remainingHours / adoptionDurationMonths);

// Generate monthly support tasks
for (let month = 1; month <= adoptionDurationMonths; month++) {
  plan.tasks.push({
    title: language === 'Spanish'
      ? `Soporte Continuo - Mes ${month}`
      : `Ongoing Support - Month ${month}`,
    allocated_hours: monthlyHours,
    // ... rest of task structure
  });
}
```

---

### 4. Add Custom Development Tasks ⚡ CRITICAL
**When:** `responses.customizations === 'Yes'`

**What to do:**
```javascript
if (responses.implementation_phase && responses.customizations === 'Yes') {
  import customDevTemplate from '../../task-library-updates/custom-development-template.json';

  customDevTemplate.custom_development.tasks.forEach(task => {
    // Adjust hours for main development task based on customization_scope
    let hours = task.estimated_hours;
    if (task.adjustable && responses.customization_scope) {
      // Estimate based on scope description length or complexity
      hours = estimateCustomHours(responses.customization_scope);
    }

    plan.tasks.push({
      id: taskId++,
      title: language === 'Spanish' ? task.name_es : task.name,
      description: language === 'Spanish' ? task.description_es : task.description,
      allocated_hours: Math.round(hours),
      priority: task.priority,
      category: task.category,
      tags: task.tags,
      phase: 'Implementation',
      module: 'Custom Development',
      task_type: 'custom', // NEW FIELD
      // ... rest
    });
  });
}
```

---

## Priority 2: New Features (Medium Impact)

### 5. Add Language Support
**Questionnaire:**
Add language select in Project Basics section

**Task Generation:**
Use `task.name_es` and `task.description_es` when `responses.language === 'Spanish'`

---

### 6. Add Country Field
**Questionnaire:**
Add country text input in Project Basics section

**Task Generation:**
If Accounting module selected:
- Check country
- Add country-specific tax/localization tasks if needed

---

### 7. Add Project Start Date
**Questionnaire:**
Add date input for project start

**Task Generation:**
Calculate start_date and due_date for each task based on:
- Project start date
- Phase sequence
- Task hours
- Working hours per week (40h)

---

### 8. Add Adoption Duration
**Questionnaire:**
Add "How many months of adoption support?" number input

**Task Generation:**
Use this to create monthly support tasks (see #3 above)

---

## Priority 3: UI Enhancements (Lower Impact)

### 9. Add Milestones Table
**Location:** After task tables in plan display

**Structure:**
```javascript
<div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
  <h2>Project Milestones</h2>
  <table>
    <thead>
      <tr>
        <th>Milestone</th>
        <th>Start Date</th>
        <th>Due Date</th>
        <th>Deliverables</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Clarity Complete</td>
        <td>{clarityStartDate}</td>
        <td>{clarityEndDate}</td>
        <td>Process To-Be, Master of Implementation</td>
      </tr>
      // ... more milestones
    </tbody>
  </table>
</div>
```

---

### 10. Add Sorting & Filtering
**Add to Plan Display:**
- Sort dropdown: by Name, Hours, Priority, Category
- Filter buttons: by Phase, Module, Priority
- Search box: filter by task name

---

### 11. Add Task Editing
**Add to Plan Display:**
- Make task fields editable inline or via modal
- Allow adding/removing tasks
- Save changes before export

---

### 12. Add Custom vs Native Indicator
**In task display:**
```javascript
<div className="flex items-center gap-2">
  {task.task_type === 'custom' ? (
    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
      Custom
    </span>
  ) : (
    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
      Native
    </span>
  )}
  <span>{task.title}</span>
</div>
```

---

### 13. CSV Export Updates
**Add new fields to CSV:**
- `start_date`
- `due_date`
- `task_type` (custom vs native)
- `week` (for Clarity tasks)

---

## Implementation Order Recommendation

**Quick Wins (Do First - 1 hour):**
1. Fix decimal hours ✅
2. Add custom development tasks ✅
3. Use new Clarity structure ✅
4. Use new Adoption structure ✅

**Important Features (Do Second - 1 hour):**
5. Add language support
6. Add country field
7. Add adoption duration
8. Add project start date

**Enhancements (Do Third - 1 hour):**
9. Add milestones table
10. Add custom vs native indicator
11. Calculate task dates

**Polish (Do Last - 30 min):**
12. Add sorting/filtering
13. Update CSV export

---

## Testing Checklist

After changes:
- [ ] No decimal hours appear
- [ ] Master of Implementation appears in Clarity phase (16h + 4h)
- [ ] Custom modules create custom development tasks
- [ ] Adoption shows monthly support tasks based on duration
- [ ] Language selection works (Spanish names appear)
- [ ] Country field exists and is captured
- [ ] Milestones table displays
- [ ] CSV export works with new fields

---

## Files to Update

1. **App.jsx** - Main changes
2. **questionnaire-structure.json** - Add new questions
3. **task-library.json** - Replace with improved versions OR just import new structures

---

## Estimated Time

- Priority 1 (Quick Fixes): 1 hour
- Priority 2 (New Features): 1 hour
- Priority 3 (UI Enhancements): 1 hour
- Testing & Debug: 30 minutes

**Total: 3.5 hours**

Currently at: 40% complete
After Priority 1: 65% complete
After Priority 2: 85% complete
After Priority 3: 100% complete
