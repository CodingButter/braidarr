# GitHub Project Board Setup Instructions

Since GitHub Projects require additional permissions that can't be granted through the CLI, please follow these manual steps to create the project board:

## Creating the Project Board

1. Go to https://github.com/CodingButter/braidarr
2. Click on the "Projects" tab
3. Click "New project" 
4. Select "Board" template
5. Name it "Braidarr Development"

## Configure Project Views

### 1. Board View (Default)
Configure columns as:
- **Backlog** - New issues not yet started
- **Todo** - Issues ready for current sprint
- **In Progress** - Actively being worked on
- **In Review** - Code complete, awaiting review
- **Done** - Completed and closed

### 2. Roadmap View
1. Add a new view → Timeline
2. Name it "Roadmap"
3. Set date field to use Milestones
4. Group by Milestone

### 3. Sprint View
1. Add a new view → Table
2. Name it "Sprint Planning"
3. Add fields:
   - Sprint (use labels)
   - Assignee
   - Estimate
   - Priority
4. Group by Sprint label

## Custom Fields to Add

1. **Priority**: Single select (Critical, High, Medium, Low)
2. **Estimate**: Number (in person days)
3. **Team Member**: Single select (Project Manager, Lead Developer, Full-Stack Developer, Integration Engineer, QA Engineer)
4. **Sprint**: Single select (Sprint 1, Sprint 2, Sprint 3, Sprint 4)

## Automation Rules

Set up these automation rules:

1. **Auto-add to project**: When an issue is opened in the repository
2. **Auto-move to Todo**: When an issue is assigned
3. **Auto-move to In Progress**: When a branch is created for the issue
4. **Auto-move to In Review**: When a PR is opened
5. **Auto-move to Done**: When issue is closed

## Link Existing Issues

1. Click "Add items" in the project
2. Search for repository: CodingButter/braidarr
3. Select all existing issues
4. Add to project

## Team Access

Make sure all team members have write access to the project for updating their task status.

## Sprint Planning

The project uses 2-week sprints:
- **Sprint 1**: Sep 15 - Sep 26
- **Sprint 2**: Sep 29 - Oct 10  
- **Sprint 3**: Oct 13 - Oct 24
- **Sprint 4**: Oct 27 - Nov 07

## Milestones

We have 3 major milestones configured:
- **Phase 1: Core Infrastructure** (Due Sep 26)
- **Phase 2: Export & Integration** (Due Oct 24)
- **Phase 3: Operations & Polish** (Due Nov 07)

## Next Steps

Once the project board is created:
1. All team members should check the board for their assigned tasks
2. Update task status as work progresses
3. Leave comments on issues for communication
4. Check off checklist items as they're completed
5. Create worktrees for development as specified in TEAM_DEVELOPMENT_GUIDELINES.md