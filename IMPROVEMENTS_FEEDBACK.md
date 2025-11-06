# Odoo Implementation Planner - Improvements Based on Feedback

## Date: 2025-11-06
## Feedback Source: User Testing - First Run

---

## Critical Issues to Fix

### 1. ✅ **Language Support**
**Issue**: Questions asked for language but output wasn't translated
**Solution**:
- Add language selection in questionnaire (English/Spanish)
- Translate all task names and descriptions based on selection
- Create Spanish translation file for task library

### 2. ✅ **Country/Multi-Company Configuration**
**Issue**: Accounting configuration differs by country (Mexico vs US)
**Solution**:
- Add "Country/Countries" question in Project Basics
- Add "Multi-company setup?" question in Implementation Details
- Add country-specific accounting tasks based on answer
- Include localization tasks (taxes, fiscal positions, etc.)

### 3. ✅ **Custom Modules Missing**
**Issue**: Custom modules didn't appear in implementation workplan
**Solution**:
- Check customization handling in code
- Add custom development tasks when "customizations === 'Yes'"
- Create task template for custom module development

### 4. ✅ **AI Usage Clarity**
**Current**: Template-based (no AI)
**Options**:
- **Option A**: Keep template-based, explain clearly in UI
- **Option B**: Add optional AI enhancement via Claude API
**Decision**: Keep template-based for v1, add AI as optional feature later

### 5. ✅ **Clarity Phase - Critical Missing Tasks**
**Issue**: Missing two crucial tasks:
1. **Process To-Be Review with Client** (after week 3)
2. **Master of Implementation** (30% of clarity time - week 4)

**Master of Implementation**: Mockup/visualization showing how optimized processes translate into Odoo solution

**New Clarity Timeline** (4 weeks):
- **Week 1-2 (50%)**: Discovery, mapping, identifying
  - Project Kickoff
  - Stakeholder Interviews
  - Current Process Mapping (As-Is)
  - Gap Analysis
  - Data Migration Assessment
  - Integration Requirements Analysis

- **Week 3 (20%)**: Optimizing
  - Future Process Design (To-Be)
  - Customization Scoping
  - **Process To-Be Review & Approval**

- **Week 4 (30%)**: Master of Implementation
  - **Master of Implementation Creation** (Odoo mockup/visualization)
  - **Master of Implementation Presentation**
  - Clarity Phase Sign-off

### 6. ✅ **UI Interactions**
**Issue**: Can't sort or interact with plan
**Solution**:
- Add sorting by: Task name, Category, Hours, Priority
- Add filtering by: Phase, Module, Priority
- Add search functionality
- Add ability to edit tasks before export

### 7. ✅ **Custom vs Native Distinction**
**Issue**: No clear indication of custom vs standard Odoo
**Solution**:
- Add "Type" field to tasks: "Native" or "Custom"
- Mark all standard Odoo config as "Native"
- Mark customizations as "Custom"
- Add visual indicator in UI (icon or color)

### 8. ✅ **No Decimal Hours**
**Issue**: Hours showing as 2.5, 3.7, etc.
**Solution**:
- Round all hours to whole numbers
- Use Math.round() instead of Math.round(...*10)/10
- Update display format to always show integers

### 9. ✅ **Adoption Phase Restructure**
**Current**: Individual tasks (training, go-live, hypercare)
**New**: Time-based support allocation

**Example**: 2 months, 40 hours = 20 hours/month for support

**Keep these standard tasks**:
- Knowledge Base Setup
- Training Material Preparation
- Admin/Super User Training
- End User Training Sessions
- Go-Live Preparation
- Go-Live Support (Day 1-3)

**Change these**:
- Replace "Post Go-Live Support (Week 1-2)" and "Hypercare" with:
  - **Ongoing Support (Month 1)** - X hours
  - **Ongoing Support (Month 2)** - X hours
  - (dynamically based on adoption duration input)

**Questions to Add**:
- Adoption period duration (weeks/months)
- Total adoption hours
- Calculate hours/month automatically

### 10. ✅ **Milestones Table**
**Issue**: No milestone overview for executives
**Solution**:
Add **Project Milestones** section showing:

| Milestone | Start Date | Due Date | Deliverables |
|-----------|------------|----------|--------------|
| Clarity Phase Complete | [calc] | [calc] | Process To-Be, Master of Implementation |
| Implementation Phase Complete | [calc] | [calc] | Configured Odoo system, Migrated data |
| Go-Live | [calc] | [calc] | Production launch |
| Adoption Complete | [calc] | [calc] | Trained users, Knowledge base |

**Date Calculation**:
- Use project start date from questionnaire
- Calculate based on phase durations
- Clarity = 4 weeks default
- Implementation = based on hours (1 FTE = 40h/week)
- Adoption = user-specified duration

### 11. ✅ **Clarity Phase Timeline Details**
Already covered in #5 above

### 12. ✅ **Task Start/Due Dates**
**Issue**: Tasks have no dates
**Solution**:
- Add start_date and due_date fields to each task
- Calculate based on:
  - Project start date
  - Phase sequence (Clarity → Implementation → Adoption)
  - Task dependencies
  - Estimated hours

**Logic**:
```
Clarity tasks: Start on project start date, sequence over 4 weeks
Implementation tasks: Start after Clarity ends
Adoption tasks: Start before/during go-live
```

### 13. ✅ **Milestone Start/Due Dates**
**Solution**:
- Clarity Milestone: Week 0 → Week 4
- Implementation Milestone: Week 4 → Week 4 + (total impl hours / 40)
- Go-Live Milestone: End of implementation
- Adoption Milestone: Go-Live → Go-Live + adoption duration

---

## Implementation Priority

### Phase 1 (Critical - Do First)
1. ✅ Remove decimal hours
2. ✅ Fix Clarity phase tasks (add Master of Implementation)
3. ✅ Fix custom modules appearance
4. ✅ Add country/language questions
5. ✅ Restructure Adoption phase

### Phase 2 (Important - Do Second)
6. ✅ Add start/due dates for tasks
7. ✅ Add milestones table with dates
8. ✅ Add custom vs native distinction
9. ✅ Add Clarity 4-week structure

### Phase 3 (Enhancement - Do Third)
10. ✅ Add UI sorting/filtering
11. ✅ Add task editing capability
12. ✅ Add AI enhancement (optional)

---

## Files to Update

1. **task-library.json**
   - Update Clarity tasks
   - Update Adoption tasks
   - Add custom development template
   - Change all hours to whole numbers

2. **questionnaire-structure.json**
   - Add language question
   - Add country question
   - Add adoption duration question
   - Update adoption hours question

3. **App.jsx**
   - Fix hours rounding (remove decimals)
   - Add date calculation logic
   - Add milestones generation
   - Add sorting/filtering UI
   - Handle custom modules properly
   - Add custom vs native distinction

4. **Create Spanish translation file**
   - translations-es.json

---

## Testing Checklist

- [ ] Hours are always whole numbers
- [ ] Master of Implementation appears in Clarity phase
- [ ] Custom modules create implementation tasks
- [ ] Language selection works
- [ ] Country affects accounting tasks
- [ ] Adoption phase shows monthly support
- [ ] Milestones table displays with dates
- [ ] All tasks have start/due dates
- [ ] Sorting and filtering work
- [ ] CSV export includes all new fields

---

## Notes

- **Hypercare** = Industry term for extended post-launch support
  - User prefers simpler "Ongoing Support Month X" structure
  - Keep task names simple and clear

- **Master of Implementation** = Critical deliverable
  - Shows how To-Be processes map to Odoo
  - Visual mockup of solution
  - Takes 30% of Clarity time
  - Presented in Week 4

- **Decimal Hours Issue** = Very hard to work with
  - Always use whole numbers
  - Round up for tasks < 1 hour
  - Use Math.round() everywhere
