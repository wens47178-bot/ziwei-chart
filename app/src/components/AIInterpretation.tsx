/* ============================================================
   AI 解读组件
   丝滑流式输出 + 书法字体 + Markdown 渲染
   ============================================================ */

import { useState, useCallback, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useChartStore, useSettingsStore, useContentCacheStore } from '@/stores'
import { extractKnowledge, buildPromptContext } from '@/knowledge'
import { buildGuidancePromptContext } from '@/knowledge-db'
import { streamChat, type ChatMessage, type LLMConfig } from '@/lib/llm'
import { Button } from '@/components/ui'

/* ------------------------------------------------------------
   系统提示词
   ------------------------------------------------------------ */

const SYSTEM_PROMPT = `# Role
你是一位研习紫微斗数多年的资深命理师"星图先生"。你精通三合派（观星情格局）、飞星派（推四化轨迹）及钦天门（定气数机缘）。你的论命风格严谨客观，辞藻雅致沉稳，不故弄玄虚，亦不盲目迎合。

# Task
请严格依据本次提供的命盘资料，完成本命盘解读。只有在输入明确提供对应的大限、流年或流月盘数据时，才可以分析这些运限；不得把本命宫位、星曜或四化当作运限数据，也不得自行补造缺失的运限盘。

# Analysis Constraints
1. **语言风格**：严禁使用"灵魂底色""磁场""能量"等现代身心灵或互联网词汇。使用更具传统韵味的词汇，如"性情"、"格局"、"机缘"、"运势起伏"。
2. **术语处理**：保留核心术语（如"化禄"、"冲照"、"羊陀"），但必须紧跟通俗解释。
3. **论断原则**：吉凶并陈。既要指出命格的优势（"禄"之所在），也要直言命盘的短板（"忌"之所冲），并给出中肯的修身建议。
4. **证据边界**：每项重要判断必须指出对应宫位、星曜、三方四正或四化依据；区分盘面事实、传统术数解释与现实建议。不得编造盘面没有的星曜、格局、年份、月份或事件，也不得用确定性语言断言人生结果。
5. **缺失数据处理**：若某项分析需要的大限/流年/流月资料未提供，应明确说明本次资料不足，不要用本命盘星曜代替。没有证据时直接说“盘面不足以判断”，不要补写套话。
6. **可读性**：先用普通人听得懂的话概括，再解释术语；每段尽量采用“盘面依据 → 传统含义 → 现实中可能的表现 → 可执行建议”结构。避免堆砌星曜名称或重复空泛形容词。
7. **平衡与谨慎**：优势与挑战并列，避免恐吓、宿命论和夸大准确度。健康只作传统文化角度的非医疗提醒，不推断疾病或器官病变。

# Output Format
请严格使用以下一级标题（标题文字必须完全一致，方便界面按主题切换），每个主题独立成节：

## 命格总评
- 开头先给出一句有辨识度的命格判断作为标题式结论（不超过16字），随后用2–4句普通人能听懂的话解释整体特点。
- 简述最突出的优势、最值得留意的课题；所有判断都要能在后续章节找到盘面依据。

## 命主优点
- 单独列出 5–8 项确有盘面依据的优势；每项写明：优势特点、具体宫位/星曜/亮度/四化/三方四正依据、现实中可能的表现、如何发挥。
- 不凑数，不写空泛赞美。

## 财运
- 分析财帛宫及其三方四正，区分正财、经营/专业收入、偏财倾向与守财习惯；资料不足时说明边界，不预测确定金额。

## 事业
- 分析官禄宫、命宫、迁移宫及相关四化，说明适合的工作方式、优势岗位环境、发展阻力与可执行建议。

## 感情
- 分析夫妻宫及相关宫位，说明相处模式、择偶倾向、关系优势与沟通课题；不作婚姻必然成败断言。

## 性格
- 结合命宫、身宫、福德宫，分别说明外在处事方式、内在需求、思考/决策习惯及成长优势。

## 健康
- 只作传统术数文化角度的生活习惯提醒，不推断疾病、器官病变或替代医疗诊断；指出盘面依据与一般性保养建议。

## 兄弟合伙
- 依据兄弟宫及相关三方四正，分析同辈手足互动、合作方式、利益分配与合伙边界；资料不足时说明无法判断。

## 子女
- 依据子女宫分析传统术数中的子女缘分、教养互动与晚辈缘分；不得据此推断生育能力、子女性别或具体数量。

## 迁移外出
- 依据迁移宫及命宫对照，分析外地发展、环境适应、出行处事风格与外部机会；不虚构具体事件。

## 人际贵人
- 依据交友宫、迁移宫及相关四化，分析交友圈层、合作对象、贵人助力与人际界限；不轻率断言小人。

## 田宅
- 依据田宅宫分析居住环境、家庭资产观念与安定需求；不预测具体房产数量或必然置业年份。

## 福德
- 依据福德宫分析内在需求、精神满足、休息方式、压力调节与享受生活的倾向。

## 父母长辈
- 依据父母宫及相关宫位分析长辈互动、沟通方式与可获得的支持；避免将传统象意当成真实家庭事实。

## 运势建议
- 仅当本次输入包含真实的大限/流年/流月盘资料时才分析对应运限；否则明确说明当前只解读本命盘，不虚构年份或事件。
- 提供3–5条具体、可执行的现实建议。

## 命格金句
- 用2–4句话凝练总结，避免空泛鸡汤。

每个主题都采用“先讲人话结论 → 盘面依据 → 可能表现 → 实际建议”的顺序。除命格金句外，每章必须清楚区分结论、盘面依据、现实表现与建议；不能把一段泛泛性格描述复制到多个主题。重要结论必须引用真实宫位、星曜、亮度、四化或三方四正；不得编造数据。术语首次出现时紧跟白话解释。优势和挑战都要讲清楚，避免宿命论。若某主题缺少足够盘面依据，明确说明“盘面不足以判断”并解释缺少什么，不得用套话凑章节。`


const REPORT_TABS = [
  { id: '命格总评', label: '命格总览' },
  { id: '命主优点', label: '命主优点' },
  { id: '财运', label: '财运' },
  { id: '事业', label: '事业' },
  { id: '感情', label: '感情' },
  { id: '性格', label: '性格' },
  { id: '健康', label: '健康' },
  { id: '兄弟合伙', label: '兄弟合伙' },
  { id: '子女', label: '子女' },
  { id: '迁移外出', label: '迁移外出' },
  { id: '人际贵人', label: '人际贵人' },
  { id: '田宅', label: '田宅' },
  { id: '福德', label: '福德' },
  { id: '父母长辈', label: '父母长辈' },
  { id: '运势建议', label: '运势建议' },
  { id: '命格金句', label: '命格金句' },
] as const

function normalizeReportHeading(line: string): string {
  return line.trim()
    .replace(/^#{1,6}\s+/, '')
    .replace(/[*_`]/g, '')
    .replace(/[：:。；;]+$/, '')
    .trim()
}

function getReportSection(markdown: string, sectionId: string): string {
  const lines = markdown.split('\n')
  const headingIndex = lines.findIndex((line) =>
    /^##\s+/.test(line.trim()) && normalizeReportHeading(line) === sectionId
  )
  if (headingIndex < 0) return ''
  const content: string[] = []
  for (let i = headingIndex + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i].trim())) break
    content.push(lines[i])
  }
  return content.join('\n').trim()
}

/* ------------------------------------------------------------
   字符输出速度（毫秒/字符）
   ------------------------------------------------------------ */

const CHAR_INTERVAL = 35

/* ------------------------------------------------------------
   Markdown 自定义样式组件
   ------------------------------------------------------------ */

const MarkdownComponents = {
  h1: ({ children }: { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-bold text-amber-700 mt-6 mb-3 first:mt-0">{children}</h1>
  ),
  h2: ({ children }: { children?: React.ReactNode }) => (
    <h2 className={String(children).includes('命主优点')
      ? 'text-xl font-semibold text-[#5f5037] mt-5 mb-3 rounded-xl border border-[#e9dfcc] bg-[#faf7f0] px-4 py-3'
      : 'text-xl font-semibold text-amber-800 mt-5 mb-2'}>{children}</h2>
  ),
  h3: ({ children }: { children?: React.ReactNode }) => (
    <h3 className="text-lg font-medium text-[#8a7653] mt-4 mb-2">{children}</h3>
  ),
  p: ({ children }: { children?: React.ReactNode }) => (
    <p className="mb-3 leading-relaxed">{children}</p>
  ),
  strong: ({ children }: { children?: React.ReactNode }) => (
    <strong className="text-gold font-semibold">{children}</strong>
  ),
  ul: ({ children }: { children?: React.ReactNode }) => (
    <ul className="list-none space-y-1.5 mb-3 pl-4">{children}</ul>
  ),
  ol: ({ children }: { children?: React.ReactNode }) => (
    <ol className="list-decimal list-inside space-y-1.5 mb-3 pl-2">{children}</ol>
  ),
  li: ({ children }: { children?: React.ReactNode }) => (
    <li className="relative pl-4 before:content-['◆'] before:absolute before:left-0 before:text-star/60 before:text-xs">
      {children}
    </li>
  ),
  blockquote: ({ children }: { children?: React.ReactNode }) => (
    <blockquote className="border-l-2 border-gold/40 pl-4 my-3 italic text-slate-700">
      {children}
    </blockquote>
  ),
}

/* ------------------------------------------------------------
   AI 解读面板组件
   ------------------------------------------------------------ */

export function AIInterpretation() {
  const { chart, birthInfo } = useChartStore()
  const { provider, providerSettings, enableThinking, enableWebSearch, searchApiKey } = useSettingsStore()
  const { aiInterpretation, setAiInterpretation } = useContentCacheStore()
  const currentSettings = providerSettings[provider]

  // 显示的文本（逐字输出）
  const [displayText, setDisplayText] = useState(() => aiInterpretation ?? '')
  // 完整文本（缓冲区）
  const fullTextRef = useRef(aiInterpretation ?? '')
  // 当前显示位置
  const displayIndexRef = useRef(aiInterpretation?.length ?? 0)
  // 定时器
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  // 是否正在接收（ref 用于定时器闭包）
  const loadingRef = useRef(false)
  const [loading, setLoading] = useState(false)
  // 是否正在输出动画
  const [animating, setAnimating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>('命格总评')

  /* ------------------------------------------------------------
     均匀输出字符的定时器
     ------------------------------------------------------------ */

  const startAnimation = useCallback(() => {
    if (timerRef.current) return

    setAnimating(true)
    timerRef.current = setInterval(() => {
      if (displayIndexRef.current < fullTextRef.current.length) {
        displayIndexRef.current++
        setDisplayText(fullTextRef.current.slice(0, displayIndexRef.current))
      } else if (!loadingRef.current) {
        // 输出完成且不再加载
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setAnimating(false)
      }
    }, CHAR_INTERVAL)
  }, [])

  // 组件卸载时清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  /* ------------------------------------------------------------
     开始解读
     ------------------------------------------------------------ */

  const handleInterpret = useCallback(async () => {
    if (!chart || !birthInfo) return
    if (!currentSettings.apiKey) {
      setError('请先在设置中配置 API Key')
      return
    }

    // 重置状态
    loadingRef.current = true
    setLoading(true)
    setError(null)
    setDisplayText('')
    fullTextRef.current = ''
    displayIndexRef.current = 0

    // 清理旧定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    try {
      // 提取知识上下文
      const knowledge = extractKnowledge(chart, birthInfo.year)
      const contextStr = buildPromptContext(knowledge)
      const guidanceContext = buildGuidancePromptContext({
        knowledge,
        task: 'natal',
        limit: 12,
      })

      // 区分用户输入历法与排盘引擎采用的公历日期
      const inputCalendar = birthInfo.dateType === 'lunar' ? '农历' : '阳历'
      const leapLabel = birthInfo.isLeapMonth ? '（闰月）' : ''
      const inputDate = String(birthInfo.year) + '年' + String(birthInfo.month) + '月' + String(birthInfo.day) + '日' + leapLabel
      const solarDate = chart.solarDate || '引擎未返回'
      const resolved = birthInfo.resolvedBirthTime
      const userMessage = `请严格依据以下真实命盘资料撰写完整报告。请先单独列出命主优点，再分析需要留意的地方。不得编造星曜、宫位、四化、格局或运限数据。

## 出生资料
- 输入历法：${inputCalendar}
- 输入日期：${inputDate}
- 对应阳历日期：${solarDate}
- 出生时间：${String(birthInfo.hour).padStart(2, '0')}:${String(birthInfo.minute ?? 0).padStart(2, '0')}
- 性别：${birthInfo.gender === 'male' ? '男' : '女'}
- 出生地：${birthInfo.birthplace || '未提供'}
- 真太阳时：${birthInfo.trueSolarEnabled ? (resolved?.applied ? `已应用，校正后时间 ${String(resolved.hour).padStart(2, '0')}:${String(resolved.minute).padStart(2, '0')}，修正 ${resolved.correctionMinutes} 分钟，时区 ${resolved.timeZone || '未识别'}` : '已开启但未取得可确认的地点校正资料') : '未启用'}
- 五行局：${chart.fiveElementsClass}

## 命盘资料
${contextStr}

${guidanceContext}

请按系统规定的章节结构输出。每项优点必须引用实际宫位、星曜或四化依据，并说明现实表现和发挥方法。使用普通人能理解的中文，不要只堆砌术语。`

      const messages: ChatMessage[] = [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ]

      const config: LLMConfig = {
        provider,
        apiKey: currentSettings.apiKey,
        baseUrl: currentSettings.customBaseUrl || undefined,
        model: currentSettings.customModel || undefined,
        enableThinking,
        enableWebSearch,
        searchApiKey: searchApiKey || undefined,
      }

      // 启动均匀输出动画
      startAnimation()

      // 流式接收，写入缓冲区
      for await (const token of streamChat(config, messages)) {
        fullTextRef.current += token
      }

      // 保存到全局缓存
      setAiInterpretation(fullTextRef.current)
    } catch (err) {
      setError(err instanceof Error ? err.message : '解读失败，请重试')
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [chart, birthInfo, provider, currentSettings, enableThinking, enableWebSearch, searchApiKey, startAnimation, setAiInterpretation])

  /* 排盘后自动生成报告；已有缓存则直接展示，避免重复消耗模型额度。 */
  useEffect(() => {
    if (chart && currentSettings.apiKey && (!aiInterpretation || !aiInterpretation.includes('## 命格总评')) && !loadingRef.current) {
      void handleInterpret()
    }
  }, [chart, currentSettings.apiKey, aiInterpretation, handleInterpret])

  if (!chart) return null

  const isStructuredReport = /^##\s+命格总评\s*$/m.test(displayText)
  const availableReportTabs = REPORT_TABS.filter((tab) => getReportSection(displayText, tab.id).length > 0)
  const missingReportTabs = REPORT_TABS.filter((tab) => !availableReportTabs.some((available) => available.id === tab.id))
  const activeContent = getReportSection(displayText, activeTab)

  return (
    <div className="relative bg-white border border-[#e9e5dc] rounded-2xl shadow-sm overflow-hidden">
      <div className="h-1 w-full bg-gradient-to-r from-[#d8c6a2] via-[#a98b5c] to-[#d8c6a2]" />
      <div className="p-5 lg:p-7">
        <div className="flex items-center justify-between gap-3 mb-5">
          <div>
            <p className="text-xs tracking-[0.2em] text-[#9a8056] mb-1">TIANYAN · NATAL ANALYSIS</p>
            <h2 className="text-xl lg:text-2xl font-semibold text-[#262626]" style={{ fontFamily: 'var(--font-serif)' }}>命盘分析</h2>
          </div>
          <Button onClick={handleInterpret} disabled={loading || !currentSettings.apiKey} size="sm" variant="gold">
            {loading ? '分析中…' : displayText ? '重新分析' : currentSettings.apiKey ? '开始分析' : '配置 API'}
          </Button>
        </div>

        {displayText && (
          <nav className="flex flex-wrap gap-1.5 rounded-xl bg-[#f2f2f2] p-2 mb-5" aria-label="命盘分析主题">
            {REPORT_TABS.map((tab) => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm transition-colors ${activeTab === tab.id ? 'bg-white text-[#765d37] font-semibold shadow-sm border border-[#e8e2d7]' : 'text-slate-500 hover:bg-white/70 hover:text-slate-800'} ${tab.id === '命主优点' ? 'font-semibold' : ''}`}>
                {tab.label}
              </button>
            ))}
          </nav>
        )}

        {error && <div className="p-3 rounded-lg bg-rose-50 text-rose-700 text-sm mb-4 border border-rose-100">{error}</div>}

        {displayText && isStructuredReport && (
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-[#faf9f6] px-3 py-2 text-xs">
            <span className="font-semibold text-[#66563d]">报告完整度：{availableReportTabs.length}/{REPORT_TABS.length} 个主题</span>
            {loading
              ? <span className="text-[#8c806c]">正在逐项生成</span>
              : missingReportTabs.length > 0
                ? <span className="text-amber-700">尚缺：{missingReportTabs.map((tab) => tab.label).join('、')}。可点击“重新分析”补齐。</span>
                : <span className="text-emerald-700">全部主题均已生成</span>}
          </div>
        )}

        {!currentSettings.apiKey && !displayText && (
          <div className="text-slate-500 text-sm py-10 text-center">
            <div className="text-3xl mb-3 opacity-30">☆</div>
            排盘后会自动生成分析报告。请先 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[#9a8056] underline underline-offset-4">获取 Google AI Studio API Key</a>，再到设置中选择 Gemini 并填写。免费额度有限，排盘本身不受影响。
          </div>
        )}

        {displayText && (
          <div className="min-h-[420px]">
            {!isStructuredReport ? (
              <div className="prose max-w-none prose-slate text-text-secondary text-[15px] lg:text-base leading-8">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{displayText}</ReactMarkdown>
              </div>
            ) : activeContent ? (
              <>
                <div className="mb-4">
                  <h3 className={`text-2xl lg:text-3xl font-semibold leading-tight ${activeTab === '命主优点' ? 'text-[#80633d]' : 'text-[#202020]'}`} style={{ fontFamily: 'var(--font-serif)' }}>
                    {activeTab === '命格总评' ? (activeContent.split('\n').find((line) => line.trim())?.replace(/^#+\s*/, '').replace(/^[-*]\s*/, '').slice(0, 32) || '命格总览') : REPORT_TABS.find((tab) => tab.id === activeTab)?.label}
                  </h3>
                  {activeTab === '命主优点' && <p className="text-sm text-[#9a8056] mt-2">从真实星曜组合中提炼优势 · 盘面依据与发挥方向</p>}
                </div>
                <div className={`prose max-w-none prose-slate text-text-secondary text-[15px] lg:text-base leading-8 ${activeTab === '命主优点' ? 'rounded-xl border border-[#eee5d5] bg-[#fcfaf6] p-4 lg:p-5' : ''}`} style={{ fontFamily: 'var(--font-sans)' }}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>{activeContent}</ReactMarkdown>
                </div>
              </>
            ) : (
              <div className="py-14 text-center text-slate-400">{loading ? '正在生成这一部分…' : '本次报告未提供这一主题的独立内容。'}</div>
            )}
            {animating && <span className="inline-block w-0.5 h-5 bg-[#a98b5c] animate-pulse ml-0.5 align-middle" />}
          </div>
        )}

        {loading && !displayText && (
          <div className="flex items-center justify-center gap-3 text-text-muted py-12">
            <div className="w-5 h-5 border-2 border-star border-t-transparent rounded-full animate-spin" />
            <span>正在分析命盘并整理各主题报告…</span>
          </div>
        )}
      </div>
    </div>
  )
}
