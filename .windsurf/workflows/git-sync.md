---
description: keep feature branches in sync with main, automate commits, and open pull requests
include: ../rules/acceptance-criteria.md
---

// turbo-all

> IMPORTANT
> • Requires GitHub CLI (`gh`) authenticated.
> • Adjust the test command in Step 5 for your stack (npm, pytest, gradle, etc.).

1. Quick status (optional)

   ```bash
   git status
   ```

2. Stage changes

   ```bash
   git add -A
   ```

3. Commit (auto-message summarises files)

   ```bash
   git commit -m "chore(sync): $(git diff --cached --name-only | head -n 20 | paste -sd ',' -)"
   ```

   # Edits >20 files? add a generic suffix

   ```bash
   if [ $(git diff --cached --name-only | wc -l) -gt 20 ]; then git commit --amend -m "chore(sync): update $(git diff --cached --name-only | wc -l) files"; fi
   ```

4. Rebase onto latest main

   ```bash
   git fetch origin
   git rebase origin/main   # stop & resolve if conflict
   ```

5. Run tests

   ```bash
   npm test   # adjust for your stack
   ```

6. Push (force-with-lease) & open/refresh PR

   ```bash
   git push --force-with-lease
   ```

   The `gh` command below creates or updates the PR automatically.

   ```bash
   gh pr create --fill --web || gh pr edit --head $(git rev-parse --abbrev-ref HEAD) --title "$(git log -1 --pretty=%s)" --body "Automated sync via /git-sync workflow"
   ```

---

This streamlined version avoids giant rebases; run it **daily** while your branch is small to keep conflicts trivial.

   ```bash
   gh pr create --fill --web || gh pr edit --head $(git rev-parse --abbrev-ref HEAD) --title "$(git log -1 --pretty=%s)" --body "Automated sync via /git-sync workflow"
   ```

