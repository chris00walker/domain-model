---
description: keep feature branches in sync with main, automate commits, and open pull requests
include: ../rules/acceptance-criteria.md
---

// turbo-all

> IMPORTANT
> • Requires GitHub CLI (`gh`) authenticated.
> • Adjust the test command in Step 5 for your stack (npm, pytest, gradle, etc.).

1. Display git status so you see what will be included

   ```bash
   git status
   ```

2. Stage **all** tracked file changes (add new files, update deletions)

   ```bash
   git add -A
   ```

3. Commit with an auto-generated message summarising changed files

   ```bash
   git commit -m "chore(sync): $(git diff --cached --name-only | head -n 20 | paste -sd ',' -)"
   ```

   # Edits >20 files? add a generic suffix

   ```bash
   if [ $(git diff --cached --name-only | wc -l) -gt 20 ]; then git commit --amend -m "chore(sync): update $(git diff --cached --name-only | wc -l) files"; fi
   ```

4. Fetch latest main and rebase current branch

   ```bash
   git fetch origin
   git rebase origin/main
   ```

5. Run the project test suite to ensure the rebase is clean

   ```bash
   npm test   # <-- change if necessary
   ```

6. Push the rebased branch (force-with-lease protects remote changes)

   ```bash
   git push --force-with-lease
   ```

7. Open (or update) a pull request automatically

   ```bash
   gh pr create --fill --web || gh pr edit --head $(git rev-parse --abbrev-ref HEAD) --title "$(git log -1 --pretty=%s)" --body "Automated sync via /git-sync workflow"
   ```

8. Finished! Your branch is now up-to-date and the PR is ready.
