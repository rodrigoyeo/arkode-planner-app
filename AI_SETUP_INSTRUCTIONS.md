# AI Task Customization Setup Instructions

## Overview
The Odoo Implementation Planner can now use AI to generate context-specific tasks based on your questionnaire responses. This feature is **optional** but highly recommended.

## What It Does
Instead of only using hardcoded templates, the AI:
- Analyzes your industry, pain points, current systems, and business processes
- Generates 3-5 custom tasks per phase that are specific to your project
- Creates tasks for complex migrations, integrations, and industry-specific workflows
- Uses ALL the questionnaire responses (not just module selection)

**Result**: 70% template tasks + 30% AI-customized tasks = Better project plans!

## Setup Options

### Option 1: Use Arkode's API Proxy (Recommended)
**Coming Soon** - We'll provide a shared API endpoint so you don't need your own API key.

No setup needed! Just check the "Enable AI Task Customization" box in the questionnaire.

### Option 2: Use Your Own Claude API Key

1. **Get a Claude API Key:**
   - Go to https://console.anthropic.com/
   - Sign up or log in
   - Create an API key
   - Copy the key (starts with `sk-ant-`)

2. **Add Key to Environment:**
   ```bash
   cd odoo-planner-app
   cp .env.example .env
   ```

3. **Edit .env file:**
   ```
   VITE_CLAUDE_API_KEY=sk-ant-your_actual_api_key_here
   ```

4. **Restart the dev server:**
   ```bash
   npm run dev
   ```

5. **Test It:**
   - Fill out the questionnaire with realistic data
   - Include pain points, current systems, business processes
   - Check "Enable AI Task Customization"
   - Generate the plan
   - Look for tasks with green "AI Generated" badges

## API Costs
- Model: Claude 3.5 Sonnet
- Cost per plan: ~$0.10-0.20 (depending on questionnaire detail)
- Typical usage: 5-10 plans per day = $1-2/day

**Recommended**: Use Arkode's proxy to share costs across the team.

## Troubleshooting

### "No Claude API key provided" warning in console
- AI customization is disabled
- App falls back to template-only mode
- Either add API key or wait for Arkode proxy

### API errors or timeouts
- Check API key is correct
- Verify anthropic.com is accessible
- Check browser console for error details
- App will continue with template tasks even if AI fails

### Tasks seem generic or not customized
- Make sure you filled out:
  - Industry
  - Current systems
  - Pain points
  - Core business processes
  - Data migration scope
  - Integration requirements
- The more detail you provide, the better the AI tasks

### AI tasks in wrong language
- Check language selection in questionnaire
- AI respects the language field (English/Spanish)
- Regenerate plan if language is incorrect

## Features

### AI Generates Tasks For:

**Clarity Phase:**
- Industry-specific discovery workshops
- Migration planning from current systems mentioned
- Pain point analysis sessions
- Core process mapping for specific workflows

**Implementation Phase:**
- Complex data migrations (based on scope provided)
- Third-party integrations (based on systems listed)
- Multi-company/warehouse configurations
- Industry-specific module setups

**Adoption Phase:**
- Role-based training (based on user breakdown)
- Change management for specific pain points
- Industry best practices sessions
- Process adoption strategies

### Visual Indicators

Task badges show type:
- 🟦 **Blue "Native"** - Standard Odoo template task
- 🟧 **Orange "Custom"** - Custom development task
- 🟩 **Green "AI Generated"** - Context-specific AI task

### CSV Export

AI-generated tasks are included in the CSV with:
- Tag: "AI Generated"
- Can be filtered in Odoo
- Same fields as template tasks

## Example AI Tasks

**Manufacturing Company - Clarity Phase:**
```
"Map current MRP process from QuickBooks Manufacturing"
"Document Bill of Materials structure and work order flow"
"Analyze production bottlenecks and automation opportunities"
```

**eCommerce Company - Implementation:**
```
"Configure Shopify-Odoo inventory real-time sync"
"Set up automated order import with customer data mapping"
"Test payment gateway integration with Stripe"
```

**Multi-Warehouse Distribution - Adoption:**
```
"Train warehouse managers on inter-warehouse transfers"
"Create role-based dashboards for inventory visibility"
"Conduct go-live simulation for peak season readiness"
```

## Disabling AI Customization

Don't want AI tasks? No problem:
1. Uncheck "Enable AI Task Customization" in questionnaire
2. Or don't provide an API key
3. App works perfectly with template tasks only

## Privacy & Security

- Questionnaire responses are sent to Claude API for task generation
- Data is not stored by Anthropic (see their data retention policy)
- No client PII is required in questionnaire
- Use generic descriptions if concerned about confidentiality
- All communication is over HTTPS

## Future Enhancements

- **Arkode API Proxy** - Shared API access for team
- **Task Editing** - Modify AI tasks before export
- **Learning Mode** - AI learns from your edits
- **Templates Library** - Save AI-generated tasks as templates
- **Industry Packs** - Pre-trained for specific industries

## Support

Issues with AI customization?
- Check console for errors
- Verify API key in .env file
- Test with simple questionnaire first
- Contact Arkode support if issues persist

## Quick Test

To verify AI is working:

1. Fill questionnaire with:
   - Industry: "Manufacturing"
   - Current Systems: "QuickBooks, Excel spreadsheets"
   - Pain Points: "No inventory visibility, manual BOM updates"
   - Modules: Manufacturing, Inventory
   - Enable AI: ✓

2. Generate plan

3. Look for green "AI Generated" badges

4. Check if tasks mention QuickBooks, Excel, or inventory visibility

If yes → AI is working! 🎉
If no → Check API key and console errors

---

**Remember**: AI customization is a powerful feature, but the template tasks are already comprehensive. Use AI to add that extra 30% of project-specific context that makes your proposals stand out!
