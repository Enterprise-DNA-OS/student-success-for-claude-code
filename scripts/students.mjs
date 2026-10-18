#!/usr/bin/env node
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {getDb} from './lib/db.mjs';
import {table} from './lib/format.mjs';
import {reads,read,insert,resolve,transaction,complete,acceptReferral,reviewPlan,learnerDetails,exportData,saveArtifact,draft} from './lib/domain.mjs';
import {importSalesforce} from './lib/import.mjs';
const args=process.argv.slice(2),pos=[],flags={};
function output(value){if(flags.json)console.log(JSON.stringify(value,null,2));else if(Array.isArray(value)){if(value[0]?.question){for(const q of value){console.log('\n'+q.question);output(q.rows);}}else console.log(table(value,Object.keys(value[0]||{}).map(key=>({key,label:key.replaceAll('_',' ')}))));}else for(const [key,v]of Object.entries(value)){if(Array.isArray(v)){console.log('\n'+key);output(v);}else console.log(key+': '+(typeof v==='object'?JSON.stringify(v):v));}}
let db;
try{
 for(const a of args){if(a.startsWith('--')){const [k,...v]=a.slice(2).split('=');if(Object.hasOwn(flags,k))throw Error('Repeated flag '+k);flags[k]=v.length?v.join('='):true;}else pos.push(a);}
 const [cmd,...rest]=pos;
 const allowed={add:['file','actor'],complete:['outcome','actor'],'accept-referral':['outcome','actor'],'review-plan':['next','outcome','actor'],assign:['actor'],'review-accuracy':['actor','evidence'],log:['text','date','kind','actor'],import:['mapping','dry-run','actor']};
 for(const key of Object.keys(flags))if(!['json',...(allowed[cmd]||[])].includes(key))throw Error('Unknown flag --'+key+' for '+cmd);
 for(const [k,v]of Object.entries(flags))if(['json','dry-run'].includes(k)?v!==true:typeof v!=='string'||!v.trim())throw Error('Invalid value for --'+k);
 const counts={add:1,complete:2,'accept-referral':1,'review-plan':1,assign:2,'review-accuracy':1,log:1,import:2,learner:1,'draft-support-plan':1,'draft-referral':1};
 if(rest.length!==(counts[cmd]||0))throw Error('Wrong arguments for '+cmd);
 if(cmd==='help'||!cmd){console.log('students: '+[...Object.keys(reads),'weekly-review','insights','learner','add','complete','accept-referral','review-plan','assign','review-accuracy','log','draft-weekly-review','draft-support-plan','draft-referral','import salesforce <folder>','export'].join(', '));process.exit(0);}
 db=await getDb();let result;const actor=flags.actor||'operator';
 if(reads[cmd]||['weekly-review','insights'].includes(cmd))result=await read(db,cmd);
 else if(cmd==='learner')result=await learnerDetails(db,rest[0]);
 else if(cmd==='add'){if(!flags.file)throw Error('Provide --file=<record.json>');result=await transaction(db,()=>insert(db,rest[0],JSON.parse(readFileSync(flags.file,'utf8'))),actor);}
 else if(cmd==='complete')result=await transaction(db,()=>complete(db,rest[0],rest[1],flags.outcome),actor);
 else if(cmd==='accept-referral')result=await transaction(db,()=>acceptReferral(db,rest[0],flags.outcome),actor);
 else if(cmd==='review-plan')result=await transaction(db,()=>reviewPlan(db,rest[0],flags.next,flags.outcome),actor);
 else if(cmd==='assign')result=await transaction(db,async()=>{const l=await resolve(db,'learners',rest[0]),a=await resolve(db,'advisers',rest[1]);return(await db.query('update learners set adviser_id=$1 where id=$2 returning *',[a.id,l.id]))[0];},actor);
 else if(cmd==='review-accuracy')result=await transaction(db,async()=>{if(!flags.evidence)throw Error('Provide --evidence for the completed accuracy review');const l=await resolve(db,'learners',rest[0]);await insert(db,'interactions',{source_id:randomUUID(),learner_id:l.id,name:'Accuracy review',occurred_on:(await db.query('select current_date::text as d'))[0].d,kind:'note',summary:flags.evidence,owner:actor});return(await db.query('update learners set accuracy_checked_on=current_date where id=$1 returning *',[l.id]))[0];},actor);
 else if(cmd==='log')result=await transaction(db,async()=>insert(db,'interactions',{source_id:randomUUID(),learner_id:rest[0],name:'Adviser interaction',occurred_on:flags.date||(await db.query('select current_date::text as d'))[0].d,kind:flags.kind||'note',summary:flags.text,owner:actor}),actor);
 else if(cmd?.startsWith('draft-'))result=await draft(db,cmd.slice(6),rest[0]);
 else if(cmd==='export')result=saveArtifact('exports','student-success',await transaction(db,()=>exportData(db),actor));
 else if(cmd==='import'){if(rest[0]!=='salesforce')throw Error('Supported import: salesforce');result=await importSalesforce(db,rest[1],{dry:!!flags['dry-run'],actor,mapping:flags.mapping?JSON.parse(readFileSync(flags.mapping,'utf8')):{}});}
 else throw Error('Unknown command '+cmd);
 output(result);
}catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
