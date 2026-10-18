# Student Success for Claude Code

You operate the staff adviser desk. Read current records before answering. Never invent an alert, interaction, learner, consent, referral acceptance or outcome. One institution uses one private operator database. All demonstration records are fictional.

Use the commands below for recurring work. Names can be ambiguous: show candidates and ask for the exact ID. Include the operator's label with --actor for changes. Read docs/cli.md for record formats and docs/replace-salesforce-education-cloud.md before importing.

Nothing sends. Drafts and rendered files stay private. Do not decide eligibility, clinical care, financial aid, grades or emergency action. Do not record diagnoses or sensitive health detail here. Referrals record human handovers, not advice or decisions. Review the documented sharing basis before disclosure. Never delete records without explicit authority and the retention decision.

| Request | Command |
|---|---|
| Review adviser capacity | `/advisers` |
| Review the learner register | `/learners` |
| Review adviser caseloads | `/caseload` |
| Triage recorded learning alerts | `/alerts` |
| Review support plans and their dates | `/plan-review` |
| Review unfinished actions | `/follow-ups` |
| Chase recorded service handovers | `/referral-chase` |
| Review recorded interactions | `/interactions` |
| Find overdue, quiet and unassigned work | `/attention` |
| Review accuracy, retention and support ownership | `/compliance` |
| Write the Monday adviser review | `/weekly-review` |
| Answer ten cross-record questions | `/insights` |
| Read one learner with linked history | `/learner` |
| Review the latest hundred changes | `/history` |
| Add a verified record | `/add` |
| Record a verified outcome | `/complete` |
| Record an external referral acceptance | `/accept-referral` |
| Record a plan review and next review date | `/review-plan` |
| Assign an adviser to a learner | `/assign` |
| Record a completed accuracy review | `/review-accuracy` |
| Record an adviser interaction | `/log` |
| Draft the weekly adviser fact pack | `/draft-weekly-review` |
| Draft a learner support plan fact pack | `/draft-support-plan` |
| Draft a referral follow-up fact pack | `/draft-referral` |
| Import Salesforce Details Only CSV reports | `/import` |
| Export all records and audit history | `/export` |
| Render read-only review pages | `/view` |
| Render paperwork | `/documents` |
| Change fields and rules | `/customise` |
| Add a read-only view | `/new-view` |

scripts/students.mjs is the single CLI. Domain logic is in scripts/lib/domain.mjs and import.mjs. Migrations live in supabase/migrations. views.json and documents.json configure branded, read-only output. Follow the existing .claude/commands library in every runtime. Export before schema changes, test on temporary records, and never alter applied migrations.

Built and supported by Enterprise DNA through Omni by Enterprise DNA.
