# Project Board Configuration Guide

Since you've already created the project board, here are the steps to complete the configuration:

## 1. Add Existing Issues to Project

### Manual Method (Recommended)
1. Go to your project board at https://github.com/users/CodingButter/projects/
2. Click on your "Braidarr Development" project
3. Click the "+" button or "Add item" 
4. In the search box, type `repo:CodingButter/braidarr`
5. Select all 7 existing issues:
   - Issue #1: F1-001: Implement authentication system with Argon2id and JWT
   - Issue #2: F1-002: Implement CSRF protection and rate limiting middleware
   - Issue #3: F1-003: Create authentication UI (login/logout)
   - Issue #4: F2-001: Implement Plex PIN authentication flow
   - Issue #5: F2-002: Create Plex server and library discovery UI
   - Issue #6: DX-001: Set up repository structure and development environment
   - Issue #7: QA-001: Create test plan and fixtures for authentication
6. Click "Add selected items"

## 2. Configure Automatic Issue Addition

### Set up Workflow Automation
1. In your project, click on the "..." menu (three dots) in the top right
2. Select "Workflows" 
3. Enable "Auto-add to project"
4. Configure the workflow:
   ```
   When: Issues are opened
   Repository: CodingButter/braidarr
   Action: Add to project
   ```

### Alternative: Using GitHub Actions
Create `.github/workflows/add-to-project.yml` in your repository:

```yaml
name: Add issues to project

on:
  issues:
    types: [opened]

jobs:
  add-to-project:
    name: Add issue to project
    runs-on: ubuntu-latest
    steps:
      - uses: actions/add-to-project@v0.5.0
        with:
          project-url: https://github.com/users/CodingButter/projects/1  # Update with your project URL
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## 3. Configure Project Views and Columns

### Board View Columns
Set up these columns in your board view:
1. **📋 Backlog** - New issues not yet prioritized
2. **📝 Todo** - Ready for current sprint
3. **🚧 In Progress** - Actively being worked on
4. **👀 In Review** - Awaiting code review
5. **✅ Done** - Completed

### Configure Automation Rules
For each column, set up these automation rules:

**📋 Backlog**
- When an issue is added to the project → Move to Backlog

**📝 Todo**
- When an issue is assigned → Move to Todo

**🚧 In Progress**
- When a pull request is linked → Move to In Progress
- When issue is reopened → Move to In Progress

**👀 In Review**
- When pull request is ready for review → Move to In Review

**✅ Done**
- When issue is closed → Move to Done
- When pull request is merged → Move to Done

## 4. Add Custom Fields

In the project settings, add these fields:

1. **Priority**
   - Type: Single select
   - Options: 🔴 Critical, 🟠 High, 🟡 Medium, 🟢 Low

2. **Sprint**
   - Type: Single select
   - Options: Sprint 1, Sprint 2, Sprint 3, Sprint 4

3. **Team Member**
   - Type: Single select
   - Options: Project Manager, Lead Developer, Full-Stack Developer, Integration Engineer, QA Engineer

4. **Estimate**
   - Type: Number
   - Unit: Days

5. **Component**
   - Type: Single select
   - Options: Backend, Frontend, Integration, DevOps, Testing

## 5. Create Additional Views

### Roadmap View
1. Add view → Timeline
2. Name: "Roadmap"
3. Group by: Milestone
4. Date field: Due date

### Sprint Planning View
1. Add view → Table
2. Name: "Sprint Planning"
3. Visible fields: Title, Sprint, Team Member, Priority, Estimate
4. Group by: Sprint
5. Sort by: Priority (descending)

### Team View
1. Add view → Board
2. Name: "Team Assignments"
3. Column field: Team Member
4. Group unassigned items separately

## 6. Set Field Values for Existing Issues

Update each issue with appropriate field values:

| Issue | Sprint | Team Member | Priority | Estimate |
|-------|--------|------------|----------|----------|
| #1 | Sprint 1 | Full-Stack Developer | High | 2 |
| #2 | Sprint 1 | Full-Stack Developer | High | 1 |
| #3 | Sprint 1 | Full-Stack Developer | High | 1.5 |
| #4 | Sprint 1 | Integration Engineer | High | 1.5 |
| #5 | Sprint 1 | Full-Stack Developer | Medium | 2 |
| #6 | Sprint 1 | Lead Developer | Critical | 2 |
| #7 | Sprint 1 | QA Engineer | High | 1 |

## 7. Enable Insights

1. Go to the Insights tab in your project
2. Configure charts:
   - Issues by Sprint
   - Issues by Team Member
   - Completion rate over time
   - Average time in each column

## Next Steps

Once configured:
1. Team members should bookmark the project board
2. Check the board daily for updates
3. Move cards as work progresses
4. Update field values when priorities change
5. Use the different views for planning and tracking

## Project Board URL
Your project board should be accessible at:
https://github.com/users/CodingButter/projects/[PROJECT_NUMBER]

Replace [PROJECT_NUMBER] with your actual project number.