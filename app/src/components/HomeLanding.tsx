import type { PageKey } from '@/App'
import { useState } from 'react'

type Feature = {
  key: PageKey
  label: string
  en: string
  description: string
  eyebrow: string
  accent: string
  secondary: string
  symbol: string
}
const FEATURES: Feature[] = [
  { key:'birth', label:'起紫微命盘', en:'DESTINY CHART', description:'输入出生资料，排出专属紫微命盘，开启个人命理探索。', eyebrow:'YOUR PERSONAL COSMIC MAP', accent:'#d8b66f', secondary:'#f5e7bd', symbol:'命' },
  { key:'chart', label:'本命十二宫', en:'TWELVE PALACES', description:'总览命宫与十二宫位，梳理人生不同领域的结构关系。', eyebrow:'THE TWELVE PALACES', accent:'#9bb8d0', secondary:'#e2d2a7', symbol:'宫' },
  { key:'palaces', label:'十二宫详解', en:'PALACE ANALYSIS', description:'逐宫阅读星曜配置、宫干与宫位含义，深入理解命盘细节。', eyebrow:'A CLOSER READING', accent:'#c5a6d9', secondary:'#f0d8b2', symbol:'详' },
  { key:'sihua', label:'四化飞星', en:'FOUR TRANSFORMATIONS', description:'观察禄、权、科、忌的引动关系与宫位之间的流转。', eyebrow:'THE FLOW OF TRANSFORMATION', accent:'#d4a46d', secondary:'#f2d8a3', symbol:'化' },
  { key:'stars', label:'星曜图鉴', en:'STAR ATLAS', description:'认识主星、辅星与杂曜，探索不同星曜的传统象义。', eyebrow:'A CONSTELLATION OF MEANINGS', accent:'#9bbbd8', secondary:'#f3e3b4', symbol:'星' },
  { key:'patterns', label:'命盘格局', en:'CHART PATTERNS', description:'从星曜组合与宫位结构切入，查看命盘格局提示。', eyebrow:'PATTERNS & STRUCTURE', accent:'#c7a77b', secondary:'#f2dfb4', symbol:'格' },
  { key:'trines', label:'三方四正', en:'TRINES & OPPOSITIONS', description:'连结三合宫与对宫，理解命盘中的互动与支援结构。', eyebrow:'THE GEOMETRY OF LIFE', accent:'#8fb9b1', secondary:'#e8d5a5', symbol:'合' },
  { key:'decadal', label:'大限运程', en:'DECADAL CYCLES', description:'沿着十年大限观察人生阶段变化与宫位主题。', eyebrow:'TEN-YEAR CYCLES', accent:'#c79c75', secondary:'#f0d9a8', symbol:'运' },
  { key:'fortune', label:'年度运势', en:'YEARLY OUTLOOK', description:'结合流年命盘，阅读年度主题与阶段性变化。', eyebrow:'A YEAR IN PERSPECTIVE', accent:'#d6b66f', secondary:'#f6e7bd', symbol:'年' },
  { key:'lunar', label:'农历流月', en:'LUNAR MONTHS', description:'按农历月份追踪月度节奏，观察流月宫位与星曜。', eyebrow:'THE LUNAR RHYTHM', accent:'#9baed1', secondary:'#f2e0b4', symbol:'月' },
  { key:'kline', label:'人生趋势', en:'LIFE TREND', description:'以趋势视图回顾不同阶段的起伏，辅助长期规划与反思。', eyebrow:'A LONG VIEW OF LIFE', accent:'#83b7ae', secondary:'#ead7a8', symbol:'势' },
  { key:'match', label:'双人合盘', en:'SYNASTRY', description:'并置两张命盘，探索双方宫位与星曜之间的对应关系。', eyebrow:'TWO CHARTS, ONE DIALOGUE', accent:'#d19caa', secondary:'#f4dcb9', symbol:'缘' },
  { key:'ai', label:'AI 深度解读', en:'AI INSIGHT', description:'以命盘为依据，生成结构化解读与多维度思考线索。', eyebrow:'INTELLIGENCE / INSIGHT', accent:'#b3a3d9', secondary:'#f0dfb5', symbol:'知' },
  { key:'share', label:'命盘典藏卡', en:'PERSONAL KEEPSAKE', description:'将命盘重点整理成专属典藏卡，便于保存与分享。', eyebrow:'YOUR DESTINY, PRESERVED', accent:'#d1b47c', secondary:'#f6e9c9', symbol:'藏' },
  { key:'academy', label:'学术中心', en:'ACADEMIC LIBRARY', description:'从命理典籍、流派参考与研读路径，系统了解传统知识。', eyebrow:'CLASSICS & STUDY', accent:'#b99b72', secondary:'#e8d9b9', symbol:'典' },
]
const GROUPS: { title:string; en:string; keys:PageKey[] }[] = [
  { title:'紫微命盘', en:'DESTINY CHART', keys:['birth','chart','palaces','sihua','stars','patterns','trines'] },
  { title:'运势推演', en:'LIFE CYCLES', keys:['decadal','fortune','lunar','kline'] },
  { title:'合盘分析', en:'SYNASTRY', keys:['match'] },
  { title:'智能解读', en:'AI INSIGHT', keys:['ai'] },
  { title:'命盘典藏', en:'ARCHIVE', keys:['share'] },
]
function FeatureArtwork({ feature }: { feature:Feature }) {
  const k=feature.key
  return <svg className="home-celestial-art" viewBox="0 0 520 660" role="img" aria-label={feature.label+'主题插画'}>
    <defs>
      <radialGradient id="artGlow"><stop stopColor={feature.secondary} stopOpacity=".96"/><stop offset=".28" stopColor={feature.accent} stopOpacity=".56"/><stop offset="1" stopColor={feature.accent} stopOpacity="0"/></radialGradient>
      <linearGradient id="artBg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#203953"/><stop offset=".56" stopColor="#14263e"/><stop offset="1" stopColor="#0e1b2e"/></linearGradient>
      <linearGradient id="artLine"><stop stopColor={feature.secondary}/><stop offset=".52" stopColor={feature.accent}/><stop offset="1" stopColor={feature.secondary}/></linearGradient>
      <linearGradient id="artVeil" x1="0" y1="0" x2="0.8" y2="1"><stop stopColor={feature.accent} stopOpacity=".32"/><stop offset="1" stopColor="#101d30" stopOpacity=".02"/></linearGradient>
    </defs>
    <rect width="520" height="660" fill="url(#artBg)"/>
    <circle cx="260" cy="235" r="210" fill="url(#artGlow)"/>
    <circle cx="260" cy="235" r="150" fill="none" stroke={feature.accent} strokeWidth="1.8" opacity=".65"/>
    <circle cx="260" cy="235" r="177" fill="none" stroke={feature.secondary} strokeDasharray="2 11" opacity=".75"/>
    <path d="M-30 420 Q95 280 190 400 T390 390 T550 265 M-20 540 Q100 410 205 525 T420 500 T560 410" fill="none" stroke="url(#artLine)" strokeWidth="2" opacity=".8"/>
    {k==='birth' && <><path d="M250 150 C180 200 190 280 220 325 C245 365 210 420 165 480 L390 660 L490 660 C390 535 360 465 360 405 C360 330 315 290 320 235 C325 180 290 145 250 150Z" fill="url(#artVeil)"/><circle cx="260" cy="235" r="23" fill={feature.secondary}/><path d="M275 210 Q370 260 440 155 Q405 300 315 330 M205 330 Q110 300 65 390 Q140 405 205 365" fill="none" stroke={feature.accent} strokeWidth="4"/></>}
    {k==='chart' && <><circle cx="260" cy="235" r="112" fill="none" stroke={feature.secondary} strokeWidth="2"/><circle cx="260" cy="235" r="70" fill="none" stroke={feature.accent}/>{Array.from({length:12},(_,i)=><g key={i} transform={`rotate(${i*30} 260 235)`}><path d="M260 123v34" stroke={feature.secondary} strokeWidth="2"/><circle cx="260" cy="112" r="5" fill={feature.accent}/></g>)}<path d="M260 170L315 205 315 265 260 300 205 265 205 205Z" fill="none" stroke={feature.accent} strokeWidth="2"/></>}
    {k==='palaces' && <><rect x="112" y="112" width="296" height="246" rx="8" fill="none" stroke={feature.secondary}/>{Array.from({length:3},(_,i)=><path key={i} d={`M${210+i*0} 112v246`} stroke={feature.accent} opacity=".7"/>)}<path d="M112 194h296M112 276h296" stroke={feature.accent}/>{Array.from({length:12},(_,i)=><circle key={i} cx={140+(i%4)*80} cy={153+Math.floor(i/4)*82} r="10" fill={feature.secondary} opacity=".7"/>)}</>}
    {k==='sihua' && <><path d="M260 235 C120 100 80 350 250 420 S440 540 380 260 S80 140 120 500" fill="none" stroke={feature.accent} strokeWidth="3"/>{['禄','权','科','忌'].map((s,i)=><g key={s}><circle cx={[130,380,385,150][i]} cy={[190,175,390,420][i]} r="34" fill="#1c314c" stroke={feature.secondary}/><text x={[130,380,385,150][i]} y={[198,183,398,428][i]} textAnchor="middle" fill={feature.secondary} fontSize="22">{s}</text></g>)}</>}
    {k==='stars' && <><path d="M100 360L180 180 260 290 345 125 425 330 260 445Z" fill="none" stroke={feature.accent} strokeWidth="1.5"/>{[[100,360],[180,180],[260,290],[345,125],[425,330],[260,445]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r={i===3?14:8} fill={feature.secondary}/><circle cx={x} cy={y} r="25" fill="none" stroke={feature.accent} opacity=".55"/></g>)}</>}
    {k==='patterns' && <><path d="M260 105L405 235 260 365 115 235Z" fill="none" stroke={feature.secondary} strokeWidth="2"/><path d="M260 145L360 235 260 325 160 235Z" fill="none" stroke={feature.accent} strokeWidth="3"/><path d="M260 105v260M115 235h290" stroke={feature.accent} opacity=".5"/></>}
    {k==='trines' && <><path d="M260 115L410 370H110Z" fill="none" stroke={feature.secondary} strokeWidth="2"/><path d="M260 175L350 330H170Z" fill="none" stroke={feature.accent}/>{[[260,115],[410,370],[110,370],[260,275]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="18" fill="#1b304a" stroke={feature.secondary} strokeWidth="2"/>)}<path d="M260 115L260 275M110 370L260 275 410 370" stroke={feature.accent}/></>}
    {k==='decadal' && <><path d="M95 360A165 165 0 0 1 425 360" fill="none" stroke={feature.secondary} strokeWidth="2"/>{Array.from({length:10},(_,i)=><g key={i} transform={`rotate(${-90+i*20} 260 360)`}><path d="M260 195v22" stroke={feature.accent} strokeWidth="3"/><circle cx="260" cy="180" r="5" fill={feature.secondary}/></g>)}<path d="M120 360Q260 190 400 360" fill="none" stroke={feature.accent} strokeWidth="3"/></>}
    {k==='fortune' && <><circle cx="260" cy="235" r="76" fill={feature.secondary} opacity=".9"/><path d="M260 125A110 110 0 1 0 370 235" fill="none" stroke={feature.accent} strokeWidth="8"/><path d="M260 70v-28M425 235h30M95 235H65" stroke={feature.secondary} strokeWidth="2"/></>}
    {k==='lunar' && <>{Array.from({length:8},(_,i)=><g key={i}><circle cx={95+i*47} cy={235+Math.sin(i*Math.PI/4)*85} r="20" fill={feature.secondary} opacity={.18+i*.1}/><path d={`M${95+i*47} ${215+Math.sin(i*Math.PI/4)*85}a20 20 0 1 0 0 40a14 ${20-i*2} 0 1 1 0-40`} fill={feature.accent}/></g>)}<path d="M80 360Q260 470 440 360" fill="none" stroke={feature.secondary}/></>}
    {k==='kline' && <><path d="M95 390L155 345 205 365 265 250 325 280 380 160 435 195" fill="none" stroke={feature.secondary} strokeWidth="4"/>{[[95,390],[155,345],[205,365],[265,250],[325,280],[380,160],[435,195]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="7" fill={feature.accent}/>)}<path d="M95 430H440M95 130V430" stroke={feature.accent} opacity=".5"/></>}
    {k==='match' && <><circle cx="195" cy="235" r="94" fill="none" stroke={feature.secondary} strokeWidth="3"/><circle cx="325" cy="235" r="94" fill="none" stroke={feature.accent} strokeWidth="3"/><path d="M195 140Q260 235 195 330M325 140Q260 235 325 330" fill="none" stroke={feature.secondary} opacity=".7"/><circle cx="260" cy="235" r="24" fill={feature.secondary}/></>}
    {k==='ai' && <>{Array.from({length:5},(_,i)=>Array.from({length:4},(_,j)=><circle key={i+'-'+j} cx={120+i*70} cy={160+j*52+(i%2)*15} r="7" fill={feature.secondary}/>))}<path d={Array.from({length:20},(_,i)=>`M${120+Math.floor(i/4)*70} ${160+(i%4)*52+(Math.floor(i/4)%2)*15}L${190+Math.floor(i/4)*70} ${160+((i*3)%4)*52+((Math.floor(i/4)+1)%2)*15}`).join(' ')} fill="none" stroke={feature.accent} opacity=".45"/><circle cx="260" cy="260" r="118" fill="none" stroke={feature.accent} strokeDasharray="5 9"/></>}
    {k==='share' && <><rect x="150" y="100" width="220" height="300" rx="8" fill="url(#artVeil)" stroke={feature.secondary} strokeWidth="2"/><rect x="170" y="120" width="180" height="260" rx="4" fill="none" stroke={feature.accent}/><path d="M260 145v200M190 245h140" stroke={feature.accent}/><circle cx="260" cy="245" r="52" fill="none" stroke={feature.secondary} strokeWidth="2"/></>}
    {k==='academy' && <><path d="M150 150L260 95 370 150V340H150Z" fill="url(#artVeil)" stroke={feature.secondary} strokeWidth="2"/><path d="M190 180h140M190 220h140M190 260h140M190 300h100" stroke={feature.accent} strokeWidth="3"/><path d="M130 350h260M170 380h180" stroke={feature.secondary}/></>}
    {Array.from({length:44},(_,i)=><circle key={'s'+i} cx={(i*83+19)%520} cy={(i*137+43)%660} r={i%7===0?2.5:1.2} fill={feature.secondary} opacity={i%3===0?.8:.4}/>)}
    <text x="260" y="585" textAnchor="middle" fill={feature.secondary} fontSize="12" letterSpacing="5" opacity=".82">{feature.en}</text>
  </svg>
}
export function HomeLanding({ onEnter, onSettings }: { onEnter:(key:PageKey|'home')=>void; onSettings:()=>void }) {
  const [expanded,setExpanded]=useState('紫微命盘')
  const [selectedKey,setSelectedKey]=useState<PageKey>('birth')
  const selected=FEATURES.find(x=>x.key===selectedKey) || FEATURES[0]
  const choose=(key:PageKey)=>{setSelectedKey(key);const group=GROUPS.find(g=>g.keys.includes(key));if(group)setExpanded(group.title)}
  return <div className="tianyan-home">
    <header className="home-header">
      <button className="home-brand" onClick={()=>onEnter('home')} aria-label="天衍首页"><span>天衍</span><i>✳</i><small>ZIWEI DESTINY STUDIO</small></button>
      <div className="home-account"><span className="home-avatar">T</span><b>个人空间</b><em>·</em><span>探索版</span><button onClick={onSettings}>⌄</button></div>
    </header>
    <main className="home-stage">
      <aside className="home-index">
        <div className="home-index-intro"><small>THE KNOWLEDGE OF DESTINY</small><h2>探索目录</h2><p>以东方智慧，阅读人生的不同维度</p></div>
        {GROUPS.map(group=><section className="home-nav-group" key={group.title}>
          <button className={expanded===group.title?'home-nav-heading active':'home-nav-heading'} onClick={()=>setExpanded(expanded===group.title?'':group.title)} aria-expanded={expanded===group.title}><span>{group.title}</span><small>{group.en}</small><i>{expanded===group.title?'−':'+'}</i></button>
          {expanded===group.title&&<div className="home-nav-items">{group.keys.map(key=>{const item=FEATURES.find(f=>f.key===key)!;return <button key={key} className={selectedKey===key?'selected':''} onClick={()=>choose(key)} aria-pressed={selectedKey===key}><span>{item.label}</span><b>↗</b></button>})}</div>}
        </section>)}
        <button className={'home-academic-link'+(selectedKey==='academy'?' selected':'')} onClick={()=>choose('academy')}><span>学术中心</span><small>典籍书目与研读路径 →</small></button>
      </aside>
      <section className="home-center">
        <button className="home-art-card" onClick={()=>onEnter(selected.key)} aria-label={'进入'+selected.label}>
          <div className="home-art-grain"/>
          <FeatureArtwork feature={selected}/>
          <div className="home-art-copy"><small>{selected.eyebrow}</small><strong>{selected.label}</strong><span>{selected.en}</span><p>{selected.description}</p><i>进入{selected.label}<b>↗</b></i></div>
        </button>
        <div className="home-center-caption"><span>天时 · 星曜 · 人生</span><small>THE ART OF DESTINY</small></div>
      </section>
      <aside className="home-featured">
        <div className="featured-index">0{FEATURES.findIndex(f=>f.key===selected.key)+1} <span>SELECTED EXPERIENCE</span></div>
        <button className="featured-ai" onClick={()=>onEnter(selected.key)}><small>{selected.en}</small><strong>{selected.label}</strong><p>{selected.description}</p><i>进入功能<b>↗</b></i></button>
        <div className="featured-note"><small>AN EASTERN VIEW OF LIFE</small><strong>让传统命理，成为理解自己的另一种视角。</strong><span>知命 · 观势 · 行动</span></div>
        <div className="featured-bottom"><span>EST. 2026</span><span>天衍 · 紫微斗数</span></div>
      </aside>
    </main>
    <footer className="home-footer"><span>天衍 · 紫微斗数与东方命理研究</span><span>命盘资料仅保存在当前设备</span><button onClick={onSettings}>设置与隐私</button></footer>
  </div>
}
