export type SupportedLanguage = "en" | "ja" | "zh-TW"

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ["en", "ja", "zh-TW"]

export const DEFAULT_LANGUAGE: SupportedLanguage = "en"

export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: "English",
  ja: "日本語",
  "zh-TW": "繁體中文",
}

export function isSupportedLanguage(value: unknown): value is SupportedLanguage {
  return typeof value === "string" && (SUPPORTED_LANGUAGES as string[]).includes(value)
}

const enInversionLabel = (max: number): string => {
  switch (max) {
    case 1:
      return "1st"
    case 2:
      return "2nd"
    case 3:
      return "3rd"
    default:
      return `${max}th`
  }
}

const jaInversionLabel = (max: number): string => {
  switch (max) {
    case 1:
      return "第1転回"
    case 2:
      return "第2転回"
    case 3:
      return "第3転回"
    default:
      return `${max}転回`
  }
}

const zhInversionLabel = (max: number): string => {
  switch (max) {
    case 1:
      return "第一轉位"
    case 2:
      return "第二轉位"
    case 3:
      return "第三轉位"
    default:
      return `第${max}轉位`
  }
}

const enInversionSummary = (enabled: boolean, max: number) =>
  enabled ? `Inversions up to ${enInversionLabel(max)}` : "Root position only"

const jaInversionSummary = (enabled: boolean, max: number) =>
  enabled ? `${jaInversionLabel(max)}まで使用` : "根音配置のみ"

const zhInversionSummary = (enabled: boolean, max: number) =>
  enabled ? `包含 ${zhInversionLabel(max)}` : "僅根音位置"

const enInversionProbability = (probability: number, max: number) =>
  `${Math.round(probability * 100)}% inversions up to ${enInversionLabel(max)}`

const jaInversionProbability = (probability: number, max: number) =>
  `転回率 ${Math.round(probability * 100)}%（${jaInversionLabel(max)}まで）`

const zhInversionProbability = (probability: number, max: number) =>
  `轉位比率 ${Math.round(probability * 100)}%（${zhInversionLabel(max)}）`

const enKeysWithOptions = (keys: string[], options: number) => `Keys: ${keys.join(", ")} (${options} total options)`
const jaKeysWithOptions = (keys: string[], options: number) => `キー: ${keys.join(", ")}（合計 ${options} パターン）`
const zhKeysWithOptions = (keys: string[], options: number) => `調性: ${keys.join(", ")}（共 ${options} 種組合）`

export const MESSAGES = {
  en: {
    common: {
      close: "Close",
      loading: "Loading...",
      loadingProgress: "Loading progress data...",
      loadingSession: "Loading training session...",
    },
    settings: {
      title: "Settings",
      description: "Tune the app appearance and enable developer helpers.",
      themeLabel: "Theme",
      themeDescription: "Switch between light, dark, or system preference.",
      themeOptions: {
        system: "System",
        light: "Light",
        dark: "Dark",
      },
      instrumentLabel: "Instrument",
      instrumentDescription: "Choose the playback timbre for chord practice.",
      languageLabel: "Language",
      languageDescription: "Translate interface copy without affecting musical notation.",
      voiceLeadingLabel: "Voice Leading",
      voiceLeadingDescription: "Smooth out chord transitions with automatic inversions.",
      debugLabel: "Debug Mode",
      debugDescription: "Reveal the played notes and correct answers for each chord.",
      closeButton: "Close",
    },
    home: {
      welcomeLink: "Welcome",
      quickSetup: "Quick Setup",
      modeLabel: "Mode",
      difficultyLabel: "Difficulty",
      answerFormatLabel: "Answer format:",
      exampleLabel: "Example:",
      startTraining: "Start Training",
      fullSetup: "Full Setup",
      progress: "Progress",
      setupTitle: "Setup Training",
      trainingModeHeading: "Training Mode",
      difficultyHeading: "Difficulty Level",
      progressButton: "Progress",
      menuStart: "Start Training",
      menuFullSetup: "Full Setup",
      menuProgress: "Progress",
      playground: "Playground",
      noKeys: "All keys",
    },
    trainingSession: {
      exit: "Exit",
      score: "Score",
      questionLabel: "Question",
      openSettingsAria: "Open settings",
    },
    question: {
      listenAndAnswer: "Listen & Answer",
      badgeNames: "Names",
      badgeNumerals: "Numerals",
      keyLabel: "Key",
      debugTitle: "Debug Info",
      debugAnswerLabel: "Answer",
      debugNotesLabel: "Notes",
      selectPromptAbsolute: "Select chord names",
      selectPromptRoman: "Select Roman numerals",
      placeholderAbsolute: "Select chord",
      placeholderRoman: "Select numeral",
      chordLabel: "Chord",
      submit: "Submit",
      next: "Next",
      finish: "Finish",
      correct: "Correct",
      incorrect: "Incorrect",
      correctEmphasis: "Correct!",
    },
    audio: {
      play: "Play",
      stop: "Stop",
      replay: "Replay",
      chordCount: (count: number) => `${count} chords`,
      noProgression: "No progression",
    },
    playground: {
      title: "Playground",
      subtitle: "Build and loop custom chord collections.",
      startLoop: "Start Loop",
      stopLoop: "Stop Loop",
      modeLabel: "Selection Mode",
      modeAbsolute: "Absolute",
      modeTranspose: "Transpose",
      keyLabel: "Key",
      sequenceHeading: "Chord Sequence",
      addSlot: "Add Slot",
      emptySlotLabel: "Empty",
      assignPrompt: "Tap a chord to assign",
      nowPlaying: "Now",
      moveLeft: "Move left",
      moveRight: "Move right",
      removeSlot: "Remove slot",
      savedSetsLabel: "Saved Sets",
      saveHint: "Save your chord lists locally.",
      saveAction: "Save",
      loadAction: "Load",
      clearAction: "Clear",
      savePrompt: "Name this set",
      emptySave: "Empty slot",
      chordCount: (count: number) => `${count} chords`,
      currentSlotLabel: "Selected Slot",
      modeIndicator: "Mode:",
      controlsButton: "Controls",
      tempoLabel: "Tempo",
      tempoHint: "Each chord holds for a full bar.",
      voiceLeadingLabel: "Auto Voice Leading",
      voiceLeadingHint: "Smooth transitions by revoicing chords automatically.",
    },
    sessionResults: {
      noData: "No session data available",
      completeTitle: "Training Session Complete!",
      summaryIntro: (total: number, mode: string, difficulty: string) =>
        `You completed ${total} questions in ${mode} mode at ${difficulty} difficulty`,
      performanceSummary: "Performance Summary",
      accuracy: "Accuracy",
      totalTime: "Total Time",
      averagePerQuestion: "Average per Question",
      questionBreakdown: "Question Breakdown",
      yourAnswer: "Your answer",
      correct: "Correct",
      incorrect: "Incorrect",
      tryAgain: "Try Again",
      backToMenu: "Back to Menu",
      tipsTitle: "Tips for Improvement",
      tips: [
        "• Practice identifying chord qualities (major, minor, dominant 7th)",
        "• Listen to the bass line to identify root movement",
        "• Start with simpler progressions and gradually increase difficulty",
        "• Use the hint feature to learn common progression patterns",
      ],
      performanceLevels: {
        excellent: "Excellent",
        good: "Good",
        fair: "Fair",
        needsPractice: "Needs Practice",
      },
      accuracySummary: (correct: number, total: number) => `${correct} correct out of ${total} questions`,
    },
    progress: {
      title: "Progress Dashboard",
      close: "Close",
      totalSessions: "Total Sessions",
      overallAccuracy: "Overall Accuracy",
      currentStreak: "Current Streak",
      bestLabel: (best: number) => `Best: ${best}`,
      averageSessionTime: "Avg Session Time",
      lastLabel: "Last",
      progressSummary: "Progress Summary",
      recentTrend: "Recent Trend",
      accuracyChange: (change: number) => `${change >= 0 ? "+" : ""}${change.toFixed(1)}% accuracy change`,
      strongestMode: "Strongest Mode",
      nextMilestone: "Next Milestone",
      milestoneProgress: (current: number, target: number) => `${current} / ${target}`,
      performanceByMode: "Performance by Mode & Difficulty",
      noData: "No training data yet. Complete some sessions to see your progress!",
      sessionsAndQuestions: (sessions: number, questions: number) =>
        `${sessions} sessions • ${questions} questions`,
      bestAccuracy: (value: number) => `Best: ${value.toFixed(1)}%`,
      achievements: (unlocked: number, total: number) => `Achievements (${unlocked}/${total})`,
      unlocked: "Unlocked",
      locked: "Locked",
      unlockedAt: (date: string) => `Unlocked ${date}`,
      never: "Never",
    },
    welcome: {
      title: "Henka Chord Trainer",
      skip: "Skip to trainer",
      heading: "Train your ear like a session musician",
      subheading:
        "Henka guides you through chord recognition drills that adapt to your goals. Choose your practice language—Roman numerals or absolute chord names—and grow from simple triads to extended harmony.",
      enterTrainer: "Enter trainer",
      knowFlow: "I already know the flow",
      cardListeningTitle: "Focused listening",
      cardListeningBody:
        "Hear rich, voice-led progressions rendered with realistic instruments so every interval stands out.",
      cardAdaptiveTitle: "Adaptive difficulty",
      cardAdaptiveBody:
        "Start with friendly triads, then unlock seventh and extended chords as your accuracy and speed improve.",
      cardFeedbackTitle: "Musical feedback",
      cardFeedbackBody:
        "Review correct answers, inversion usage, and key distributions to pinpoint what to practice next.",
      footer: "You can revisit this introduction anytime from the trainer navigation.",
    },
    gameModes: {
      transpose: {
        name: "Transpose Mode",
        description: "Identify chord progressions using Roman numeral analysis",
        instructions:
          "Listen to the root note, then identify the progression using Roman numerals like Imaj7, vi7, ii7, V7.",
        answerFormat: "Roman numerals (e.g., Imaj7, vi7, ii7, V7)",
      },
      absolute: {
        name: "Absolute Mode",
        description: "Identify chord progressions using absolute chord names",
        instructions:
          "Listen to the progression and identify each chord using absolute names like Cmaj7, Dm7, G7, etc.",
        answerFormat: "Chord names (e.g., Cmaj7, Dm7, G7)",
      },
    },
    difficulties: {
      easy: {
        name: "Easy",
        description: "Foundational major/minor triads in the friendliest keys with no inversions.",
      },
      beginner: {
        name: "Beginner",
        description: "Adds basic inversions and ii–V–I motion while staying in comfortable keys.",
      },
      intermediate: {
        name: "Intermediate",
        description: "Introduces seventh chords and light voice-leading with occasional inversions.",
      },
      advanced: {
        name: "Advanced",
        description: "Extended harmony across six-chord phrases with frequent inversions and richer tensions.",
      },
      custom: {
        name: "Custom",
        description: "Design your own mix with extended chords, borrowed degrees, and tailored inversion limits.",
      },
    },
    customDifficulty: {
      title: "Custom difficulty",
      description: "Choose the chord families you want to drill and dial in inversion behavior.",
      chordFamiliesLabel: "Chord families",
      selectedCount: (count: number) => `${count} selected`,
      groups: {
        triads: {
          label: "Triads",
          helper: "Foundational sonorities",
        },
        sevenths: {
          label: "Sevenths",
          helper: "Adds leading tones",
        },
        extensions: {
          label: "Extensions",
          helper: "Color tones and tensions",
        },
      },
      progressionLength: {
        label: "Progression length",
        helper: "How many chords per exercise.",
        option: (count: number) => `${count} chords`,
      },
      inversions: {
        label: "Inversions",
        helper: "Enable drop-in inversions and control how adventurous they are.",
        maxLabel: "Max inversion",
        frequencyLabel: "Inversion frequency",
        optionLabel: (label: string) => `${label} inversion`,
        intensityOptions: {
          subtle: "Subtle (20%)",
          occasional: "Occasional (40%)",
          frequent: "Frequent (60%)",
          bold: "Bold (80%)",
        },
      },
      voiceLeading: {
        label: "Voice leading",
        helper: "Keep chords smooth and closely spaced.",
      },
      actions: {
        configure: "Configure",
        editMix: "Edit custom mix",
        cancel: "Cancel",
        save: "Save changes",
      },
    },
    instruments: {
      sampled_grand: {
        label: "Sampled Grand",
        description: "Layered piano samples with wide dynamic range.",
      },
      sampled_violin: {
        label: "Sampled Violin",
        description: "Expressive arco violin layers drawn from MIT-licensed takes.",
      },
      sampled_flute: {
        label: "Sampled Flute",
        description: "Bright concert flute captured at forte dynamics.",
      },
      sampled_trumpet: {
        label: "Sampled Trumpet",
        description: "Bold brass timbre with forte sustains for lead lines.",
      },
      warm_triangle: {
        label: "Warm Keys",
        description: "Rounded triangle wave with a balanced tone.",
      },
      pure_sine: {
        label: "Pure Sine",
        description: "Smooth sine pad for gentle practice.",
      },
      bright_saw: {
        label: "Bright Saw",
        description: "Edgy sawtooth synth for clearer articulations.",
      },
      retro_square: {
        label: "Retro Square",
        description: "Chiptune-inspired square wave with a quick release.",
      },
      felt_piano: {
        label: "Soft Piano",
        description: "Plucky triangle tone with a lingering piano-like decay.",
      },
    },
    labels: {
      inversion: enInversionLabel,
      inversionSummary: enInversionSummary,
      chordFamilies: (count: number) => `${count} chord families`,
      chordPhrases: (length: number) => `${length}-chord phrases`,
      keysList: (keys?: string[]) => (keys && keys.length > 0 ? `Keys: ${keys.join(", ")}` : "All keys"),
      chordTypesBadge: (count: number) => `${count} types`,
      extraChordTypes: (extra: number) => `+${extra} more`,
      inversionProbability: enInversionProbability,
      keysWithOptions: enKeysWithOptions,
    },
  },
  ja: {
    common: {
      close: "閉じる",
      loading: "読み込み中...",
      loadingProgress: "進捗データを読み込み中...",
      loadingSession: "トレーニングを読み込み中...",
    },
    settings: {
      title: "設定",
      description: "表示や開発向けオプションを調整します。",
      themeLabel: "テーマ",
      themeDescription: "ライト・ダーク・システム設定を切り替えます。",
      themeOptions: {
        system: "システム",
        light: "ライト",
        dark: "ダーク",
      },
      instrumentLabel: "音色",
      instrumentDescription: "コード練習で使用するサウンドを選択します。",
      languageLabel: "表示言語",
      languageDescription: "インターフェースの文言のみ翻訳され、音名表記は変更されません。",
      voiceLeadingLabel: "ボイスリーディング",
      voiceLeadingDescription: "自動転回でコード移行を滑らかにします。",
      debugLabel: "デバッグモード",
      debugDescription: "各コードの解答と構成音を表示します。",
      closeButton: "閉じる",
    },
    home: {
      welcomeLink: "ようこそ",
      quickSetup: "クイック設定",
      modeLabel: "モード",
      difficultyLabel: "難易度",
      answerFormatLabel: "解答形式:",
      exampleLabel: "例:",
      startTraining: "トレーニング開始",
      fullSetup: "詳細設定",
      progress: "進捗",
      setupTitle: "トレーニング設定",
      trainingModeHeading: "トレーニングモード",
      difficultyHeading: "難易度レベル",
      progressButton: "進捗",
      menuStart: "トレーニング開始",
      menuFullSetup: "詳細設定",
      menuProgress: "進捗",
      playground: "プレイグラウンド",
      noKeys: "すべてのキー",
    },
    trainingSession: {
      exit: "終了",
      score: "スコア",
      questionLabel: "問題",
      openSettingsAria: "設定を開く",
    },
    question: {
      listenAndAnswer: "聴いて回答",
      badgeNames: "コード名",
      badgeNumerals: "ローマ数字",
      keyLabel: "キー",
      debugTitle: "デバッグ情報",
      debugAnswerLabel: "解答",
      debugNotesLabel: "構成音",
      selectPromptAbsolute: "コード名を選択",
      selectPromptRoman: "ローマ数字を選択",
      placeholderAbsolute: "コードを選択",
      placeholderRoman: "数字を選択",
      chordLabel: "コード",
      submit: "回答",
      next: "次へ",
      finish: "終了",
      correct: "正解",
      incorrect: "不正解",
      correctEmphasis: "正解！",
    },
    audio: {
      play: "再生",
      stop: "停止",
      replay: "リプレイ",
      chordCount: (count: number) => `${count} 和音`,
      noProgression: "進行なし",
    },
    playground: {
      title: "プレイグラウンド",
      subtitle: "自由にコードセットを作成してループ再生できます。",
      startLoop: "ループ開始",
      stopLoop: "ループ停止",
      modeLabel: "入力モード",
      modeAbsolute: "絶対",
      modeTranspose: "移調",
      keyLabel: "キー",
      sequenceHeading: "コードシーケンス",
      addSlot: "スロットを追加",
      emptySlotLabel: "空",
      assignPrompt: "ホイールでコードを割り当ててください",
      nowPlaying: "再生中",
      moveLeft: "左へ移動",
      moveRight: "右へ移動",
      removeSlot: "スロットを削除",
      savedSetsLabel: "保存済みセット",
      saveHint: "現在のコードリストをローカルに保存します。",
      saveAction: "保存",
      loadAction: "読み込み",
      clearAction: "クリア",
      savePrompt: "セット名を入力",
      emptySave: "空のスロット",
      chordCount: (count: number) => `${count} 個のコード`,
      currentSlotLabel: "選択中のスロット",
      modeIndicator: "モード:",
      controlsButton: "コントロール",
      tempoLabel: "テンポ",
      tempoHint: "各コードは1小節分再生されます。",
      voiceLeadingLabel: "自動ボイスリーディング",
      voiceLeadingHint: "自動転回でコードの移行を滑らかにします。",
    },
    sessionResults: {
      noData: "セッションデータがありません",
      completeTitle: "トレーニング完了",
      summaryIntro: (total: number, mode: string, difficulty: string) =>
        `${mode}モード・${difficulty}で ${total} 問に回答しました`,
      performanceSummary: "成績サマリー",
      accuracy: "正答率",
      totalTime: "合計時間",
      averagePerQuestion: "1問あたり",
      questionBreakdown: "問題別の結果",
      yourAnswer: "あなたの回答",
      correct: "正解",
      incorrect: "不正解",
      tryAgain: "もう一度",
      backToMenu: "メニューへ戻る",
      tipsTitle: "上達のヒント",
      tips: [
        "・コードの種類（メジャー、マイナー、ドミナント7th）を聞き分けましょう",
        "・ベースラインを意識してルートの動きを捉えましょう",
        "・簡単な進行から始めて徐々に難易度を上げましょう",
        "・ヒント機能で定番進行を学びましょう",
      ],
      performanceLevels: {
        excellent: "とても良い",
        good: "良い",
        fair: "まずまず",
        needsPractice: "要練習",
      },
      accuracySummary: (correct: number, total: number) => `正解 ${correct} / 全${total}問`,
    },
    progress: {
      title: "進捗ダッシュボード",
      close: "閉じる",
      totalSessions: "総セッション数",
      overallAccuracy: "総合正答率",
      currentStreak: "連続成功",
      bestLabel: (best: number) => `最高: ${best}`,
      averageSessionTime: "平均セッション時間",
      lastLabel: "最新",
      progressSummary: "進捗サマリー",
      recentTrend: "最近の傾向",
      accuracyChange: (change: number) =>
        `${change >= 0 ? "+" : ""}${change.toFixed(1)}% の正答率変化`,
      strongestMode: "得意なモード",
      nextMilestone: "次のマイルストーン",
      milestoneProgress: (current: number, target: number) => `${current} / ${target}`,
      performanceByMode: "モード × 難易度の成績",
      noData: "まだデータがありません。セッションを完了すると表示されます。",
      sessionsAndQuestions: (sessions: number, questions: number) =>
        `${sessions} セッション • ${questions} 問`,
      bestAccuracy: (value: number) => `最高: ${value.toFixed(1)}%`,
      achievements: (unlocked: number, total: number) => `実績 (${unlocked}/${total})`,
      unlocked: "達成済み",
      locked: "未達成",
      unlockedAt: (date: string) => `${date} に達成`,
      never: "未実施",
    },
    welcome: {
      title: "Henka コードトレーナー",
      skip: "トレーナーへスキップ",
      heading: "スタジオミュージシャンの耳を鍛えよう",
      subheading:
        "Henka は目標に合わせてコード聴取ドリルを出題します。ローマ数字かコード名、好きな表記で練習しながら、トライアドからテンションコードまでステップアップ。",
      enterTrainer: "トレーナーを開始",
      knowFlow: "操作は理解しています",
      cardListeningTitle: "集中したリスニング",
      cardListeningBody:
        "リアルな音色でボイスリードされた進行を聴き取り、音程を鮮明に捉えましょう。",
      cardAdaptiveTitle: "適応型の難易度",
      cardAdaptiveBody:
        "やさしいトライアドから始めて、正答率とスピードに応じて7th・テンションコードへ拡張。",
      cardFeedbackTitle: "音楽的なフィードバック",
      cardFeedbackBody:
        "正解・転回形・キー分布を振り返り、次に鍛えるポイントを明確にします。",
      footer: "このイントロ画面はメニューからいつでも再表示できます。",
    },
    gameModes: {
      transpose: {
        name: "トランスポーズモード",
        description: "ローマ数字分析でコード進行を判別します",
        instructions: "ルート音を聴いてから、Imaj7・vi7・ii7・V7 のようなローマ数字で答えましょう。",
        answerFormat: "ローマ数字（例: Imaj7, vi7, ii7, V7）",
      },
      absolute: {
        name: "アブソリュートモード",
        description: "絶対音名でコード進行を判別します",
        instructions: "進行を聴き取り、Cmaj7・Dm7・G7 などのコード名で答えましょう。",
        answerFormat: "コード名（例: Cmaj7, Dm7, G7）",
      },
    },
    difficulties: {
      easy: {
        name: "イージー",
        description: "扱いやすいキーでメジャー/マイナートライアドを転回なしで練習します。",
      },
      beginner: {
        name: "ビギナー",
        description: "基本的な転回と ii–V–I の動きを取り入れつつ、親しみやすいキーに限定します。",
      },
      intermediate: {
        name: "インターミディエイト",
        description: "ときどき転回を交えながら7thコードと緩やかなボイスリーディングを導入します。",
      },
      advanced: {
        name: "アドバンス",
        description: "6和音フレーズでテンションを含む拡張ハーモニーと頻繁な転回を扱います。",
      },
      custom: {
        name: "カスタム",
        description: "テンションや借用和音を含む自由な組み合わせと、転回の上限を自分で設定できます。",
      },
    },
    customDifficulty: {
      title: "カスタム難易度",
      description: "練習したいコードファミリーと転回の使い方を調整します。",
      chordFamiliesLabel: "コードファミリー",
      selectedCount: (count: number) => `${count} 件選択`,
      groups: {
        triads: {
          label: "三和音",
          helper: "基礎的な響き",
        },
        sevenths: {
          label: "セブンス",
          helper: "導音を追加",
        },
        extensions: {
          label: "テンション",
          helper: "彩りとテンションを加える",
        },
      },
      progressionLength: {
        label: "進行の長さ",
        helper: "1セットあたりのコード数。",
        option: (count: number) => `${count} 和音`,
      },
      inversions: {
        label: "転回形",
        helper: "転回を挿入する頻度をコントロールします。",
        maxLabel: "最大転回",
        frequencyLabel: "転回の頻度",
        optionLabel: (label: string) => label,
        intensityOptions: {
          subtle: "控えめ (20%)",
          occasional: "時々 (40%)",
          frequent: "頻繁 (60%)",
          bold: "積極的 (80%)",
        },
      },
      voiceLeading: {
        label: "ボイスリーディング",
        helper: "和音を滑らかに保ちます。",
      },
      actions: {
        configure: "設定",
        editMix: "カスタムを編集",
        cancel: "キャンセル",
        save: "保存",
      },
    },
    instruments: {
      sampled_grand: {
        label: "サンプリングピアノ",
        description: "広いダイナミクスをもつレイヤー済みピアノサンプル。",
      },
      sampled_violin: {
        label: "サンプリングバイオリン",
        description: "MITライセンスのテイクを用いた表情豊かなアルコ音色。",
      },
      sampled_flute: {
        label: "サンプリングフルート",
        description: "フォルテで収録した明るいコンサートフルート。",
      },
      sampled_trumpet: {
        label: "サンプリングトランペット",
        description: "リードに適した力強いブラスサステイン。",
      },
      warm_triangle: {
        label: "ウォームキー",
        description: "丸みのあるトライアングル波でバランスの良いトーン。",
      },
      pure_sine: {
        label: "ピュアサイン",
        description: "穏やかな練習に合う滑らかなサインパッド。",
      },
      bright_saw: {
        label: "ブライトソー",
        description: "輪郭のはっきりしたソー波でアタックを強調。",
      },
      retro_square: {
        label: "レトロスクエア",
        description: "レトロなゲーム風スクエア波、短いリリース。",
      },
      felt_piano: {
        label: "ソフトピアノ",
        description: "余韻のあるピアノ風サウンドを持つ柔らかなトーン。",
      },
    },
    labels: {
      inversion: jaInversionLabel,
      inversionSummary: jaInversionSummary,
      chordFamilies: (count: number) => `${count} 種類のコードファミリー`,
      chordPhrases: (length: number) => `${length} 和音のフレーズ`,
      keysList: (keys?: string[]) => (keys && keys.length > 0 ? `キー: ${keys.join(", ")}` : "すべてのキー"),
      chordTypesBadge: (count: number) => `${count} 種類`,
      extraChordTypes: (extra: number) => `+${extra} さらに`,
      inversionProbability: jaInversionProbability,
      keysWithOptions: jaKeysWithOptions,
    },
  },
  "zh-TW": {
    common: {
      close: "關閉",
      loading: "載入中...",
      loadingProgress: "正在載入進度資料...",
      loadingSession: "正在載入訓練...",
    },
    settings: {
      title: "設定",
      description: "調整介面外觀並啟用開發輔助功能。",
      themeLabel: "主題",
      themeDescription: "切換亮色、暗色或裝置預設主題。",
      themeOptions: {
        system: "系統",
        light: "亮色",
        dark: "暗色",
      },
      instrumentLabel: "樂器音色",
      instrumentDescription: "選擇用於和弦練習的播放音色。",
      languageLabel: "介面語言",
      languageDescription: "僅翻譯介面文字；音樂記譜不會改變。",
      voiceLeadingLabel: "聲部連接",
      voiceLeadingDescription: "自動套用轉位讓和弦銜接更流暢。",
      debugLabel: "除錯模式",
      debugDescription: "顯示每個和弦的正確答案與音符。",
      closeButton: "關閉",
    },
    home: {
      welcomeLink: "歡迎",
      quickSetup: "快速設定",
      modeLabel: "模式",
      difficultyLabel: "難度",
      answerFormatLabel: "作答格式:",
      exampleLabel: "範例:",
      startTraining: "開始訓練",
      fullSetup: "進階設定",
      progress: "進度",
      setupTitle: "訓練設定",
      trainingModeHeading: "訓練模式",
      difficultyHeading: "難度等級",
      progressButton: "進度",
      menuStart: "開始訓練",
      menuFullSetup: "進階設定",
      menuProgress: "進度",
      playground: "Playground",
      noKeys: "所有調性",
    },
    trainingSession: {
      exit: "離開",
      score: "分數",
      questionLabel: "題目",
      openSettingsAria: "開啟設定",
    },
    question: {
      listenAndAnswer: "聆聽並作答",
      badgeNames: "和弦名稱",
      badgeNumerals: "羅馬數字",
      keyLabel: "調性",
      debugTitle: "除錯資訊",
      debugAnswerLabel: "答案",
      debugNotesLabel: "音符",
      selectPromptAbsolute: "選擇和弦名稱",
      selectPromptRoman: "選擇羅馬數字",
      placeholderAbsolute: "選取和弦",
      placeholderRoman: "選取數字",
      chordLabel: "和弦",
      submit: "送出",
      next: "下一題",
      finish: "完成",
      correct: "正確",
      incorrect: "錯誤",
      correctEmphasis: "答對了！",
    },
    audio: {
      play: "播放",
      stop: "停止",
      replay: "重播",
      chordCount: (count: number) => `${count} 個和弦`,
      noProgression: "沒有和弦進行",
    },
    playground: {
      title: "Playground",
      subtitle: "建立並循環播放自訂和弦集合。",
      startLoop: "開始循環",
      stopLoop: "停止循環",
      modeLabel: "輸入模式",
      modeAbsolute: "絕對",
      modeTranspose: "移調",
      keyLabel: "調性",
      sequenceHeading: "和弦序列",
      addSlot: "新增槽位",
      emptySlotLabel: "空白",
      assignPrompt: "點選圓盤設定和弦",
      nowPlaying: "播放中",
      moveLeft: "向左移動",
      moveRight: "向右移動",
      removeSlot: "刪除槽位",
      savedSetsLabel: "儲存的組合",
      saveHint: "將目前的和弦列表儲存在本機。",
      saveAction: "儲存",
      loadAction: "載入",
      clearAction: "清除",
      savePrompt: "為此組合命名",
      emptySave: "空槽位",
      chordCount: (count: number) => `共 ${count} 個和弦`,
      currentSlotLabel: "目前槽位",
      modeIndicator: "模式:",
      controlsButton: "控制",
      tempoLabel: "速度",
      tempoHint: "每個和弦維持一個小節。",
      voiceLeadingLabel: "自動聲部連接",
      voiceLeadingHint: "自動轉位讓和弦銜接更平順。",
    },
    sessionResults: {
      noData: "沒有可用的訓練資料",
      completeTitle: "訓練完成",
      summaryIntro: (total: number, mode: string, difficulty: string) =>
        `你在 ${mode} 模式、${difficulty} 難度完成 ${total} 題`,
      performanceSummary: "表現摘要",
      accuracy: "正確率",
      totalTime: "總時間",
      averagePerQuestion: "平均每題",
      questionBreakdown: "題目解析",
      yourAnswer: "你的回答",
      correct: "正確",
      incorrect: "錯誤",
      tryAgain: "再試一次",
      backToMenu: "回主選單",
      tipsTitle: "進步小撇步",
      tips: [
        "・練習辨識和弦屬性（大、小、屬七和弦）",
        "・聽低音線條掌握根音移動",
        "・先從簡單的和弦進行開始，逐步提升難度",
        "・利用提示功能學習常見的和弦走向",
      ],
      performanceLevels: {
        excellent: "表現優異",
        good: "良好",
        fair: "普通",
        needsPractice: "加強練習",
      },
      accuracySummary: (correct: number, total: number) => `${correct} 題正確，共 ${total} 題`,
    },
    progress: {
      title: "進度儀表板",
      close: "關閉",
      totalSessions: "訓練場次",
      overallAccuracy: "整體正確率",
      currentStreak: "連勝紀錄",
      bestLabel: (best: number) => `最佳: ${best}`,
      averageSessionTime: "平均場次時間",
      lastLabel: "上次",
      progressSummary: "進度總覽",
      recentTrend: "近期趨勢",
      accuracyChange: (change: number) =>
        `${change >= 0 ? "+" : ""}${change.toFixed(1)}% 正確率變化`,
      strongestMode: "最擅長的模式",
      nextMilestone: "下一個里程碑",
      milestoneProgress: (current: number, target: number) => `${current} / ${target}`,
      performanceByMode: "各模式與難度表現",
      noData: "尚無訓練紀錄，完成幾場練習後即可查看。",
      sessionsAndQuestions: (sessions: number, questions: number) =>
        `${sessions} 場 • ${questions} 題`,
      bestAccuracy: (value: number) => `最佳: ${value.toFixed(1)}%`,
      achievements: (unlocked: number, total: number) => `成就 (${unlocked}/${total})`,
      unlocked: "已解鎖",
      locked: "未解鎖",
      unlockedAt: (date: string) => `${date} 解鎖`,
      never: "尚未",
    },
    welcome: {
      title: "Henka 和弦訓練",
      skip: "直接進入訓練",
      heading: "像職業樂手一樣鍛鍊耳朵",
      subheading:
        "Henka 會依你的目標調整和弦聽辨訓練。可選羅馬數字或和弦名稱作答，從簡單三和弦一路練到延伸和弦。",
      enterTrainer: "開始訓練",
      knowFlow: "我已經熟悉操作",
      cardListeningTitle: "專注聆聽",
      cardListeningBody:
        "以真實音色播放具聲部連接的和弦進行，讓每個音程都更明顯。",
      cardAdaptiveTitle: "自適應難度",
      cardAdaptiveBody:
        "從親切的三和弦起步，隨著正確率與速度提升開啟七和弦與延伸和弦。",
      cardFeedbackTitle: "音樂化回饋",
      cardFeedbackBody:
        "檢視正確答案、轉位使用與調性分布，鎖定下一步練習方向。",
      footer: "可在主選單隨時重新查看此介紹。",
    },
    gameModes: {
      transpose: {
        name: "轉調模式",
        description: "使用羅馬數字分析辨識和弦進行",
        instructions: "先聽根音，再用 Imaj7、vi7、ii7、V7 等羅馬數字回答。",
        answerFormat: "羅馬數字（例如 Imaj7, vi7, ii7, V7）",
      },
      absolute: {
        name: "絕對音名模式",
        description: "以和弦名稱辨識和弦進行",
        instructions: "聽進行後，用 Cmaj7、Dm7、G7 等和弦名稱作答。",
        answerFormat: "和弦名稱（例如 Cmaj7, Dm7, G7）",
      },
    },
    difficulties: {
      easy: {
        name: "簡單",
        description: "友善調性中的基礎大小三和弦，沒有轉位。",
      },
      beginner: {
        name: "初學",
        description: "加入基本轉位與 ii–V–I 走向，維持在容易的調性。",
      },
      intermediate: {
        name: "中階",
        description: "引入七和弦與適度聲部連接，偶爾使用轉位。",
      },
      advanced: {
        name: "高階",
        description: "六和弦片語中的延伸和聲，頻繁轉位與豐富張力。",
      },
      custom: {
        name: "自訂",
        description: "自選延伸與借用和聲，並設定專屬的轉位頻率與上限。",
      },
    },
    customDifficulty: {
      title: "自訂難度",
      description: "挑選想練習的和弦家族並調整轉位行為。",
      chordFamiliesLabel: "和弦家族",
      selectedCount: (count: number) => `已選 ${count} 項`,
      groups: {
        triads: {
          label: "三和弦",
          helper: "基礎音色",
        },
        sevenths: {
          label: "七和弦",
          helper: "加入導音色彩",
        },
        extensions: {
          label: "延伸和聲",
          helper: "增添色彩與張力",
        },
      },
      progressionLength: {
        label: "進行長度",
        helper: "每題包含的和弦數。",
        option: (count: number) => `${count} 個和弦`,
      },
      inversions: {
        label: "轉位",
        helper: "控制隨機插入轉位的頻率。",
        maxLabel: "最大轉位",
        frequencyLabel: "轉位頻率",
        optionLabel: (label: string) => label,
        intensityOptions: {
          subtle: "輕微 (20%)",
          occasional: "偶爾 (40%)",
          frequent: "常見 (60%)",
          bold: "大量 (80%)",
        },
      },
      voiceLeading: {
        label: "聲部連接",
        helper: "讓和弦銜接更平順。",
      },
      actions: {
        configure: "設定",
        editMix: "編輯自訂配置",
        cancel: "取消",
        save: "儲存變更",
      },
    },
    instruments: {
      sampled_grand: {
        label: "取樣平台鋼琴",
        description: "具寬廣動態的分層鋼琴取樣。",
      },
      sampled_violin: {
        label: "取樣小提琴",
        description: "以 MIT 授權素材重現表情豐富的持弓音色。",
      },
      sampled_flute: {
        label: "取樣長笛",
        description: "以 forte 音量錄製的明亮長笛。",
      },
      sampled_trumpet: {
        label: "取樣小號",
        description: "適合主奏的厚實銅管延音。",
      },
      warm_triangle: {
        label: "暖色鍵盤",
        description: "圓潤的三角波，音色均衡。",
      },
      pure_sine: {
        label: "純正弦",
        description: "適合溫和練習的柔順正弦墊。",
      },
      bright_saw: {
        label: "明亮鋸齒",
        description: "輪廓鮮明的鋸齒波，凸顯起音。",
      },
      retro_square: {
        label: "復古方波",
        description: "復古電玩感方波，收尾俐落。",
      },
      felt_piano: {
        label: "柔觸鋼琴",
        description: "帶有琴槌質感、餘韻綿長的柔和聲。",
      },
    },
    labels: {
      inversion: zhInversionLabel,
      inversionSummary: zhInversionSummary,
      chordFamilies: (count: number) => `${count} 組和弦族群`,
      chordPhrases: (length: number) => `${length} 個和弦的片語`,
      keysList: (keys?: string[]) => (keys && keys.length > 0 ? `調性: ${keys.join(", ")}` : "所有調性"),
      chordTypesBadge: (count: number) => `${count} 種`,
      extraChordTypes: (extra: number) => `+${extra} 更多`,
      inversionProbability: zhInversionProbability,
      keysWithOptions: zhKeysWithOptions,
    },
  },
} as const

export type Messages = (typeof MESSAGES)[SupportedLanguage]

export function getMessages(language: SupportedLanguage): Messages {
  return MESSAGES[language]
}

export function formatInversionSummary(language: SupportedLanguage, enabled: boolean, maxInversion: number): string {
  const messages = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  return messages.labels.inversionSummary(enabled, maxInversion)
}

export function formatChordFamilies(language: SupportedLanguage, count: number): string {
  const messages = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  return messages.labels.chordFamilies(count)
}

export function formatChordPhrases(language: SupportedLanguage, length: number): string {
  const messages = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  return messages.labels.chordPhrases(length)
}

export function formatKeys(language: SupportedLanguage, keys: string[] | undefined): string {
  const messages = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  return messages.labels.keysList(keys)
}

export function formatChordTypeBadge(language: SupportedLanguage, count: number): string {
  const messages = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  return messages.labels.chordTypesBadge(count)
}

export function formatExtraChordTypes(language: SupportedLanguage, extra: number): string {
  const messages = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  return messages.labels.extraChordTypes(extra)
}

export function formatInversionProbability(language: SupportedLanguage, probability: number, maxInversion: number): string {
  const messages = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  return messages.labels.inversionProbability(probability, maxInversion)
}

export function formatKeysWithOptions(language: SupportedLanguage, keys: string[], options: number): string {
  const messages = MESSAGES[language] ?? MESSAGES[DEFAULT_LANGUAGE]
  return messages.labels.keysWithOptions(keys, options)
}
