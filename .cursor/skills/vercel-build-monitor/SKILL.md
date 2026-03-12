---
name: vercel-build-monitor
description: After any git push in this project, poll Vercel until the deployment reaches READY, ERROR, or CANCELED, then report success or failure to the user. Use when the user or agent has just run git push.
---

# Vercel build monitor (post–git push)

## When to use

Apply this skill **every time** a `git push` is performed in the Sommaire project (whether the user asked for it or the agent did it as part of a task). Do not consider the “push” task complete until the Vercel build has **finished** and you have reported the result.

## Constants

- **projectId:** `prj_7vPAuQxWmw5078d2DZA1qz1niut5`
- **teamId:** `team_hUSsjGJ9wvJ5FY0nHaZlJUkp`

## Steps

### 1. Get the latest deployment

Right after the push, call Vercel MCP:

- **Tool:** `list_deployments` with the projectId and teamId above.
- The **first** deployment in the list is the one just triggered by the push. Note its `id`.

### 2. Poll until a terminal state

- **Loop:**  
  - Call `get_deployment` with that deployment `id` and teamId.  
  - Read `state`.  
  - If `state` is **READY**, **ERROR**, or **CANCELED** → exit the loop and go to step 3.  
  - If `state` is **BUILDING** or **QUEUED** → wait **15–20 seconds** (e.g. `Start-Sleep -Seconds 18` in PowerShell, or equivalent), then repeat the loop.  
- **Do not** reply to the user with “build in progress” and a link. Keep polling until you get a terminal state.

### 3. Report to the user

Only after the loop has ended:

- **If READY:**  
  - Say the build **succeeded**.  
  - Give the deployment URL (and production URL if different).  
  - Give the Inspector URL for that deployment.

- **If ERROR (or CANCELED):**  
  - Say the build **failed** (or was canceled).  
  - Give the Inspector URL.  
  - For **ERROR**, call `get_deployment_build_logs` with that deployment id and teamId, and include the relevant error lines in your message so the user knows why it failed.

## Summary

- **Always** run this flow after a push; do not skip it.  
- **Always** wait in a loop until `state` is READY, ERROR, or CANCELED.  
- **Only then** send the final success or failure message to the user.
