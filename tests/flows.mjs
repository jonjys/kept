import {readFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const imp = source => import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
let fixture, created, fail=false;
globalThis.__Stripe = class { checkout={sessions:{retrieve:async()=>{if(fail)throw Error('private');return fixture;},create:async opts=>{if(fail)throw Error('private');created=opts;return {url:'https://checkout.stripe.com/test'};}}}; };
process.env.STRIPE_SECRET_KEY='test-only';process.env.SEAL_SECRET='test-only-seal';
let checks=0;
const check=(actual,expected)=>{assert.deepEqual(actual,expected);checks++};
const req=body=>new Request('https://local.invalid/api/test',{method:'POST',headers:{'content-type':'application/json','origin':'https://attacker.invalid'},body:JSON.stringify(body)});
const {name: app} = JSON.parse(await readFile('package.json', 'utf8'));
{
  const crypto=await imp(await readFile(`lib/${app==='said'?'seal':'note'}.js`,'utf8'));
  globalThis.__crypto=crypto;
  const route=async path=>{let s=await readFile(`app/api/${path}/route.js`,'utf8');s=s.replace('import Stripe from "stripe";', 'const Stripe = globalThis.__Stripe;').replace(/import \{([^}]+)\} from "[^\"]+";/, 'const {$1} = globalThis.__crypto;');return (await imp(s)).POST;};
  const issue=await route(app==='said'?'complete':'open'),checkout=await route('checkout');
  process.env.NEXT_PUBLIC_URL=`https://${app}.nyttolabs.com`;
  check((await checkout(req(null))).status,400);
  check((await checkout(req({text:{bad:true},when:'now'}))).status,400);
  const good={text:'These are my exact words',when:'now'};
  check((await checkout(req(good))).status,200);
  check(created.success_url,`https://${app}.nyttolabs.com/${app==='said'?'success':'ready'}?session_id={CHECKOUT_SESSION_ID}`);
  check(created.cancel_url,`https://${app}.nyttolabs.com`);
  if(app==='kept') for(const choice of [{when:'bad'},{when:'date',date:'2027-02-30'},{when:'date',date:'2000-01-01'},{when:'date',date:''}]) check((await checkout(req({...good,...choice}))).status,400);
  fail=true;check((await checkout(req(good))).status,502);fail=false;
  check((await issue(req({session_id:'invalid'}))).status,400);
  fixture={id:'cs_live_fixture',payment_status:'paid',status:'complete',mode:'payment',currency:'eur',amount_total:app==='said'?200:100,created:1780000000,metadata:{app,text:good.text,openAt:String(Date.now()+60000)}};
  for(const [key,value] of [['payment_status','unpaid'],['status','open'],['currency','usd'],['amount_total',999],['mode','subscription']]) {const original=fixture[key];fixture[key]=value;check((await issue(req({session_id:fixture.id}))).status,402);fixture[key]=original;}
  fixture.metadata.app='other';check((await issue(req({session_id:fixture.id}))).status,402);fixture.metadata.app=app;
  fixture.metadata.text='';check((await issue(req({session_id:fixture.id}))).status,422);fixture.metadata.text=good.text;
  fail=true;check((await issue(req({session_id:fixture.id}))).status,502);fail=false;
  const response=await issue(req({session_id:fixture.id}));check(response.status,200);check(response.headers.get('cache-control'),'no-store');const {token}=await response.json();
  if(app==='said') {check(crypto.readSeal(token,process.env.SEAL_SECRET).text,good.text);check(crypto.readSeal(token+'.extra',process.env.SEAL_SECRET),null);check(crypto.readSeal(token,'wrong'),null);check(crypto.readSeal(token,process.env.SEAL_SECRET).timeKind,'checkout_started');}
  else {check(Buffer.from(token,'base64url').includes(Buffer.from(good.text)),false);const locked=await(await issue(req({token}))).json();check(locked.locked,true);check(locked.text,null);const open=crypto.seal({text:good.text,openAt:Date.now()-1,sid:fixture.id},process.env.SEAL_SECRET);check((await(await issue(req({token:open}))).json()).text,good.text);check((await issue(req({token:token.slice(0,-10)+'AAAAAAAAAA'}))).status,400);check((await issue(req({token:'invalid'}))).status,400);}
}
console.log(`${checks} payment, redirect, token and time lock checks passed`);
