# Bring Salesforce adviser records across

The switch is a report export and one import command after mapping. Allow a working day for a small, clean adviser portfolio; larger or customised organisations need a scoped migration. Do not retire the source until the records reconcile.

## Export the report details

Use a Salesforce user authorised to export the records. In Reports, open each report, choose Export, then Details Only and CSV. Include stable record IDs and the related record IDs, not just names. Export the full relevant date range without grouping or subtotal rows. Salesforce's [report export guide](https://trailhead.salesforce.com/content/learn/projects/create-reports-and-dashboards-for-sales-and-marketing-managers/manage-reported-data) documents this route. Save the files as UTF-8 comma-delimited CSV. If your locale exports another delimiter, convert it first. Protect these files as personal information.

The [Student Success data model](https://developer.salesforce.com/docs/platform/data-models/guide/student-success.html) includes learner, care-plan and related support records. Salesforce object and report labels differ by installation. The examples here are a documented import contract, not a claim that every organisation exports these headings by default.

## Map your files

| File | Records | Relationships |
|---|---|---|
| advisers.csv | Adviser IDs, names and agreed capacity | None |
| learners.csv | Learner IDs, names, programme, cohort, status, accuracy and retention review dates | adviser_id |
| alerts.csv | Recorded alert, priority, opened and due dates, owner and outcome | learner_id |
| plans.csv | Support goal, review date, owner and outcome | learner_id |
| actions.csv | Agreed task, due date, owner and completion | plan_id |
| referrals.csv | Service handover, response date, sharing basis and outcome | learner_id |
| interactions.csv | Recorded contact date, method, owner and concise summary | learner_id |

Each file requires source_id and the fields shown in examples/salesforce. Closed records also require outcome and closed_on. Accepted values are documented in the migration and examples. Custom report labels map with a JSON object keyed by entity, then source heading to destination field. See examples/salesforce/mapping.json. A field not covered by the model must be added through `/customise` or retained separately. Unknown columns are listed in the import report.

## Run one import

```bash
npm run migrate
npm run students -- import salesforce ./your-exports --mapping=./your-mapping.json --dry-run --json
npm run students -- import salesforce ./your-exports --mapping=./your-mapping.json --actor="Migration reviewer" --json
```

The import runs files in dependency order in one transaction. The dry run validates every file and rolls back records and audit changes. Real imports preserve source IDs. An unchanged rerun adds nothing. A duplicate source ID, missing parent, invalid date or conflicting row stops the batch without partial changes. Reconcile changed rows deliberately; the importer does not overwrite adviser decisions.

## Reconcile before switching

Compare source and destination counts by entity and status. Open sample learners and check their alerts, plans, actions, referrals and contact history. Check unsupported columns, then render a support-plan review and handover. Keep a secured export and database backup. Run both systems for the agreed validation period.

Attachments, emails, portal accounts, sharing rules, report definitions, automation, academic results, appointment booking and historical source audit logs do not import. This tool starts its own audit at import. No connection to Salesforce is required after export. Enterprise DNA maps custom fields and remaining history as part of an agreed migration.
