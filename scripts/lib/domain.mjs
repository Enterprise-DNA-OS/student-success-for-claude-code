import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import path from 'node:path';
import {REPO_ROOT} from './db.mjs';
export const entities=JSON.parse(readFileSync(new URL('./entities.json',import.meta.url),'utf8'));
export const reads={
'advisers':`select a.source_id,a.name,a.capacity,count(l.id)::int as active_learners,greatest(count(l.id)-a.capacity,0)::int as over_capacity from advisers a left join learners l on l.adviser_id=a.id and l.status='active' group by a.id order by a.name`,
'learners':`select source_id,name,programme,cohort,status from learners order by name`,
'caseload':`select source_id,name,programme,adviser,last_contact,open_alerts,active_plans,pending_referrals from v_caseload where status='active' order by adviser,name`,
'alerts':`select a.source_id,l.name as learner,a.name as alert,a.priority,a.owner,a.due_on from alerts a join learners l on l.id=a.learner_id where a.status='open' order by a.due_on,a.source_id`,
'plan-review':`select p.source_id,l.name as learner,p.name as plan,p.owner,p.review_on,(select count(*) from actions a where a.plan_id=p.id and a.status='open') as open_actions from plans p join learners l on l.id=p.learner_id where p.status='active' order by p.review_on`,
'follow-ups':`select source_id,learner,action,owner,due_on,days_overdue from v_follow_ups order by due_on,source_id`,
'referral-chase':`select r.source_id,l.name as learner,r.service,r.owner,r.status,r.due_on from referrals r join learners l on l.id=r.learner_id where r.status<>'closed' order by r.due_on`,
'interactions':`select i.source_id,l.name as learner,i.occurred_on,i.kind,i.summary,i.owner from interactions i join learners l on l.id=i.learner_id order by i.occurred_on desc`,
'attention':`select * from v_attention order by due_on nulls first,source_id,issue`,
'compliance':`select * from v_compliance order by rule,source_id`,
'history':`select entity,record_id,operation,actor,created_at from audit_log order by created_at desc,id limit 100`
};
export const questions=[
['Which learners have overdue alerts and no recent contact?',`select c.source_id,c.name,c.last_contact from v_caseload c where c.status='active' and (c.last_contact is null or c.last_contact<current_date-14) and exists(select 1 from alerts a where a.learner_id=c.id and a.status='open' and a.due_on<current_date)`],
['Which active learners have an alert but no active support plan?',`select source_id,name,open_alerts from v_caseload where status='active' and open_alerts>0 and active_plans=0`],
['Which advisers are over their agreed caseload capacity?',reads.advisers.replace('order by a.name','having count(l.id)>a.capacity order by a.name')],
['Which overdue actions belong to plans whose review is also overdue?',`select f.source_id,f.learner,f.action,f.due_on,p.review_on from v_follow_ups f join actions a on a.id=f.id join plans p on p.id=a.plan_id where f.due_on<current_date and p.review_on<current_date`],
['Which learners have both pending referrals and high-priority alerts?',`select c.source_id,c.name,c.pending_referrals from v_caseload c where pending_referrals>0 and exists(select 1 from alerts a where a.learner_id=c.id and a.status='open' and a.priority='high')`],
['Which active learners have no adviser?',`select source_id,name,programme from v_caseload where status='active' and adviser='Unassigned'`],
['Which cohorts have overdue alerts?',`select l.cohort,count(*)::int as overdue_alerts from alerts a join learners l on l.id=a.learner_id where a.status='open' and a.due_on<current_date group by l.cohort order by l.cohort`],
['Which inactive learners are due for a retention review?',`select source_id,name,status,retention_review_on from learners where status<>'active' and retention_review_on<=current_date`],
['Which learners have open alerts and stale accuracy reviews?',`select l.source_id,l.name,l.accuracy_checked_on from learners l where (accuracy_checked_on is null or accuracy_checked_on<current_date-90) and exists(select 1 from alerts a where a.learner_id=l.id and a.status='open')`],
['Which services have unanswered referrals past their response date?',`select service,count(*)::int as awaiting_response,min(due_on) as oldest_due from referrals where status='pending' and due_on<current_date group by service order by service`]
];
export async function read(db,cmd){
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='weekly-review'){const out={};for(const c of ['caseload','attention','referral-chase'])out[c]=await read(db,c);return out;}
 if(cmd==='insights'){const out=[];for(const [question,sql] of questions)out.push({question,rows:await db.query(sql)});return out;}
 throw Error('Unknown read command '+cmd);
}
export function normalise(entity,input){
 const spec=entities[entity];if(!spec)throw Error('Unknown entity '+entity);
 if(!input||Array.isArray(input)||typeof input!=='object')throw Error('Record must be an object');
 const out={};for(const [k,v] of Object.entries(input)){
  if(!spec.fields.includes(k))throw Error('Unsupported field '+k);
  if(v===null||v===''){out[k]=null;continue;}
  if(k==='capacity'){if(!Number.isInteger(Number(v))||Number(v)<=0)throw Error('Capacity must be a positive integer');out[k]=Number(v);continue;}
  if(typeof v!=='string')throw Error(k+' must be text');
  out[k]=v.trim();
  if(spec.dates.includes(k)&&(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v))||new Date(v).toISOString().slice(0,10)!==v))throw Error(k+' must be a real YYYY-MM-DD date');
 }
 return out;
}
export async function resolve(db,entity,needle,{lock=false}={}){
 if(!entities[entity])throw Error('Unknown entity '+entity);if(!needle)throw Error('Provide a name, source ID or ID prefix');
 let rows=await db.query(`select * from ${entity} where source_id=$1 or id::text=$1${lock?' for update':''}`,[needle]);
 if(rows.length===1)return rows[0];
 rows=await db.query(`select * from ${entity} where starts_with(lower(id::text),lower($1)) or position(lower($1) in lower(name))>0 order by source_id${lock?' for update':''}`,[needle]);
 if(rows.length!==1)throw Error((rows.length?'Ambiguous':'No matching')+' '+entity+': '+needle+'\n'+rows.map(r=>r.source_id+' | '+r.name+' | '+r.id).join('\n'));
 return rows[0];
}
export async function transaction(db,fn,actor='operator'){
 if(!actor.trim())throw Error('Actor must be nonempty');await db.exec('begin');try{await db.query("select set_config('app.actor',$1,true)",[actor]);const out=await fn();await db.exec('commit');return out;}catch(e){await db.exec('rollback');throw e;}
}
export async function insert(db,entity,input){
 const data=normalise(entity,input),spec=entities[entity];for(const k of spec.required)if(data[k]==null||data[k]==='')throw Error('Missing '+entity+'.'+k);
 for(const [col,table]of Object.entries(spec.refs))if(data[col])data[col]=(await resolve(db,table,data[col])).id;
 const keys=Object.keys(data);return (await db.query(`insert into ${entity}(${keys.join(',')}) values(${keys.map((_,i)=>'$'+(i+1)).join(',')}) returning *`,Object.values(data)))[0];
}
export async function learnerDetails(db,needle){const learner=await resolve(db,'learners',needle),out={learner};for(const t of ['alerts','plans','referrals','interactions'])out[t]=await db.query(`select * from ${t} where learner_id=$1 order by source_id`,[learner.id]);out.actions=await db.query('select a.* from actions a join plans p on p.id=a.plan_id where p.learner_id=$1 order by a.source_id',[learner.id]);return out;}
export async function complete(db,entity,needle,outcome){
 const terminal={alerts:'closed',plans:'completed',actions:'done',referrals:'closed'}[entity];if(!terminal)throw Error('Only alerts, plans, actions and referrals can be completed');if(!outcome?.trim())throw Error('Provide an outcome');
 const r=await resolve(db,entity,needle,{lock:true});if(r.status===terminal)throw Error('Record already completed');
 return (await db.query(`update ${entity} set status=$1,outcome=$2,closed_on=current_date where id=$3 returning *`,[terminal,outcome,r.id]))[0];
}
export async function acceptReferral(db,needle,outcome){if(!outcome?.trim())throw Error('Provide acceptance evidence');const r=await resolve(db,'referrals',needle,{lock:true});if(r.status!=='pending')throw Error('Only pending referrals can be accepted');return(await db.query("update referrals set status='accepted',outcome=$1 where id=$2 returning *",[outcome,r.id]))[0];}
export async function reviewPlan(db,needle,date,outcome){const r=await resolve(db,'plans',needle,{lock:true});if(r.status!=='active')throw Error('Plan is not active');const d=normalise('plans',{review_on:date});if(!d.review_on||!outcome?.trim())throw Error('Provide next review date and review evidence');const today=(await db.query('select current_date::text as d'))[0].d;if(date<=today)throw Error('Next review must be in the future');return(await db.query('update plans set review_on=$1,outcome=$2 where id=$3 returning *',[date,outcome,r.id]))[0];}
export async function exportData(db){const out={format:'student-success-v1'};for(const t of [...Object.keys(entities),'audit_log'])out[t]=await db.query(`select * from ${t} order by id`);return out;}
export function saveArtifact(folder,prefix,data){const dir=path.resolve(process.env.OUTPUT_DIR||REPO_ROOT,folder);mkdirSync(dir,{recursive:true});const file=path.join(dir,prefix+'-'+randomUUID()+'.json');writeFileSync(file,JSON.stringify(data,null,2)+'\n');return {file};}
export async function draft(db,kind,needle){
 const payload=kind==='weekly-review'?await read(db,'weekly-review'):kind==='support-plan'?await learnerDetails(db,needle):kind==='referral'?await resolve(db,'referrals',needle):null;
 if(!payload)throw Error('Unknown draft kind');return saveArtifact('drafts',kind,{status:'DRAFT: private facts for operator review; nothing sent',generated_at:new Date().toISOString(),facts:payload});
}
