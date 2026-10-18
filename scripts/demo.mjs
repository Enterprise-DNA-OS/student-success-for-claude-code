import {mkdtempSync,rmSync} from 'node:fs';
import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
import {REPO_ROOT} from './lib/db.mjs';
const dir=mkdtempSync(path.join(os.tmpdir(),'student-demo-'));
try{for(const [script,...args]of [['migrate.mjs'],['seed.mjs'],['students.mjs','caseload'],['students.mjs','attention'],['students.mjs','insights'],['view.mjs'],['docs.mjs']]){const r=spawnSync(process.execPath,[path.join(REPO_ROOT,'scripts',script),...args],{cwd:REPO_ROOT,env:{...process.env,DATABASE_URL:'',DATA_DIR:path.join(dir,'db'),OUTPUT_DIR:dir},stdio:'inherit'});if(r.status!==0)throw Error('Demo failed at '+script);}console.log('Demo PASS; temporary fictional records removed.');}finally{rmSync(dir,{recursive:true,force:true});}
