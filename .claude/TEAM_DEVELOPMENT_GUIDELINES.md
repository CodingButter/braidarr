# Team Development Guidelines

## Required Reading

**All team members MUST read this document before beginning any work.**

## Core Workflow

### 1. Task Assignment & Project Board Management

#### GitHub Issues vs Project Items

- **Primary Source**: GitHub Project Board (https://github.com/users/CodingButter/projects/10)
- **Issues**: Contain the detailed requirements and checklists
- **Project Items**: Track status and assignments in the project board
- **IMPORTANT**: Assignments are shown WITHIN each project item - check the project board to see your assigned tasks

#### Assignment Updates

- Assignments are visible in the project item itself
- To update assignment: Update the GitHub issue (the project item will sync automatically)
- Check the project board regularly for tasks assigned to your role

#### Required Updates When Starting Work

1. **Create Worktree FIRST** (see Section 2)
2. **Update Project Item**:
   - Change status from "Todo" to "In Progress"
   - Add branch/worktree name to the item
   - Comment on the issue with worktree details
3. **Link Branch**: Associate your branch with the issue

#### Status Management

**CRITICAL**: Team members can ONLY use these statuses:

- **Todo**: Not started yet (default for new items)
- **In Progress**: Actively working on the task
- **Pending Approval**: Work complete, awaiting review
- **Blocked**: Cannot proceed due to dependencies

**NEVER set status to "Done"** - Only the Project Manager can mark items as complete after review

#### Checklist Management

- Issues contain checklists - check off items as you complete them
- This helps track granular progress within each task
- Update both issue checklists AND project item status

### 2. Development Environment Setup

#### Worktree Creation & Project Item Association

- **ALL development MUST be done in a dedicated Git worktree**
- Worktrees are created in: `./worktrees/` (project root, NOT inside the repo folder)
- Naming convention: `worktrees/issue-<number>-<brief-description>`
- Example: `worktrees/issue-1-auth-system` or `worktrees/issue-42-bug-fix`

#### MANDATORY: Link Worktree to Project Item

**When creating a worktree, you MUST:**

1. Update the project item status to "In Progress"
2. Comment on the GitHub issue with your worktree/branch name
3. Use the exact issue number in your branch name for automatic linking

#### Environment Configuration

1. Create your worktree (use issue number in name):

   ```bash
   git worktree add ./worktrees/issue-<number>-<description> -b issue-<number>-<description>
   ```

2. Navigate to your worktree:

   ```bash
   cd ./worktrees/issue-<number>-<description>
   ```

3. Copy the `.env` file from the main repository:

   ```bash
   cp ../../.env .env
   ```

4. Update the `.env` file with your assigned port configurations

5. **IMMEDIATELY update the project item**:
   - Go to the project board
   - Find your item
   - Change status to "In Progress"
   - Comment on the issue: "Started work in worktree: issue-<number>-<description>"

### 3. Port Assignments

Each team member is assigned a specific port range to prevent conflicts:

| Team Member | Port Range | Services                   |
| ----------- | ---------- | -------------------------- |
| Agent 1     | 3000-3099  | Dev server, API, WebSocket |
| Agent 2     | 3100-3199  | Dev server, API, WebSocket |
| Agent 3     | 3200-3299  | Dev server, API, WebSocket |
| Agent 4     | 3300-3399  | Dev server, API, WebSocket |
| Agent 5     | 3400-3499  | Dev server, API, WebSocket |

**Update your `.env` file with ports from YOUR assigned range only.**

### 4. Communication Protocol

#### Issue Comments & Project Updates

- **Regular Updates**: Post progress updates at least daily on the GitHub issue
- **Status Changes**: Update project item status when work state changes
- **Blockers**: Immediately change status to "Blocked" and report blockers with @mentions
- **Completion**: Change status to "Pending Approval" when ready for review
- **Questions**: Ask questions directly in the issue comments

#### Required Comment Format

```markdown
**Status Update - [Date]**

- Worktree: issue-<number>-<description>
- Project Status: [Todo/In Progress/Pending Approval/Blocked]
- Progress: [What you've completed - reference checklist items]
- Current: [What you're working on]
- Blockers: [Any issues] @project-manager @lead-developer
- Next: [What you plan to do next]
```

#### Project Item Status Transitions

- **Todo → In Progress**: When you create your worktree and start work
- **In Progress → Blocked**: When you encounter a blocking dependency
- **Blocked → In Progress**: When the blocker is resolved
- **In Progress → Pending Approval**: When work is complete and ready for review
- **Any Status → Todo**: Only if work needs to be restarted (requires PM approval)

#### Escalation Path

1. **Technical Issues**: Comment and tag @lead-developer
2. **Resource/Planning Issues**: Comment and tag @project-manager
3. **Cross-team Dependencies**: Both @project-manager and @lead-developer

### 5. Development Standards

#### Before Starting Work

1. Check the project board for your assigned items
2. Read the entire issue description
3. Review any linked issues or documentation
4. Check for existing related code/branches
5. Create your worktree with issue number: `issue-<number>-<description>`
6. Update project item status to "In Progress"
7. Comment on the issue confirming you've started work with worktree name

#### During Development

1. Make atomic commits with clear messages
2. Follow existing code conventions
3. Write/update tests as needed
4. Document complex logic
5. Check off checklist items in the issue as completed
6. Post daily status updates on the issue
7. Update project item status if blocked

#### Before Requesting Approval

1. Run all tests in your worktree
2. Verify no port conflicts
3. Update any relevant documentation
4. Push your branch
5. Ensure all checklist items are checked
6. Comment detailed summary of changes
7. **Change project item status to "Pending Approval"**
8. Create pull request if required
9. **DO NOT mark as "Done" - wait for PM approval**

### 6. Worktree Management

#### Creating a Worktree

```bash
# From project root (NOT inside repo folder)
git worktree add ./worktrees/issue-<number>-<brief-description> -b <branch-name>
```

#### Listing Worktrees

```bash
git worktree list
```

#### Removing a Worktree (after PR merge)

```bash
# Remove the worktree
git worktree remove ./worktrees/<worktree-name>

# Prune worktree references
git worktree prune
```

### 7. Special Roles

#### Project Manager

- Creates and prioritizes issues
- Assigns team members to tasks
- Monitors overall progress
- Resolves resource conflicts
- Communicates with stakeholders

#### Lead Developer

- Reviews technical approaches
- Assists with technical blockers
- Performs code reviews
- Maintains technical standards
- Approves architectural decisions

### 8. Project Item & Issue Lifecycle

#### Status Flow (Project Board)

1. **Todo**: Item created and assigned but not started
2. **In Progress**: Developer has created worktree and started work
3. **Blocked**: Cannot proceed due to dependencies (must comment reason)
4. **Pending Approval**: Work complete, awaiting PM/Lead review
5. **Done**: Approved and merged by Project Manager (ONLY PM can set)

#### Issue Updates

- **Assignments**: Check project board for items assigned to your role
- **Checklists**: Check off items in the issue as you complete them
- **Comments**: Daily updates required with worktree reference
- **Branches**: Must include issue number for automatic linking
- **Pull Requests**: Reference issue number in PR title/description

### 9. Emergency Procedures

#### Port Conflict

1. Check your assigned range
2. If within range, check other worktrees
3. Comment on issue with conflict details
4. Tag @project-manager for reallocation

#### Merge Conflicts

1. Pull latest main branch
2. Resolve in your worktree
3. Test thoroughly
4. If complex, request help from @lead-developer

#### Critical Bugs

1. Stop current work
2. Comment immediately on relevant issue
3. Tag both @project-manager and @lead-developer
4. Await instructions before proceeding

### 10. Daily Checklist

- [ ] Check GitHub Project Board for your assigned items
- [ ] Review current item status (Todo/In Progress/Blocked/Pending Approval)
- [ ] Update project item status if work state changes
- [ ] Post daily status update on current issue with worktree reference
- [ ] Check off completed checklist items in the issue
- [ ] Ensure worktree is up to date with main
- [ ] Verify using correct port range
- [ ] Commit work with clear messages referencing issue number
- [ ] Update to "Pending Approval" when ready for review

## Critical Rules - MUST FOLLOW

1. **Project Board is Primary**: Always check the project board for assignments
2. **Worktree Naming**: MUST include issue number: `issue-<number>-<description>`
3. **Status Updates**: Only use Todo, In Progress, Blocked, or Pending Approval
4. **Never Set Done**: Only the Project Manager can mark items as Done
5. **Daily Updates**: Post progress on GitHub issue with worktree reference
6. **Blocked Items**: Must immediately update status and comment reason
7. **Branch Association**: Always include issue number for automatic linking

## Port Assignments by Role

- **Full-Stack Developer**: 3100-3199
- **Integration Engineer**: 3200-3299
- **QA Engineer**: 3300-3399
- **Lead Developer**: 3400-3499
- **Project Manager**: 3000-3099

## Remember

- **Check the project board first** - assignments are shown there
- **Create worktree with issue number** - enables automatic tracking
- **Update project item status** - keeps everyone informed
- **Never mark as Done** - wait for PM approval
- **Communicate blockers immediately** - change status to Blocked
- **Reference issue numbers** - in branches, commits, and PRs

---

_Last Updated: September 12, 2025_
_Version: 2.0_
