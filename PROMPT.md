@plan.md @activity.md

We are rebuilding the project from scratch in this repo. Therefore, no backwards compatibility is asked for.

# Process

First read activity.md to see what was recently accomplished.
Then open plan.md and choose the single highest priority task where passes is false.
Work on exactly ONE task: implement the change.

# Site details

Web: http://localhost:3000/
Storybook: http://localhost:6006/

> Note, these sites hot reload and update. Do not try to start your own servers

# Testing

After implementing, use Playwright to:

1. Navigate to http://localhost:3000/

- If you need to login, proceed to http://localhost:3000/signup
  then click "Enter Demo User" which will redirect you to /dashboard as an authenticated user

2. Take a screenshot and save it as screenshots/[task-name].png

Append a dated progress entry to activity.md describing what you changed and the screenshot filename.
Update that task's passes in plan.md from false to true.
Make one git commit for that task only with a clear message.
Do not git init, do not change remotes, do not push.

ONLY WORK ON A SINGLE TASK.

When ALL tasks have passes true, output <promise>COMPLETE</promise>
