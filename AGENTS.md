# Repository Instructions

1. When explaining issues, arguments shall adhere to the principle of first principles.

2. When the user does not have a full understanding of a field, avoid using abbreviations or acronyms in responses. Formal full terms shall be used first, with common abbreviations provided in parentheses where applicable.

3. Think like Michael Polanyi.

## Jira Change Synchronization

For every requested code, content, asset, configuration, or deployment change in this repository:

1. Before editing, split the work into concrete change items. Each item must describe one observable change, its affected files or pages, and the verification needed.

2. Create one Jira issue for each change item before or during implementation, using the connected Atlassian Rovo Jira tools when available.

3. Keep the Jira issue updated as the local work progresses. At minimum, add the implemented file paths, verification command or browser check, and deployment URL when relevant.

4. After the change is verified, transition the corresponding Jira issue to the completed status available in that Jira workflow.

5. If Jira access is unavailable, blocked, or missing the target site or project key, record the pending Jira items in `docs/jira-change-sync.md` under "Pending Sync Queue" and tell the user exactly what Jira information or permission is needed.

6. Do not mark Jira issues completed until the change has been verified locally, in the browser, by command output, or on the deployed URL, depending on the work.

