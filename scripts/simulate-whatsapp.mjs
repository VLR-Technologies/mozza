// Local CLI only. No route is exposed and no Meta/database calls are made.
if(process.env.NODE_ENV==='production')throw new Error('Simulator is disabled in production');
import {load} from './ts-loader.mjs';const {initialSession,transition}=load('src/lib/whatsapp/engine.ts');import readline from 'node:readline';
let session=initialSession();const rl=readline.createInterface({input:process.stdin,output:process.stdout});
console.log('Mozza local simulator. Type Hi, then reply IDs shown in brackets. RESET starts again. No messages are sent.');
rl.setPrompt('You > ');rl.prompt();rl.on('line',input=>{const result=transition(session,input,'919876543210');session=result.session;console.log('State:',session.state);for(const reply of result.replies){console.log('Mozza:',reply.text);for(const choice of reply.choices||[])console.log(`[${choice.id}] ${choice.title}`);}if(result.effect)console.log('SIMULATED storage effect:',JSON.stringify(result.effect,null,2));rl.prompt();});
