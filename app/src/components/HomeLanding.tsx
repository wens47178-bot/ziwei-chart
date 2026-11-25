import type { PageKey } from '@/App'
import { useState } from 'react'

type Entry = { label: string; key: PageKey }
const GROUPS: { title: string; en: string; items: Entry[] }[] = [
  { title: '紫微命盘', en: 'DESTINY CHART', items: [
    { label: '起紫微命盘', key: 'birth' }, { label: '本命十二宫', key: 'chart' },
    { label: '十二宫详解', key: 'palaces' }, { label: '四化飞星', key: 'sihua' },
    { label: '星曜图鉴', key: 'stars' }, { label: '命盘格局', key: 'patterns' }, { label: '三方四正', key: 'trines' },
  ]},
  { title: '运势推演', en: 'LIFE CYCLES', items: [
    { label: '大限运程', key: 'decadal' }, { label: '年度运势', key: 'fortune' },
    { label: '农历流月', key: 'lunar' }, { label: '人生趋势', key: 'kline' },
  ]},
  { title: '合盘分析', en: 'SYNASTRY', items: [{ label: '双人合盘', key: 'match' }] },
  { title: '智能解读', en: 'AI INSIGHT', items: [{ label: 'AI 深度解读', key: 'ai' }] },
  { title: '命盘典藏', en: 'ARCHIVE', items: [{ label: '命盘典藏卡', key: 'share' }] },
]

export function HomeLanding({ onEnter, onSettings }: { onEnter: (key: PageKey | 'home') => void; onSettings: () => void }) {
  const [expanded, setExpanded] = useState('紫微命盘')
  return <div className="tianyan-home">
    <header className="home-header">
      <button className="home-brand" onClick={() => onEnter('home')} aria-label="天衍首页">
        <span>天衍</span><i>✳</i><small>ZIWEI DESTINY STUDIO</small>
      </button>
      <div className="home-account"><span className="home-avatar">T</span><b>个人空间</b><em>·</em><span>探索版</span><button onClick={onSettings}>⌄</button></div>
    </header>
    <main className="home-stage">
      <aside className="home-index">
        <div className="home-index-intro"><small>THE KNOWLEDGE OF DESTINY</small><h2>探索目录</h2><p>以东方智慧，阅读人生的不同维度</p></div>
        {GROUPS.map(group => <section className="home-nav-group" key={group.title}>
          <button className={expanded === group.title ? 'home-nav-heading active' : 'home-nav-heading'} onClick={() => setExpanded(expanded === group.title ? '' : group.title)} aria-expanded={expanded === group.title}>
            <span>{group.title}</span><small>{group.en}</small><i>{expanded === group.title ? '−' : '+'}</i>
          </button>
          {expanded === group.title && <div className="home-nav-items">{group.items.map(item =>
            <button key={item.key} onClick={() => onEnter(item.key)}><span>{item.label}</span><b>↗</b></button>
          )}</div>}
        </section>)}
        <button className="home-academic-link" onClick={() => onEnter('academy')}><span>学术中心</span><small>知识体系与星曜资料 →</small></button>
      </aside>
      <section className="home-center">
        <button className="home-art-card" onClick={() => onEnter('birth')} aria-label="开始起紫微命盘">
          <div className="home-art-grain"></div>
          <svg className="home-celestial-art" viewBox="0 0 420 560" aria-hidden="true">
            <defs>
              <radialGradient id="homeSun"><stop stopColor="#fff8dc"/><stop offset=".3" stopColor="#e5c27b"/><stop offset="1" stopColor="#c18b3b" stopOpacity="0"/></radialGradient>
              <linearGradient id="homeSilk" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#101c30"/><stop offset=".55" stopColor="#344b68"/><stop offset="1" stopColor="#111a2b"/></linearGradient>
              <linearGradient id="homeGold"><stop stopColor="#fff0bd"/><stop offset=".5" stopColor="#c89c51"/><stop offset="1" stopColor="#fff0bd"/></linearGradient>
            </defs>
            <rect width="420" height="560" fill="#17283f"/>
            <circle cx="218" cy="126" r="148" fill="url(#homeSun)"/>
            <circle cx="218" cy="126" r="94" fill="none" stroke="#e8c77d" strokeWidth="2" opacity=".7"/>
            <circle cx="218" cy="126" r="115" fill="none" stroke="#f8e6b0" strokeWidth="1" strokeDasharray="2 9"/>
            <path d="M-20 340 C85 210 105 420 220 285 S350 180 450 45 M-30 465 C80 330 145 520 270 375 S365 310 450 240" fill="none" stroke="url(#homeGold)" strokeWidth="2"/>
            <path d="M-30 110 Q80 30 155 145 T330 160 T470 80 M-20 510 Q90 420 180 490 T390 465" fill="none" stroke="#d7b36c" strokeWidth="1.3" opacity=".7"/>
            <path d="M208 105 C160 138 151 192 173 238 C190 271 164 315 145 355 C120 410 128 460 87 560 L410 560 C360 493 333 452 338 395 C344 333 300 298 290 255 C281 215 307 168 278 127 C259 100 232 91 208 105Z" fill="url(#homeSilk)"/>
            <path d="M207 105 C180 143 192 175 215 199 C239 223 223 259 202 281 C180 305 190 343 214 360 C240 380 239 421 212 456" fill="none" stroke="#d4b16b" strokeWidth="3" opacity=".8"/>
            <path d="M270 165 Q342 185 392 120 Q365 235 295 257 M160 275 Q85 250 38 330 Q92 345 151 323 M245 350 Q322 380 397 338 Q350 432 260 405" fill="none" stroke="#cda65e" strokeWidth="4" opacity=".7"/>
            <circle cx="218" cy="126" r="18" fill="#fff0bd"/><circle cx="218" cy="126" r="42" fill="none" stroke="#f2d28c"/>
            {Array.from({length:36},(_,i)=><circle key={i} cx={(i*73)%420} cy={(i*127+31)%560} r={i%5===0?2:1} fill="#f4dfac" opacity={i%3===0?.85:.45}/>)}
          </svg>
          <div className="home-art-copy"><small>ENTER THE COSMIC MAP</small><strong>紫微命盘</strong><span>Destiny Engine</span><p>输入生辰，开启专属命盘与东方智慧的探索</p><i>开始探索 <b>↗</b></i></div>
        </button>
        <div className="home-center-caption"><span>天时 · 星曜 · 人生</span><small>THE ART OF DESTINY</small></div>
      </section>
      <aside className="home-featured">
        <div className="featured-index">01 <span>FEATURED EXPERIENCE</span></div>
        <button className="featured-ai" onClick={() => onEnter('ai')}>
          <small>INTELLIGENCE / INSIGHT</small><strong>人工智能解读</strong>
          <p>以命盘为线索，展开多维度的结构化阅读与思考。</p><i>进入解读 <b>↗</b></i>
        </button>
        <div className="featured-note"><small>AN EASTERN VIEW OF LIFE</small><strong>让传统命理，成为理解自己的另一种视角。</strong><span>知命 · 观势 · 行动</span></div>
        <div className="featured-bottom"><span>EST. 2026</span><span>天衍 · 紫微斗数</span></div>
      </aside>
    </main>
    <footer className="home-footer"><span>天衍 · 紫微斗数与东方命理研究</span><span>命盘资料仅保存在当前设备</span><button onClick={onSettings}>设置与隐私</button></footer>
  </div>
}