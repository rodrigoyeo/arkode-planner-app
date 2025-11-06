// AI Task Customization Service
// Generates context-specific tasks using Claude API based on questionnaire responses

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Generate AI-customized tasks for a specific phase
 * @param {Object} responses - All questionnaire responses
 * @param {string} phase - 'clarity', 'implementation', or 'adoption'
 * @param {string} apiKey - Claude API key (optional, uses env var if not provided)
 * @returns {Promise<Array>} Array of AI-generated tasks
 */
export async function generateCustomTasks(responses, phase, apiKey = null) {
  // Use provided API key or environment variable
  const key = apiKey || import.meta.env.VITE_CLAUDE_API_KEY;

  if (!key) {
    console.warn('No Claude API key provided. Skipping AI customization.');
    return [];
  }

  try {
    const context = buildContext(responses);
    const prompt = buildPrompt(context, phase, responses.language || 'English');

    const response = await fetch(CLAUDE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    });

    if (!response.ok) {
      console.error('Claude API error:', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    const tasksText = data.content[0].text;

    // Extract JSON from response
    const jsonMatch = tasksText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('No valid JSON found in Claude response');
      return [];
    }

    const tasks = JSON.parse(jsonMatch[0]);

    // Add metadata to tasks
    return tasks.map(task => ({
      ...task,
      task_type: 'ai_generated',
      phase: phase.charAt(0).toUpperCase() + phase.slice(1),
      tags: Array.isArray(task.tags) ? task.tags : [task.tags || phase]
    }));

  } catch (error) {
    console.error('Error generating AI tasks:', error);
    return [];
  }
}

/**
 * Build context object from questionnaire responses
 */
function buildContext(responses) {
  return {
    // Project basics
    industry: responses.industry || 'General',
    country: responses.country || '',
    language: responses.language || 'English',

    // Clarity phase context
    current_systems: responses.current_systems || '',
    pain_points: responses.pain_points || '',
    core_processes: responses.core_processes || '',

    // Implementation context
    modules: responses.modules || [],
    data_migration: responses.data_migration || 'No',
    data_migration_scope: responses.data_migration_scope || '',
    integrations: responses.integrations || 'No',
    integration_list: responses.integration_list || '',
    customizations: responses.customizations || 'No',
    customization_scope: responses.customization_scope || '',
    multi_company: responses.multi_company || 'No',
    company_count: responses.company_count || 1,
    multi_warehouse: responses.multi_warehouse || 'No',
    warehouse_count: responses.warehouse_count || 1,

    // Adoption context
    user_count: responses.user_count || 0,
    user_breakdown: responses.user_breakdown || '',
    training_format: responses.training_format || 'Hybrid',
  };
}

/**
 * Build AI prompt based on phase and context
 */
function buildPrompt(context, phase, language) {
  const baseInstructions = `You are an expert Odoo implementation consultant at Arkode. Generate 3-5 specific, actionable tasks for the ${phase} phase.

IMPORTANT RULES:
- Tasks must be SPECIFIC to this project (not generic)
- Use the provided context to create relevant tasks
- Estimated hours must be whole numbers only (no decimals)
- Return ONLY a valid JSON array, no other text
- Tasks must be in ${language} language
- Each task must have: name, description, estimated_hours, priority, category, tags

Context:
Industry: ${context.industry}
Country: ${context.country}
Modules: ${context.modules.join(', ')}
`;

  if (phase === 'clarity') {
    return `${baseInstructions}
Current Systems: ${context.current_systems}
Pain Points: ${context.pain_points}
Core Processes: ${context.core_processes}

Generate 3-5 specific Clarity phase tasks that:
- Address the pain points mentioned
- Cover migration planning from current systems
- Map the core business processes mentioned
- Are specific to the ${context.industry} industry
- Include discovery workshops for critical areas

Example format:
[
  {
    "name": "Map [specific process] from [current system]",
    "description": "Detailed description of what needs to be documented and why",
    "estimated_hours": 8,
    "priority": "High",
    "category": "Process Mapping",
    "tags": ["Clarity", "Discovery"]
  }
]

Return only the JSON array:`;
  }

  if (phase === 'implementation') {
    return `${baseInstructions}
Data Migration: ${context.data_migration_scope}
Integrations: ${context.integration_list}
Customizations: ${context.customization_scope}
Multi-company: ${context.multi_company} ${context.multi_company === 'Yes' ? `(${context.company_count} companies)` : ''}
Multi-warehouse: ${context.multi_warehouse} ${context.multi_warehouse === 'Yes' ? `(${context.warehouse_count} warehouses)` : ''}

Generate 3-5 specific Implementation phase tasks that:
- Address complex data migration needs
- Configure integrations mentioned
- Handle multi-company/warehouse complexity
- Are specific to the ${context.industry} industry
- Focus on the selected modules: ${context.modules.join(', ')}

Return only the JSON array:`;
  }

  if (phase === 'adoption') {
    return `${baseInstructions}
User Count: ${context.user_count}
User Breakdown: ${context.user_breakdown}
Training Format: ${context.training_format}
Pain Points to Address: ${context.pain_points}

Generate 3-5 specific Adoption phase tasks that:
- Create role-based training for user groups mentioned
- Address change management for pain points
- Are specific to the ${context.industry} industry
- Match the ${context.training_format} training format
- Focus on process adoption for: ${context.core_processes}

Return only the JSON array:`;
  }

  return baseInstructions + '\nReturn only the JSON array:';
}

/**
 * Check if AI customization is enabled and configured
 */
export function isAICustomizationAvailable() {
  return !!(import.meta.env.VITE_CLAUDE_API_KEY);
}
