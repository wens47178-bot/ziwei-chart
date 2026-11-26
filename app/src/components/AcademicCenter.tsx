import { KNOWLEDGE_SOURCES } from '@/knowledge-db'
import { useEffect, useState } from 'react'

const groups = [
  {
    "name": "紫微斗数",
    "subtitle": "星曜 · 宫位 · 四化",
    "topics": [
      "紫微斗数全书",
      "紫微斗数全集",
      "中州派紫微斗数初级讲义",
      "紫微斗数讲义：星曜性质",
      "紫微斗数入门",
      "十二宫"
    ]
  },
  {
    "name": "四柱八字",
    "subtitle": "干支 · 五行 · 格局",
    "topics": [
      "三命通会",
      "滴天髓",
      "子平真诠",
      "渊海子平",
      "穷通宝鉴"
    ]
  },
  {
    "name": "周易六爻",
    "subtitle": "卦象 · 易理",
    "topics": [
      "周易",
      "增删卜易",
      "卜筮正宗",
      "易隐"
    ]
  },
  {
    "name": "小六壬与占卜",
    "subtitle": "传统起课与比较研究",
    "topics": [
      "小六壬专题",
      "梅花易数",
      "六壬大全"
    ]
  },
  {
    "name": "奇门遁甲",
    "subtitle": "九宫 · 八门",
    "topics": [
      "遁甲演义",
      "奇门遁甲统宗"
    ]
  },
  {
    "name": "风水堪舆",
    "subtitle": "传统地理文化",
    "topics": [
      "葬书",
      "青囊经",
      "地理五诀"
    ]
  }
]
const videos: Record<string,{id:string;title:string}[]> = {
  "紫微斗数入门": [
    {
      "id": "BV15AMRzEEtu",
      "title": "顾绍贤 · 紫微斗数系统入门"
    },
    {
      "id": "BV1Dx4y127BJ",
      "title": "紫微斗数基础课程"
    }
  ],
  "十二宫": [
    {
      "id": "BV1Dx4y127BJ",
      "title": "十二宫职系列"
    }
  ],
  "三命通会": [
    {
      "id": "BV1AfewznEfF",
      "title": "三命通会讲解（B站上传版本）"
    }
  ],
  "增删卜易": [
    {
      "id": "BV1WJ8CzWEww",
      "title": "增删卜易全本讲解（B站上传版本）"
    }
  ],
  "小六壬专题": [
    {
      "id": "BV1fE4m1R7wx",
      "title": "yi昭烈 · 小六壬七集教学"
    },
    {
      "id": "BV1eZ421v7bT",
      "title": "云野卦馆 · 小六壬入门"
    }
  ],
  "紫微斗数全书": [
    {
      "id": "BV1WDrdYrEBQ",
      "title": "张露心 · 全书诸星问答论"
    },
    {
      "id": "BV1YSL3zkEtp",
      "title": "张露心 · 全书安星法"
    }
  ],
  "紫微斗数全集": [
    {
      "id": "BV1YSL3zkEtp",
      "title": "相关参考：传统安星法（非全集逐章讲解）"
    }
  ],
  "中州派紫微斗数初级讲义": [
    {
      "id": "BV1UjvVeAEui",
      "title": "王亭之中州派初级讲义"
    },
    {
      "id": "BV1hv1LBCEz9",
      "title": "旧尘啦 · 中州派深造讲义参考"
    }
  ],
  "紫微斗数讲义：星曜性质": [
    {
      "id": "BV14ER5YbEtZ",
      "title": "相关参考：yi昭烈星曜基础"
    },
    {
      "id": "BV1Hfur6jE8a",
      "title": "赤松玄社 · 五大桃花星"
    }
  ],
  "穷通宝鉴": [
    {
      "id": "BV12E4mzfEpv",
      "title": "寒谷也回春 · 穷通宝鉴系列第一讲"
    }
  ],
  "周易": [
    {
      "id": "BV1euorB2ECp",
      "title": "周易与六爻基础课程"
    }
  ],
  "卜筮正宗": [
    {
      "id": "BV1r6EwzBEDv",
      "title": "天辅大易 · 卜筮正宗导论"
    },
    {
      "id": "BV1RnHizcEhd",
      "title": "天辅大易 · 卜筮正宗029"
    }
  ],
  "易隐": [
    {
      "id": "BV1euorB2ECp",
      "title": "相关参考：六爻基础（非易隐逐章讲解）"
    }
  ],
  "梅花易数": [
    {
      "id": "BV1na4y1Q7ze",
      "title": "云野卦馆 · 梅花入门"
    },
    {
      "id": "BV1jvnJzXE6a",
      "title": "拙海舍 · 梅花易数经典导读"
    }
  ],
  "遁甲演义": [
    {
      "id": "BV1QFuRz5EC6",
      "title": "相关参考：九贤老师奇门公开课导读"
    }
  ],
  "奇门遁甲统宗": [
    {
      "id": "BV1QFuRz5EC6",
      "title": "相关参考：奇门公开课导读（非统宗逐章讲解）"
    }
  ],
  "地理五诀": [
    {
      "id": "BV1k8Q7B7E5k",
      "title": "青云客雂 · 龙穴砂水向"
    }
  ],
  "葬书": [
    {
      "id": "BV1k8Q7B7E5k",
      "title": "相关参考：传统形势堪舆（非葬书逐章讲解）"
    }
  ],
  "青囊经": [
    {
      "id": "BV1k8Q7B7E5k",
      "title": "相关参考：传统地理五诀（非青囊经讲解）"
    }
  ],
  "滴天髓": [
    {
      "id": "BV1JC411p7kx",
      "title": "申子辰313 · 滴天髓经典讲解"
    }
  ],
  "子平真诠": [
    {
      "id": "BV1LKB4YMEuQ",
      "title": "大有命理 · 子平真诠全文精解（50集）"
    }
  ],
  "渊海子平": [
    {
      "id": "BV1GzoGBeErB",
      "title": "祿命闡微 · 渊海子平：生克制化与刑冲破害"
    }
  ],
  "六壬大全": [
    {
      "id": "BV1qp8y6cExm",
      "title": "zibo88 · 六壬大全白话解读（含AI生成内容）"
    },
    {
      "id": "BV1N4421A7FD",
      "title": "渊献 · 大六壬入门详解（23集）"
    },
    {
      "id": "BV1c4WmzyEsr",
      "title": "云涧Struan · 大六壬免费基础教学（8集）"
    }
  ]
}
const originalTexts: Record<string,string> = {"紫微斗数全书":"https://zh.wikisource.org/wiki/紫微斗數全書","滴天髓":"https://zh.wikisource.org/wiki/滴天髓","梅花易数":"https://zh.wikisource.org/wiki/梅花易數","增删卜易":"https://zh.wikisource.org/wiki/增刪卜易","三命通会":"https://zh.wikisource.org/wiki/三命通會","周易":"https://zh.wikisource.org/wiki/周易","葬书":"https://zh.wikisource.org/wiki/葬書","青囊经":"https://zh.wikisource.org/wiki/青囊經","六壬大全":"https://zh.wikisource.org/zh-hant/六壬大全_(四庫全書本)/全覽","遁甲演义":"https://zh.wikisource.org/zh-hant/遁甲演義_(四庫全書本)/全覽","渊海子平":"https://zh.wikisource.org/zh-hans/渊海子平大全","穷通宝鉴":"https://zh.wikisource.org/wiki/穷通宝鉴","卜筮正宗":"https://zh.wikisource.org/zh-hans/卜筮正宗（河潞武子龄校本）"}
function CourseShelf(){
 const [group,setGroup]=useState(0)
 const [topic,setTopic]=useState<number|null>(null)
 const [lesson,setLesson]=useState(0)
 const g=groups[group]
 const name=topic===null?'':g.topics[topic]
 const list=videos[name]??[]
 const video=list[lesson]
 const [part,setPart]=useState(1)
 const [playerRetry,setPlayerRetry]=useState(0)
 useEffect(()=>{setPart(1)},[video?.id])
 useEffect(()=>{if(topic===null)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setTopic(null)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[topic])
 const cover=(title:string,i:number,series:string)=><div className="relative mx-auto flex aspect-[3/4] w-full max-w-44 flex-col justify-between rounded-r-md border border-stone-300 bg-gradient-to-r from-stone-200 via-[#faf8f0] to-[#f3efe4] p-5 text-left shadow-[4px_5px_0_#ded7c5,7px_9px_12px_#0002]"><span className="text-xs tracking-widest text-stone-500">{String(i+1).padStart(2,'0')} {series}</span><svg viewBox="0 0 100 80" className="mx-auto w-20 text-stone-700" fill="none" stroke="currentColor"><circle cx="50" cy="40" r="32"/><path d="M18 40H82M50 8V72M27 17L73 63M27 63L73 17"/><circle cx="50" cy="40" r="10"/></svg><strong className="font-serif text-lg text-stone-800">{title}</strong><span className="text-xs text-stone-500">免费研读</span><span className="absolute -bottom-3 left-8 h-4 w-2 bg-red-800"/></div>
 return <section className="academic-section"><div className="academic-section-head"><div><small>VIDEO CLASS / OPEN ACCESS</small><h3>天衍书院 · 免费研读与视频</h3></div><span>免费开放</span></div><div className="grid gap-4 md:grid-cols-3">{groups.map((item,i)=><button type="button" key={item.name} onClick={()=>{setGroup(i);setTopic(null)}} aria-pressed={group===i} className={'rounded-2xl border p-6 text-left transition hover:shadow-md '+(group===i?'border-stone-700':'border-stone-200')}><div className="mb-8 flex items-center justify-center gap-1">{cover(item.topics[0],0,item.name)}{cover(item.topics[1],1,item.name)}</div><h4 className="text-2xl font-bold">{item.name}</h4><p className="mt-2 text-stone-600">{item.subtitle}</p><p className="mt-3 text-sm">{item.topics.slice(0,4).join(' · ')}</p><span className="mt-4 block text-sm">进入课堂 →</span></button>)}</div><h3 className="my-8 text-2xl font-bold">{g.name} · 专题书架</h3><div className="grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 lg:grid-cols-6">{g.topics.map((t,i)=><button key={t} type="button" className="transition hover:-translate-y-1 focus-visible:outline-2" onClick={()=>{setLesson(0);setTopic(i)}}>{cover(t,i,g.name)}</button>)}</div>{topic!==null&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm" onClick={()=>setTopic(null)}><div role="dialog" aria-modal="true" aria-label={name} onClick={e=>e.stopPropagation()} className="max-h-[90vh] w-full max-w-5xl overflow-auto rounded-2xl bg-white text-stone-900 shadow-2xl"><header className="flex flex-wrap items-center gap-3 border-b p-5"><strong className="mr-auto text-xl">{g.name} · {name}</strong><button disabled={topic===0} onClick={()=>{setTopic(topic-1);setLesson(0)}}>上一单元</button><button disabled={topic===g.topics.length-1} onClick={()=>{setTopic(topic+1);setLesson(0)}}>下一单元</button><button autoFocus aria-label="关闭课堂" onClick={()=>setTopic(null)} className="rounded-full bg-stone-100 px-3 py-1">×</button></header><div className="grid md:grid-cols-2"><div className="p-5">{video?<><iframe key={video.id+'-'+part+'-'+playerRetry} title={video.title} className="aspect-video w-full rounded bg-black" src={'https://player.bilibili.com/player.html?bvid='+video.id+'&autoplay=0&high_quality=1&danmaku=0&page='+part} allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowFullScreen referrerPolicy="no-referrer"/><div className="my-2 flex flex-wrap items-center justify-between gap-2 text-xs text-stone-600"><span>如黑屏或无法播放，请直接前往 B 站观看本集。</span><button type="button" className="rounded border px-3 py-2" onClick={()=>setPlayerRetry(n=>n+1)}>重新加载播放器</button></div>{video.id==='BV1fE4m1R7wx'&&<div className="my-3 grid gap-2 grid-cols-2">{['六宫释义','六神释义','六亲释义','五星释义','起卦法','排盘法','分类占法'].map((label,i)=><button key={label} aria-pressed={part===i+1} onClick={()=>setPart(i+1)} className={'rounded border p-2 text-sm '+(part===i+1?'bg-stone-200':'')}>{i+1}. {label}</button>)}</div>}{video.id!=='BV1fE4m1R7wx'&&({BV1LKB4YMEuQ:50,BV1N4421A7FD:23,BV1c4WmzyEsr:8} as Record<string,number>)[video.id]&&<label className="my-3 flex items-center gap-3">选择分集<select value={part} onChange={e=>setPart(Number(e.target.value))} className="rounded border p-2">{Array.from({length:({BV1LKB4YMEuQ:50,BV1N4421A7FD:23,BV1c4WmzyEsr:8} as Record<string,number>)[video.id]},(_,i)=><option key={i} value={i+1}>第 {i+1} 集</option>)}</select></label>}<a className="my-3 block rounded-lg bg-stone-800 px-4 py-3 text-center font-semibold text-white" href={'https://www.bilibili.com/video/'+video.id+'/?p='+part} target="_blank" rel="noreferrer">无法播放？直接在 B 站观看本集 ↗</a></>:<div className="flex aspect-video items-center justify-center rounded bg-stone-100 p-6 text-center">本书相关教学视频尚未核实收录。</div>}{list.map((v,i)=><button className="block w-full border-b py-4 text-left" key={v.id} onClick={()=>setLesson(i)}>{String(i+1).padStart(2,'0')} {v.title}</button>)}</div><aside className="border-stone-200 p-6 md:border-l"><h4 className="text-xl font-bold">免费课程导读</h4><p className="mt-4 leading-relaxed">本专题：{name}。建议先了解本书的历史背景、基本术语与章节结构，再比较不同流派的解释。本站不冒充原作者，不提供未经核实的逐句字幕或时间轴。</p><p className="mt-4 text-sm text-stone-600">传统术数属于文化研究，不作为现实决策或预测的科学依据。</p>{originalTexts[name] ? <a className="mt-5 block underline" href={originalTexts[name]} target="_blank" rel="noreferrer">免费阅读古籍原典 ↗</a> : <p className="mt-5 text-sm text-stone-600">暂无已核实的公开原典阅读入口</p>}<a className="mt-3 block underline" href={'https://search.bilibili.com/all?keyword='+encodeURIComponent(name+' 讲解')} target="_blank" rel="noreferrer">检索相关公开视频（外部搜索） ↗</a><p className="mt-6 text-sm">本站不收费。视频收录后由第三方平台提供，播放及版权以原平台为准。</p></aside></div></div></div>}</section>
}



const readingLinks: Record<string, string> = {
  'book.ziwei-doushu-quanshu': 'https://zh.wikisource.org/wiki/紫微斗數全書',
  'book.quanshu-wikisource': 'https://zh.wikisource.org/wiki/紫微斗數全書',
}
const books = KNOWLEDGE_SOURCES.filter((source) => (source.type === 'classic' || source.type === 'modern-commentary') && source.id !== 'book.quanshu-wikisource').map(source => ({...source, url: readingLinks[source.id] || undefined}))
books.push(...[
  {id:'reading.ditiansui',title:'滴天髓',url:'https://zh.wikisource.org/zh-hans/滴天髓',note:'传统四柱命理原典，在线阅读。'},
  {id:'reading.meihua',title:'梅花易数',url:'https://zh.wikisource.org/zh-hans/梅花易數',note:'传统象数易学原典，在线阅读。'},
  {id:'reading.zengshan',title:'增删卜易',url:'https://zh.wikisource.org/zh-hans/增刪卜易',note:'传统六爻占卜原典，在线阅读。'},
  {id:'reading.sanming',title:'三命通会',url:originalTexts['三命通会'],note:'公开版本含卷一至卷九，缺卷十至十二。'},
  {id:'reading.zhouyi',title:'周易',url:originalTexts['周易'],note:'六十四卦与经传分篇阅读。'},
  {id:'reading.zangshu',title:'葬书',url:originalTexts['葬书'],note:'传统堪舆古籍原典。'},
  {id:'reading.qingnang',title:'青囊经',url:originalTexts['青囊经'],note:'上中下卷原文及古注。'},
  {id:'reading.liuren',title:'六壬大全',url:originalTexts['六壬大全'],note:'四库全书本，全览阅读。'},
  {id:'reading.dunjia',title:'遁甲演义',url:originalTexts['遁甲演义'],note:'四库全书本，全览阅读。'},
  ...['渊海子平','穷通宝鉴','卜筮正宗'].map(title=>({id:'reading.'+title,title,url:originalTexts[title],note:'公开古籍原文阅读。'})),
].map(book=>({...book,type:'classic' as const,author:undefined})))
books.sort((a,b)=>Number(Boolean(b.url))-Number(Boolean(a.url)))
const readingPaths = [
  { level: '入门', title: '先建立紫微斗数框架', detail: '从十二宫、命身宫、主辅星与基本排盘概念开始。', books: ['紫微斗数入门', '中州派紫微斗数初级讲义', '紫微斗数全书（维基文库原典）'] },
  { level: '进阶', title: '理解星曜与组合', detail: '比较不同星曜的性质、亮度与同宫组合，注意不同流派的解释差异。', books: ['紫微斗数进阶篇', '紫微斗数讲义：星曜性质', '图解经典紫微斗数·上册：命理卷', '图解经典紫微斗数·下册：推理卷'] },
  { level: '专题', title: '研究四化与宫位动态', detail: '将四化放回本命、大限、流年层次中阅读，不以单一星曜作绝对判断。', books: ['紫微斗数全书（维基文库原典）', '紫微斗数精成', '紫微斗数全集'] },
]

export function AcademicCenter() {
  return <div className="academic-center">
    <div className="academic-hero">
      <span className="academic-eyebrow">TIANYAN / ACADEMIC LIBRARY</span>
      <h2>典籍与学术中心</h2>
      <p>新增入门、进阶与专题书目，结合古典原典与现代讲义，建立可追溯、可比较的研读路径。</p>
      <div className="academic-meta"><span>典籍书目</span><i /> <span>流派参考</span><i /> <span>循序研读</span></div>
    </div>
    <CourseShelf />
    <section className="academic-section">
      <div className="academic-section-head"><div><small>01 / READING COLLECTION</small><h3>命理书籍</h3></div><span>{books.length.toString().padStart(2, '0')} TITLES</span></div>
      <div className="academic-book-grid">
        {books.map((book, index) => <article className="academic-book" key={book.id}>
          <div className="academic-book-cover"><span>天衍 · 典藏书目</span><strong>{book.title}</strong><small>{book.author || '传统命理典籍'}</small><i>{String(index + 1).padStart(2, '0')}</i></div>
          <div className="academic-book-info">
            <span className="academic-book-type">{book.type === 'classic' ? '古典典籍' : '现代讲义 / 研究'}</span>
            <h4>{book.title}</h4>
            <p>{book.author ? '作者：' + book.author + '。' : ''}{book.note}</p>
            {book.url ? <a href={book.url} target="_blank" rel="noreferrer">免费在线阅读 <b>↗</b></a> : <span className="academic-no-link">暂无已核实的授权全文</span>}
          </div>
        </article>)}
      </div>
      <p className="academic-disclaimer">本区提供书目索引与学习导读，不提供未经授权的电子书或整本书籍下载。未核实授权全文的现代著作不提供阅读跳转；各书观点可能存在流派差异，建议交叉阅读。</p>
    </section>
    <section className="academic-section">
      <div className="academic-section-head"><div><small>02 / STUDY ROUTES</small><h3>推荐研读路径</h3></div><span>STUDY GUIDE</span></div>
      <div className="academic-paths">{readingPaths.map((path, index) => <article className="academic-path" key={path.level}>
        <span className="academic-path-no">0{index + 1}</span><div><small>{path.level}阶段</small><h4>{path.title}</h4><p>{path.detail}</p><span>参考：{path.books.join(' · ')}</span></div>
      </article>)}</div>
    </section>
    <section className="academic-note"><span>EDITORIAL PRINCIPLE</span><p>天衍将命理视为传统文化中的解释体系与研究对象。页面中的知识摘要会标注参考来源，并尽量区分经典原意、现代流派观点与项目自身的整理口径。</p></section>
  </div>
}
