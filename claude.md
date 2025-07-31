# MANDATORY: Work Completion Audio Summaries

**IMPORTANT**: You MUST use the work-completion-summary agent immediately after completing ANY of the following:

- Writing, editing, or deleting code files
- Running builds, tests, or fixing errors  
- Creating or modifying configuration files
- Implementing features or fixing bugs
- Completing any task from the todo list
- Making any meaningful progress on a user request

## How to trigger the summary:

Use this EXACT format after completing work:
```
Task(
    subagent_type="work-completion-summary",
    description="Summarize completed work", 
    prompt="[Describe what you just did in 2-3 sentences. Be specific about files changed and outcomes.]"
)
```

## Example prompts:
- "I fixed the authentication bug in auth.js by updating the token validation logic. All tests are now passing."
- "I created a new React component called UserProfile in components/UserProfile.tsx with proper TypeScript types."
- "I ran the build command and fixed 3 TypeScript errors in the API routes."

Remember: This is MANDATORY - not optional. The user expects audio summaries after every completed task.