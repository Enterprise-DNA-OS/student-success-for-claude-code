---
description: Import Salesforce Details Only CSV reports
---

# Import Salesforce Details Only CSV reports

Read current records before answering. Use --json when assembling a report. Quote the source IDs. Never invent a date, outcome, consent or interaction. Read docs/replace-salesforce-education-cloud.md. Show inserted, unchanged and ignored columns from the dry run. Reconcile totals with the source. Once the operator authorises the import, repeat without --dry-run. Changed source records require reconciliation.

```bash
npm run students -- import salesforce <folder> --mapping=<mapping.json> --dry-run --actor="<operator>"
```
