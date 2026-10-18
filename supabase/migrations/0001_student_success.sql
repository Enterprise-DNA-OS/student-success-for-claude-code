create function stamp_record() returns trigger language plpgsql as $$ begin new.updated_at=clock_timestamp(); return new; end $$;
create table audit_log(id uuid primary key default gen_random_uuid(), entity text not null, record_id uuid not null, operation text not null, actor text not null, before_row jsonb, after_row jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table audit_log enable row level security;
revoke all on audit_log from public;
create function audit_record() returns trigger language plpgsql as $$ begin
 insert into audit_log(entity,record_id,operation,actor,before_row,after_row) values(TG_TABLE_NAME,coalesce(new.id,old.id),TG_OP,coalesce(nullif(current_setting('app.actor',true),''),'database-owner'),case when TG_OP<>'INSERT' then to_jsonb(old) end,case when TG_OP<>'DELETE' then to_jsonb(new) end);
 return coalesce(new,old); end $$;
create table advisers(id uuid primary key default gen_random_uuid(),
source_id text not null unique check(length(trim(source_id))>0),
name text not null,
capacity integer not null default 30 check(capacity>0),
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check(length(trim(name))>0));
alter table advisers enable row level security;
revoke all on advisers from public;
create trigger stamp before update on advisers for each row execute function stamp_record();
create trigger audit after insert or update or delete on advisers for each row execute function audit_record();
create table learners(id uuid primary key default gen_random_uuid(),
source_id text not null unique check(length(trim(source_id))>0),
name text not null,
programme text not null,
cohort text not null,
adviser_id uuid references advisers(id),
status text not null default 'active' check(status in ('active','completed','withdrawn')),
accuracy_checked_on date,
retention_review_on date not null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check(length(trim(name))>0));
alter table learners enable row level security;
revoke all on learners from public;
create trigger stamp before update on learners for each row execute function stamp_record();
create trigger audit after insert or update or delete on learners for each row execute function audit_record();
create index learners_adviser_id_idx on learners(adviser_id);
create table alerts(id uuid primary key default gen_random_uuid(),
source_id text not null unique check(length(trim(source_id))>0),
learner_id uuid not null references learners(id),
name text not null,
priority text not null check(priority in ('routine','high')),
opened_on date not null,
due_on date not null,
owner text not null,
status text not null default 'open' check(status in ('open','closed')),
outcome text,
closed_on date,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check(length(trim(name))>0),
check(length(trim(owner))>0),
check(due_on>=opened_on),
check((status='closed' and closed_on is not null and outcome is not null and length(trim(outcome))>0) or (status<>'closed' and closed_on is null)));
alter table alerts enable row level security;
revoke all on alerts from public;
create trigger stamp before update on alerts for each row execute function stamp_record();
create trigger audit after insert or update or delete on alerts for each row execute function audit_record();
create index alerts_learner_id_idx on alerts(learner_id);
create table plans(id uuid primary key default gen_random_uuid(),
source_id text not null unique check(length(trim(source_id))>0),
learner_id uuid not null references learners(id),
name text not null,
goal text not null,
start_on date not null,
review_on date not null,
owner text not null,
status text not null default 'active' check(status in ('active','completed')),
outcome text,
closed_on date,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check(length(trim(name))>0),
check(length(trim(owner))>0),
check(review_on>=start_on),
check((status='completed' and closed_on is not null and outcome is not null and length(trim(outcome))>0) or (status<>'completed' and closed_on is null)));
alter table plans enable row level security;
revoke all on plans from public;
create trigger stamp before update on plans for each row execute function stamp_record();
create trigger audit after insert or update or delete on plans for each row execute function audit_record();
create index plans_learner_id_idx on plans(learner_id);
create table actions(id uuid primary key default gen_random_uuid(),
source_id text not null unique check(length(trim(source_id))>0),
plan_id uuid not null references plans(id),
name text not null,
due_on date not null,
owner text not null,
status text not null default 'open' check(status in ('open','done')),
outcome text,
closed_on date,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check(length(trim(name))>0),
check(length(trim(owner))>0),
check((status='done' and closed_on is not null and outcome is not null and length(trim(outcome))>0) or (status<>'done' and closed_on is null)));
alter table actions enable row level security;
revoke all on actions from public;
create trigger stamp before update on actions for each row execute function stamp_record();
create trigger audit after insert or update or delete on actions for each row execute function audit_record();
create index actions_plan_id_idx on actions(plan_id);
create table referrals(id uuid primary key default gen_random_uuid(),
source_id text not null unique check(length(trim(source_id))>0),
learner_id uuid not null references learners(id),
name text not null,
service text not null,
requested_on date not null,
due_on date not null,
owner text not null,
sharing_basis text not null,
status text not null default 'pending' check(status in ('pending','accepted','closed')),
outcome text,
closed_on date,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check(length(trim(name))>0),
check(length(trim(owner))>0),
check(due_on>=requested_on),
check((status='closed' and closed_on is not null and outcome is not null and length(trim(outcome))>0) or (status<>'closed' and closed_on is null)),
check(length(trim(sharing_basis))>0));
alter table referrals enable row level security;
revoke all on referrals from public;
create trigger stamp before update on referrals for each row execute function stamp_record();
create trigger audit after insert or update or delete on referrals for each row execute function audit_record();
create index referrals_learner_id_idx on referrals(learner_id);
create table interactions(id uuid primary key default gen_random_uuid(),
source_id text not null unique check(length(trim(source_id))>0),
learner_id uuid not null references learners(id),
name text not null,
occurred_on date not null,
kind text not null check(kind in ('meeting','phone','email','note')),
summary text not null,
owner text not null,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now(),
check(length(trim(name))>0),
check(length(trim(owner))>0));
alter table interactions enable row level security;
revoke all on interactions from public;
create trigger stamp before update on interactions for each row execute function stamp_record();
create trigger audit after insert or update or delete on interactions for each row execute function audit_record();
create index interactions_learner_id_idx on interactions(learner_id);

create function validate_workflow() returns trigger language plpgsql as $$
begin
 if TG_TABLE_NAME='actions' then
 if new.status='open' and not exists(select 1 from plans where id=new.plan_id and status='active') then raise exception 'Open actions require an active plan'; end if;
 end if;
 if TG_TABLE_NAME='plans' then
 if new.status='completed' and exists(select 1 from actions where plan_id=new.id and status='open') then raise exception 'Complete open actions before completing the plan'; end if;
 end if;
 if TG_TABLE_NAME='interactions' then
 if new.occurred_on>current_date then raise exception 'Interactions cannot be dated in the future'; end if;
 end if;
 return new;
end $$;
create trigger workflow before insert or update on actions for each row execute function validate_workflow();
create trigger workflow before insert or update on plans for each row execute function validate_workflow();
create trigger workflow before insert or update on interactions for each row execute function validate_workflow();
create index alerts_open_due_idx on alerts(due_on) where status='open';
create index actions_open_due_idx on actions(due_on) where status='open';
create index referrals_pending_due_idx on referrals(due_on) where status='pending';
create index interactions_learner_date_idx on interactions(learner_id,occurred_on desc);
create view v_caseload with(security_invoker=true) as
select l.id,l.source_id,l.name,l.programme,l.cohort,l.status,coalesce(a.name,'Unassigned') as adviser,
(select max(i.occurred_on) from interactions i where i.learner_id=l.id and i.kind<>'note') as last_contact,
(select count(*) from alerts x where x.learner_id=l.id and x.status='open') as open_alerts,
(select count(*) from plans p where p.learner_id=l.id and p.status='active') as active_plans,
(select count(*) from referrals r where r.learner_id=l.id and r.status='pending') as pending_referrals
from learners l left join advisers a on a.id=l.adviser_id;
create view v_follow_ups with(security_invoker=true) as
select a.id,a.source_id,l.name as learner,p.name as plan,a.name as action,a.owner,a.due_on,a.status,(current_date-a.due_on) as days_overdue
from actions a join plans p on p.id=a.plan_id join learners l on l.id=p.learner_id where a.status='open';
create view v_attention with(security_invoker=true) as
select 'Alert overdue'::text as issue,a.source_id,l.name as learner,a.owner,a.due_on from alerts a join learners l on l.id=a.learner_id where a.status='open' and a.due_on<current_date
union all select 'Action overdue',source_id,learner,owner,due_on from v_follow_ups where due_on<current_date
union all select 'Plan review due',p.source_id,l.name,p.owner,p.review_on from plans p join learners l on l.id=p.learner_id where p.status='active' and p.review_on<=current_date
union all select 'Referral awaiting response',r.source_id,l.name,r.owner,r.due_on from referrals r join learners l on l.id=r.learner_id where r.status='pending' and r.due_on<current_date
union all select 'No recent contact',source_id,name,adviser,last_contact from v_caseload where status='active' and (last_contact is null or last_contact<current_date-14)
union all select 'No assigned adviser',source_id,name,adviser,null::date from v_caseload where status='active' and adviser='Unassigned';
create view v_compliance with(security_invoker=true) as
select 'ACC-01'::text as rule,source_id,name as learner,'Review accuracy before use or disclosure'::text as finding,'NZ Privacy Principle 8; 90-day internal review threshold'::text as basis from learners where accuracy_checked_on is null or accuracy_checked_on<current_date-90
union all select 'RET-01',source_id,name,'Review continued retention; do not auto-delete','NZ Privacy Principle 9; operator-set review date' from learners where retention_review_on<=current_date
union all select 'SUP-01',source_id,name,'Assign a responsible adviser','Internal support policy; supports NZQA Code Outcome 1' from learners where status='active' and adviser_id is null;
