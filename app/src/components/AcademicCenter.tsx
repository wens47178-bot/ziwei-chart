import { KNOWLEDGE_SOURCES } from '@/knowledge-db'

const books = KNOWLEDGE_SOURCES.filter((source) => source.type === 'classic' || source.type === 'modern-commentary')
const readingPaths = [
  { level: '入门', title: '先建立紫微斗数框架', detail: '从十二宫、命身宫、主辅星与基本排盘概念开始。', books: ['紫微斗数全书', '中州派紫微斗数初级讲义'] },
  { level: '进阶', title: '理解星曜与组合', detail: '比较不同星曜的性质、亮度与同宫组合，注意不同流派的解释差异。', books: ['紫微斗数讲义：星曜性质', '王亭之谈星：紫微斗数星曜总谈'] },
  { level: '专题', title: '研究四化与宫位动态', detail: '将四化放回本命、大限、流年层次中阅读，不以单一星曜作绝对判断。', books: ['紫微斗数全书', '紫微斗数精成'] },
]

export function AcademicCenter() {
  return <div className="academic-center">
    <div className="academic-hero">
      <span className="academic-eyebrow">TIANYAN / ACADEMIC LIBRARY</span>
      <h2>典籍与学术中心</h2>
      <p>从经典文献到现代讲义，建立可追溯、可比较的命理阅读路径。</p>
      <div className="academic-meta"><span>典籍书目</span><i /> <span>流派参考</span><i /> <span>循序研读</span></div>
    </div>
    <section className="academic-section">
      <div className="academic-section-head"><div><small>01 / READING COLLECTION</small><h3>命理书籍</h3></div><span>{books.length.toString().padStart(2, '0')} TITLES</span></div>
      <div className="academic-book-grid">
        {books.map((book, index) => <article className="academic-book" key={book.id}>
          <div className="academic-book-cover"><span>天衍 · 典藏书目</span><strong>{book.title}</strong><small>{book.author || '传统命理典籍'}</small><i>{String(index + 1).padStart(2, '0')}</i></div>
          <div className="academic-book-info">
            <span className="academic-book-type">{book.type === 'classic' ? '古典典籍' : '现代讲义 / 研究'}</span>
            <h4>{book.title}</h4>
            <p>{book.author ? '作者：' + book.author + '。' : ''}{book.note}</p>
            {book.url ? <a href={book.url} target="_blank" rel="noreferrer">查看书目资料 <b>↗</b></a> : <span className="academic-no-link">书目资料整理中</span>}
          </div>
        </article>)}
      </div>
      <p className="academic-disclaimer">本区提供书目索引与学习导读，不提供未经授权的电子书或整本书籍下载。各书观点可能存在流派差异，建议交叉阅读。</p>
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
