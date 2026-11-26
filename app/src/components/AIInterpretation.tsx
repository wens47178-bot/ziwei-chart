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
请严格按以下结构输出。第一部分“命主优点”必须独立成节并放在报告最前面，不能混在缺点或总评里：

## 一、命主优点｜值得发挥的长处
- 单独列出 5–8 项有盘面依据的优势，每项包括：**优势特点**、**盘面依据**（具体宫位、星曜、亮度、四化或三方四正）、**现实中的表现**、**如何发挥**。
- 只写当前命盘确实支持的优点；证据不足就不凑数，不用“聪明、善良、有贵人”等套话。
- 明确这些是传统紫微斗数的倾向性解读，不是人格或未来的定论。

## 二、需要留意的地方｜可改善的课题
- 列出 3–5 项有依据的挑战，每项写明盘面依据、可能表现和可执行的调整方法；避免恐吓和宿命论。

## 三、命格总览
### 壹· 命格总断
* **先看结论**：用3-5句通俗语言说明命盘主要特点、最突出的优势与最需要留意的课题。
* **格局层次**：依据命宫三方四正的实际星曜组合说明结构特点；不得简单给命格贴“高/低”标签，必须解释判断依据。
* **性情剖析**：结合命宫与福德宫，分析命主显露在外的处世风格，以及内心的真实欲求与精神境界。

### 肆· 事业与财运
* **官禄方向**：依据官禄宫星情与五行属性，指出命主最适合发展的行业性质（如：宜公职、宜经商、或宜技艺求财）。
* **财运机缘**：分析财帛宫强弱。是正财稳健，还是偏财灵动？一生财源主要来自何方？有无漏财之虞？

### 伍· 婚姻与情感
* **姻缘概况**：分析夫妻宫星曜，描述配偶可能的性格特征或相处模式。
* **相处之道**：指出感情中可能存在的隐患（如：沟通不畅、聚少离多），并给出化解建议。

### 陆· 六亲与人际
* **人际关系**：分析迁移宫及交友宫，判断在外是否有贵人扶持，或是易犯小人口舌。
* **家庭关系**：简述与父母、子女的缘分深浅。

### 柒· 运势隐忧与建议
* **健康提醒**：依据疾厄宫，指出先天体质上较弱的环节，提示需注意的身体部位。
* **趋吉避凶**：综合全盘化忌与煞星的实际落点，说明最值得留意的行为模式，并给出日常可执行的改善建议；没有运限数据时不得指定应验年份或月份。

### 捌· 命格金句
> 请用2-4句话，以诗意且戳心的方式概括命主的核心性格特质。要求：
> - 语言凝练，朗朗上口，适合分享
> - 风格可以是：自嘲式幽默、温柔共情、或霸气宣言
> - 避免空泛的鸡汤，要有具体的性格洞察
> - 格式：用引号包裹，每句话换行

---
*注：术数推演仅供参考，所谓命由天定，事在人为，望君善加把握。*`

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
      const inputDate = `${birthInfo.year}年${birthInfo.month}月${birthInfo.day}日${birthInfo.dateType === 'lunar' && birthInfo.isLeapMonth ? '（闰月）' : ''}`
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
    if (chart && currentSettings.apiKey && !aiInterpretation && !loadingRef.current) {
      void handleInterpret()
    }
  }, [chart, currentSettings.apiKey, aiInterpretation, handleInterpret])

  if (!chart) return null

  return (
    <div
      className="
        relative p-6 lg:p-8
        bg-white border border-[#e9e5dc] rounded-2xl shadow-sm
      "
    >
      {/* 顶部发光线 */}
      <div
        className="
          absolute top-0 left-1/2 -translate-x-1/2
          w-1/3 h-px
          bg-gradient-to-r from-transparent via-gold/50 to-transparent
        "
      />

      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h2
          className="
            text-xl lg:text-2xl font-semibold
            bg-gradient-to-r from-gold via-gold-light to-gold
            bg-clip-text text-transparent
          "
          style={{ fontFamily: 'var(--font-serif)' }}
        >
          命盘解读报告
        </h2>
        <Button
          onClick={handleInterpret}
          disabled={loading || !currentSettings.apiKey}
          size="sm"
          variant="gold"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              解读中
            </span>
          ) : currentSettings.apiKey ? '开始解读' : '请先配置 API'}
        </Button>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="p-3 rounded-lg bg-misfortune/10 text-rose-700 text-sm mb-4 border border-misfortune/20">
          {error}
        </div>
      )}

      {/* 未配置提示 */}
      {!currentSettings.apiKey && !displayText && (
        <div className="text-slate-500 text-sm py-8 text-center">
          <div className="text-3xl mb-3 opacity-30">☆</div>
          排盘后会自动生成这份报告。首次使用请先 <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[#9a8056] underline underline-offset-4">免费获取 Google AI Studio API Key</a>，再到右上角「设置」中选择 Gemini 并填写。免费额度有限，达到上限后可稍后重试；排盘和其他本地分析功能不受影响。
        </div>
      )}

      {/* 解读内容 - 分节报告 + Markdown 渲染 */}
      {displayText && (
        <div
          className="
            prose max-w-none prose-slate
            text-text-secondary text-base leading-8
          "
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={MarkdownComponents}
          >
            {displayText}
          </ReactMarkdown>

          {/* 光标指示器 */}
          {animating && (
            <span className="inline-block w-0.5 h-5 bg-gold/80 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      )}

      {/* 加载占位 */}
      {loading && !displayText && (
        <div className="flex items-center justify-center gap-3 text-text-muted py-12">
          <div className="w-5 h-5 border-2 border-star border-t-transparent rounded-full animate-spin" />
          <span>正在分析命盘...</span>
        </div>
      )}
    </div>
  )
}
