# Record checks and their sources

Checked 18 October 2026. The base prompts staff to review records. It does not certify compliance, supply a complete safeguarding system or substitute for the institution's policies.

| Check | Implemented behaviour | Source and limit |
|---|---|---|
| ACC-01 | Missing accuracy check or a check more than 90 days old appears for review. `/review-accuracy` records the verification evidence. | [NZ Privacy Principle 8](https://www.privacy.org.nz/privacy-principles/8/) requires reasonable accuracy steps before use or disclosure. Ninety days is our configurable internal reminder, not a legal safe harbour. |
| RET-01 | An operator-set retention review date on or before today appears for review. No automatic deletion occurs. | [NZ Privacy Principle 9](https://www.privacy.org.nz/privacy-principles/9/) limits retention to lawful need. No universal duration is implied. Account for other retention duties before deletion. |
| SUP-01 | Active learners without an adviser are flagged. | [NZQA tertiary-provider guidance, Outcome 1](https://www2.nzqa.govt.nz/assets/Tertiary/The-Code/guidance-for-tertiary-providers-the-education-pastoral-care-of-tertiary-and-international-learners-code-of-practice-2021.pdf) describes a responsive support system. Assigning an adviser is an internal control supporting that work, not proof of compliance with the Code. |

The fourteen-day quiet-contact reminder, adviser capacity, plan review dates and referral response dates are institution policies. Change them with `/customise`. NZ privacy principles are not a substitute for Australian obligations. An Australian institution must set its own jurisdiction-specific policy before operational use.

Referral records require a written sharing basis. A text field does not prove valid consent or lawful disclosure. The operator verifies the basis and minimises the information actually shared. Do not store diagnoses or clinical notes. Urgent wellbeing concerns use the institution's established human procedure, outside this tool.

Database tables have RLS with no public policies. Views use caller permissions. The intended connection is a trusted database owner for one institution. Configure limited roles before team use. This base has no student portal and no adviser-level access separation. Secure reports, drafts, exports and backups like the original records.
