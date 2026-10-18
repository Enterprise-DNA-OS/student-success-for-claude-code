# Student Success for Claude Code

Keep adviser caseloads, support plans, referrals and follow-ups in a database your institution owns. Free under the MIT licence. Works with Claude Code, Codex, OpenCode or Cursor.

| Do it yourself | We customise it | We run it for you |
|---|---|---|
| Free. Install the demo and bring your reports across. | Your fields, programmes, support rules and documents. | Installed and operated through Omni by Enterprise DNA. One setup fee, then a retainer. |
| [Start here](#quick-start) | [Get your version built](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=salesforce-education-cloud&utm_medium=readme) | [Talk to Sam](https://enterprisedna.co/omni/book?offer=replace-software&utm_campaign=salesforce-education-cloud&utm_medium=readme) |

## The weekly job

Review caseloads, triage recorded alerts, review support plans, follow up agreed actions and check unanswered referrals. Each job has its own command. Ask which overdue alerts belong to learners nobody has contacted recently, or which services still owe a response. The Monday review combines the caseload, exception list and referral queue.

Salesforce lists Education Cloud Sales & Service Core at US$87 per user/month, billed annually, for eligible nonprofit institutions. Twenty-five paid seats model US$26,100 a year before implementation. This is a list-price calculation, not a customer invoice. Eligibility, grants, discounts and contract terms change the actual bill. [Vendor pricing](https://www.salesforce.com/education/pricing/), checked 18 October 2026.

This is the staff adviser desk, not all of Education Cloud. It records learning-support work. Admissions, recruitment, grades, clinical records, automated risk scoring, financial aid decisions, payments and emergency response are outside its scope. It makes no decision about a learner's eligibility or care.

## Quick start

```bash
git clone https://github.com/Enterprise-DNA-OS/student-success-for-claude-code.git
cd student-success-for-claude-code
npm install
npm test
npm run demo
```

Node 20.11 or later. The demo runs on fictional records in temporary storage and removes them afterwards. For a persistent demo, run `npm run migrate` then `npm run seed`. For real records, run migrate without seed, then import. Do not mix demo learners with a real portfolio.

PGlite runs locally without a database installation. DATABASE_URL selects your shared Postgres database. Use one institution per private database and trusted operator connections. Do not expose this base to a public browser API. Review server roles, encryption, access, backups and retention before loading personal records. RLS blocks non-owner access by default; it is not an adviser-by-adviser permissions system.

Open the folder in your coding agent and ask `/weekly-review`.

## Commands

| Job | Command |
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

Every read supports `--json`. Names match without case sensitivity. Ambiguous names list candidates and exit with an error. Mutations record the operator label and before/after values. See [CLI formats](docs/cli.md).

## Ten questions answered from your records

The tested `/insights` command answers all ten below. These join several kinds of records. We do not claim Salesforce cannot be configured to answer them.

1. Which learners have overdue alerts and no recent contact?
2. Which active learners have an alert but no active support plan?
3. Which advisers are over their agreed caseload capacity?
4. Which overdue actions belong to plans whose review is also overdue?
5. Which learners have both pending referrals and high-priority alerts?
6. Which active learners have no adviser?
7. Which cohorts have overdue alerts?
8. Which inactive learners are due for a retention review?
9. Which learners have open alerts and stale accuracy reviews?
10. Which services have unanswered referrals past their response date?

## Your first hour: ten things to ask for

1. Show me the adviser caseloads and capacity limits.
2. Find overdue alerts for learners we have not contacted recently.
3. Show me active learners without a support plan.
4. Which agreed actions are overdue?
5. Which services still owe a referral response?
6. Draft the weekly adviser review, using only recorded facts.
7. Put our institution name and logo on the support-plan paperwork.
8. Import our report files as a test run and show ignored columns.
9. Add our campus field and include it in the caseload review.
10. Change our quiet-contact reminder from fourteen days to our agreed review interval.

## Paperwork and views

`npm run docs` creates branded support-plan reviews, referral briefs and adviser handovers under docs-out/. `npm run view` creates three read-only review pages under views/. Change the name, logo and colours in brand.json. Print the HTML to PDF if needed. Draft commands write JSON fact packs under drafts/; the matching slash commands turn those verified facts into editable prose. Nothing sends.

## Bring your history

Export Salesforce Details Only CSV reports and map your report labels to the documented fields. One command imports all supported files in dependency order. The importer supports source IDs, linked records, dry runs and atomic rollback. It leaves unchanged reruns alone and stops on conflicting values. [Switch guide](docs/replace-salesforce-education-cloud.md).

This is not a universal Salesforce backup restore. Export attachments, access settings and other unsupported records separately. Reconcile counts and sample learners before changing your working system.

## Record checks

`/compliance` flags stale accuracy checks, retention reviews and learners without an assigned adviser. [Rules and sources](docs/compliance.md) distinguish legal principles from internal reminders. No findings is not a compliance certificate. Human staff retain responsibility for support, disclosure and urgent situations.

## Verification

`npm test` creates its own temporary database and checks every CLI path, all seven import types, transaction rollback, workflow constraints, private access, audit history, ten questions, drafts and rendered paperwork. CI covers Linux and Windows on Node 20 and 22. A configured CI workflow is separate from an observed CI result.

## Licence

MIT. Copyright 2026 Enterprise DNA. Salesforce is a trademark of Salesforce, Inc. This independent project is not affiliated with or endorsed by Salesforce.
