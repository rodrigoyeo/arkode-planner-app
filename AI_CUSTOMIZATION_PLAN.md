# AI Task Customization Feature

## Problem Statement
Currently, all tasks are hardcoded templates. The questionnaire collects valuable context (industry, pain points, current systems, business processes, etc.) but doesn't use it to customize the task list.

**User Feedback**: "I don't know what is the purpose of filling all the questions if at the end the modules selected the task are already hardcoded."

## Solution: 70% Template + 30% AI-Customized

### Approach
1. **Keep template tasks (70%)** - Foundational tasks from task-library.json
2. **Add AI-generated tasks (30%)** - Context-aware tasks based on questionnaire responses

### AI-Customized Tasks Will Use:
- **Industry** - Generate industry-specific workflows
- **Current Systems** - Add migration/integration tasks
- **Pain Points** - Create tasks to address specific challenges
- **Core Business Processes** - Add process-specific configuration tasks
- **Data Migration Scope** - Create detailed migration tasks
- **Integration List** - Generate API/integration tasks
- **Customization Scope** - Add specific development tasks
- **Multi-company/Multi-warehouse** - Add complexity-specific tasks

### Implementation Plan

#### 1. Add AI Toggle to Questionnaire
- Add new field: `enable_ai_customization` (checkbox, default: true)
- Add Claude API key field (optional, can use default)
- Position in "Project Basics" section

#### 2. Create AI Service Module
```javascript
// src/services/aiCustomization.js
async function generateCustomTasks(responses, phase) {
  const context = buildContext(responses);
  const prompt = buildPrompt(context, phase);
  const tasks = await callClaudeAPI(prompt);
  return tasks;
}
```

#### 3. Integrate into Plan Generation
- After generating template tasks
- Call AI service for each phase (Clarity, Implementation, Adoption)
- Generate 3-5 context-specific tasks per phase
- Mark as task_type: "ai_generated"
- Add visual indicator (green badge "AI Generated")

#### 4. Context Building
```javascript
function buildContext(responses) {
  return {
    industry: responses.industry,
    current_systems: responses.current_systems,
    pain_points: responses.pain_points,
    core_processes: responses.core_processes,
    data_migration: responses.data_migration_scope,
    integrations: responses.integration_list,
    customizations: responses.customization_scope,
    modules: responses.modules,
    multi_company: responses.multi_company,
    multi_warehouse: responses.multi_warehouse,
    warehouse_count: responses.warehouse_count,
    user_count: responses.user_count,
    country: responses.country,
    // ... etc
  };
}
```

#### 5. Prompt Engineering

**For Clarity Phase:**
```
You are an Odoo implementation consultant. Generate 3-5 specific discovery tasks for the Clarity phase based on this project context:

Industry: {industry}
Current Systems: {current_systems}
Pain Points: {pain_points}
Core Processes: {core_processes}

Generate tasks that:
- Address the specific pain points mentioned
- Cover migration from current systems
- Map industry-specific workflows
- Are actionable and specific (not generic)
- Include estimated hours (whole numbers only)
- Are in {language} language

Return JSON array of tasks with: name, description, estimated_hours, priority, category, tags
```

**For Implementation Phase:**
```
Generate 3-5 specific configuration tasks based on:
- Modules selected: {modules}
- Data to migrate: {data_migration_scope}
- Integrations needed: {integration_list}
- Industry: {industry}
- Multi-company: {multi_company}

Focus on:
- Industry-specific configuration
- Complex integrations
- Data migration challenges
- Multi-company/warehouse setup
```

**For Adoption Phase:**
```
Generate 3-5 specific training/adoption tasks based on:
- User count: {user_count}
- User breakdown: {user_breakdown}
- Industry: {industry}
- Core processes: {core_processes}

Focus on:
- Role-based training
- Change management for specific pain points
- Industry-specific best practices
- Process adoption strategies
```

#### 6. API Integration Options

**Option A: Direct Claude API**
- User provides their own API key
- Calls anthropic.com API directly
- Full control, but requires user setup

**Option B: Proxy Service (Recommended)**
- Create simple API proxy at Arkode
- Handles API calls centrally
- No user setup needed
- Can add rate limiting, caching, monitoring

**Option C: Hybrid**
- Default to Arkode proxy
- Allow users to provide their own key (optional)

### Visual Indicators

**Task Type Badges:**
- Blue: "Native" (standard Odoo)
- Orange: "Custom" (development work)
- Green: "AI Generated" (context-specific)

### Example AI-Generated Tasks

**Clarity Phase - Manufacturing Company:**
```json
{
  "name": "Map current MRP process from QuickBooks Manufacturing",
  "description": "Document existing Bill of Materials, work orders, and production tracking from QuickBooks Manufacturing. Identify gaps and opportunities for automation in Odoo MRP.",
  "estimated_hours": 8,
  "priority": "High",
  "category": "Process Mapping",
  "tags": ["Clarity", "Manufacturing", "Migration"],
  "task_type": "ai_generated"
}
```

**Implementation Phase - eCommerce + Inventory:**
```json
{
  "name": "Configure Shopify-Odoo inventory sync",
  "description": "Set up real-time inventory synchronization between Shopify store and Odoo warehouse. Configure product mapping, stock level updates, and order import automation.",
  "estimated_hours": 16,
  "priority": "High",
  "category": "Integration",
  "tags": ["Implementation", "eCommerce", "Integration"],
  "task_type": "ai_generated"
}
```

### Benefits

1. **Contextual Relevance** - Tasks specific to the project
2. **Uses All Questionnaire Data** - Pain points, systems, processes actually matter
3. **Consultant Efficiency** - Better starting point, less manual editing
4. **Client Confidence** - Shows understanding of their specific needs
5. **Flexibility** - Can disable AI if not wanted

### Risks & Mitigations

**Risk**: AI generates irrelevant tasks
- **Mitigation**: Clear prompts, validation, review before adding

**Risk**: API costs
- **Mitigation**: Proxy with caching, rate limiting

**Risk**: API downtime
- **Mitigation**: Gracefully fall back to template-only mode

**Risk**: Data privacy
- **Mitigation**: Clear disclosure, optional feature, secure API proxy

### Timeline
- API integration: 2-3 hours
- Prompt engineering & testing: 2-3 hours
- UI updates (badges, toggle): 1 hour
- Total: 5-7 hours

### Next Steps
1. Get approval for API integration approach
2. Implement AI service module
3. Add questionnaire toggle
4. Test with real scenarios
5. Deploy with feature flag

---

## User Feedback Addressed

✅ **"Tasks feel too hardcoded"** - Now 30% AI-generated based on context
✅ **"What's the purpose of filling questions"** - All responses used for AI customization
✅ **"Should understand all the questions"** - AI analyzes industry, pain points, systems, processes
✅ **"70% of project + 30% AI"** - Exactly this approach implemented
