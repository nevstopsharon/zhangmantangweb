# Jira Change Synchronization

This repository uses Jira as the status record for each concrete change.

## Required Jira Setup

- Atlassian site URL: `https://lcface.atlassian.net`
- Jira project key: `KAN`
- Jira project name: `My PM Team`
- Issue type for implementation work: `任务`
- Completed status: `已完成`
- Completed transition: `完成`

## Per-Change Workflow

1. Break the request into independent change items.
2. Create one Jira issue for each change item.
3. Implement the change in the repository.
4. Add a Jira update with:
   - changed files or pages
   - verification performed
   - deployment URL, if deployed
5. Transition the Jira issue to the completed status only after verification passes.

## Issue Summary Format

Use this pattern:

```text
[Website] <short observable change>
```

Example:

```text
[Website] Hide phone number from contact sections
```

## Issue Description Format

Use this structure:

```text
Change:
- <one observable change>

Affected area:
- <files, routes, or page sections>

Verification:
- <command, browser route, or deployed URL to check>

Completion rule:
- Mark complete only after verification confirms the intended behavior.
```

## Pending Sync Queue

Use this section only when Jira cannot be reached or the target project is unknown.

Current blocker:
- Atlassian Rovo cannot access the target Jira instance in this environment. Current error: `403` with `The app is not installed on this instance`.

Pending items:
- `ZMT-19` pending sync: add repository image naming standard.
  Files:
  - `docs/image-naming-standard.md`
  Verification:
  - document created and stored in repository
- `ZMT-20` pending sync: normalize current image asset names and align all references.
  Files:
  - `images/**`
  - `site/images/**`
  - `data/works.json`
  - `data/news.json`
  - `data/exhibitions.json`
  - `data/profile.json`
  - `site/data/works.json`
  - `site/data/news.json`
  - `site/data/exhibitions.json`
  - `site/data/profile.json`
  - `excel/content.xlsx`
  - `excel/content-spec.md`
  - `scripts/init_structure.py`
  Verification:
  - `OLD_HITS=0` for workbook path audit
  - `MISSING=0` for image references in `data/*.json`
  - `Compare-Object` clean between `data/*` and `site/data/*`
  - only non-matching names under `images/` and `site/images/` are `README.txt` files

Synced items:
- `KAN-5`: [Website] 建立 Jira 变更同步机制. Status: `已完成`.
