# CLI and records

Run `npm run students -- help`. All reads support `--json`. Flags use `--key=value`. Dates use YYYY-MM-DD. Run migrations before data commands. The source_id is a stable export identifier, not a name. A name can change without changing the source ID.

## Writes

`add <entity> --file=<record.json> --actor="Name"` inserts one record. Supported entities and their fields are in scripts/lib/entities.json. Required fields, accepted statuses and date constraints are also enforced in the migration. Foreign keys accept a source ID, full UUID, unique UUID prefix or unique case-insensitive name.

`complete <alerts|plans|actions|referrals> <record> --outcome="Evidence" --actor="Name"` records a verified conclusion. A plan cannot complete with open actions. Already completed records stop. `accept-referral <record> --outcome="Evidence"` records an external acknowledgement. It does not send the referral. `review-plan <record> --next=YYYY-MM-DD --outcome="Evidence"` records a review and a future review date.

`assign <learner> <adviser>` assigns a named adviser. `review-accuracy <learner> --evidence="What was checked"` records a completed accuracy review and its evidence as a note. `log <learner> --kind=phone --text="Verified summary"` records an interaction today. Add --date for a prior date. Future interactions are rejected. Note entries do not count as contact with the learner.

Use the operator's name in --actor. The default label is operator. It is a recorded label, not authentication or proof of identity. The database owner can alter audit history. This is not a tamper-proof archive.

## Reads

advisers, learners, caseload, alerts, plan-review, follow-ups, referral-chase, interactions, attention, compliance, history, weekly-review and insights. `learner <name-or-id>` returns the complete linked record. Alerts show open alerts, plan-review shows active plans, referral-chase shows pending and accepted referrals. Use learner or export to include closed history.

## Files

`export --json` writes all records and audit history to a uniquely named JSON file under exports/ and prints its path. This is a portable data snapshot, not a database backup/restore command. Use your database backup tools for disaster recovery.

`draft-weekly-review`, `draft-support-plan <learner>` and `draft-referral <referral>` write unique fact packs under drafts/. They never send. OUTPUT_DIR redirects exports, drafts and rendered output. DATA_DIR redirects local storage. The test and demo scripts clear DATABASE_URL and use temporary directories.
