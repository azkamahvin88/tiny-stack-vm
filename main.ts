import{readFileSync as r,readdirSync as d,mkdirSync as m,writeFileSync as w}from'node:fs'
import{join as j}from'node:path'
const I=process.env.MAKEFUN_INPUT_DIR??'/input',O=process.env.MAKEFUN_OUTPUT_DIR??'/output'
// Trap table T: one char per opcode 0..0x53.
// Each char code c encodes 35 + imm*16 + pops*4 + pushes, where
// imm = immediate bytes after the opcode, pops/pushes = stack delta.
// '~' (code 126) means "no opcode": any char code >= 115 is rejected
// before dispatch with error 5 (invalid opcode).
const T="#4d')-.2~~~~~~~~,,,,,,,(,,,(,,,~,,,~~~~~~~~~~~~~CGGC#~~~~~~~~~~~(+~~~~~~~~~~~~~~''$'"
for(const id of d(I).sort()){
const p=r(j(I,id,'program.bin')),q=r(j(I,id,'input.bin')),n=p.length
const D=new Int32Array(256),K=new Int32Array(64),M=new Int32Array(256),o=new Uint8Array(65536)
let s=0,k=0,pc=0,st=0,ip=0,ol=0,e=0
L:for(;;){
if(st===1e6){e=10;break}
if(pc<0||pc>=n){e=9;break}
const op=p[pc],t=T.charCodeAt(op)
if(!(t<115)){e=5;break}
const v=t-35,im=v>>4,po=(v>>2)&3,pu=v&3
if(pc+im>=n){e=9;break}
st++
const nx=pc+1+im
if(s<po){e=2;break}
if(s-po+pu>256){e=3;break}
pc=nx
switch(op){
case 0:break L
case 1:D[s++]=(p[nx-1]<<24)>>24;break
case 2:D[s++]=p.readInt32LE(nx-4);break
case 3:s--;break
case 4:D[s]=D[s-1];s++;break
case 5:{const t=D[s-1];D[s-1]=D[s-2];D[s-2]=t;break}
case 6:D[s]=D[s-2];s++;break
case 7:{const a=D[s-3];D[s-3]=D[s-2];D[s-2]=D[s-1];D[s-1]=a;break}
case 0x30:case 0x31:case 0x32:{
const rel=((p[nx-2]|p[nx-1]<<8)<<16)>>16
if(op===0x30||(op===0x31)===(D[--s]===0))pc=nx+rel
break}
case 0x33:
if(k===64){e=7;break L}
K[k++]=nx;pc=p[nx-2]|p[nx-1]<<8;break
case 0x34:
if(!k){e=8;break L}
pc=K[--k];break
case 0x40:{
const a=D[s-1]
if(a<0||a>255){e=6;break L}
D[s-1]=M[a];break}
case 0x41:{
const a=D[s-1]
if(a<0||a>255){e=6;break L}
M[a]=D[s-2];s-=2;break}
case 0x50:{
const t=String(D[s-1])
if(ol+t.length>65536){e=11;break L}
o.set(Buffer.from(t),ol);ol+=t.length;s--;break}
case 0x51:
if(ol+1>65536){e=11;break L}
o[ol++]=D[--s]&255;break
case 0x52:D[s++]=ip<q.length?q[ip++]:-1;break
case 0x53:e=D[--s]&255;break L
default:{
if(op===0x17){D[s-1]=-D[s-1]|0;break}
if(op===0x1b){D[s-1]=~D[s-1];break}
const b=D[s-1],a=D[s-2]
let v
if(op>0x12&&op<0x17&&!b){e=4;break L}
if(op===0x10)v=a+b|0
else if(op===0x11)v=a-b|0
else if(op===0x12)v=Math.imul(a,b)
else if(op===0x13)v=a===-2147483648&&b===-1?a:(a/b)|0
else if(op===0x14)v=b===-1?0:a%b
else if(op===0x15)v=(a>>>0)/(b>>>0)|0
else if(op===0x16)v=(a>>>0)%(b>>>0)|0
else if(op===0x18)v=a&b
else if(op===0x19)v=a|b
else if(op===0x1a)v=a^b
else if(op===0x1c)v=a<<b
else if(op===0x1d)v=a>>b
else if(op===0x1e)v=a>>>b|0
else if(op===0x20)v=a===b?1:0
else if(op===0x21)v=a<b?1:0
else v=(a>>>0)<(b>>>0)?1:0
s-=2;D[s++]=v
}}
}
m(j(O,id),{recursive:true})
w(j(O,id,'stdout.bin'),o.subarray(0,ol))
w(j(O,id,'exit.txt'),e+'\n')
}
