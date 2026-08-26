import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'tr' | 'en';

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

export const translations = {
  tr: {
    // Header & Tabs
    'app.title': 'NextJS',
    'app.subtitle': 'Full-Stack Test Arenası • Next.js 16.3 • Rust Turbopack Engine',
    'app.badge': 'v16.3',
    'nav.overview': 'Bento Dashboard',
    'nav.testArena': 'Test Arenası',
    'nav.performanceLab': 'Performans & Güvenlik',
    'nav.apiSimulator': 'App Router & API',
    'nav.scratchpad': 'Not & Denemeler',
    'nav.tools': 'Geliştirici Araçları',
    'header.arenaAction': 'ARENA TESTLERİ',
    'header.resetData': 'Örnek verileri sıfırla',
    'header.toggleTheme': 'Tema Değiştir',
    'header.langSelect': 'Dil Seçimi',

    // Overview Hero
    'hero.badge': 'Next.js 16.3 (En Son Sürüm) & Node.js 24 LTS',
    'hero.titleLine1': 'Test faster,',
    'hero.titleLine2': 'benchmark smarter.',
    'hero.desc': 'En son Next.js 16.3 mimarisi: Instant Navigations, Rust tabanlı React Compiler, Turbopack Persistent Cache, Server Actions doğrulama ve Edge streaming testleri.',
    'hero.enterArena': 'Test Arenasına Gir',
    'hero.perfLab': 'Performans Lab',
    'hero.notesCount': 'Notlar',
    'hero.edgeLatency': 'Edge Latency',
    'hero.edgeRegion': 'Bölge: fra1 (Frankfurt) • Turbopack v16.3',
    'hero.testCoverage': 'Test Kapsamı',
    'hero.testModules': '6/6 Modül • 22 Assertion',
    'hero.regressionCheck': 'Regresyon Kontrolü',
    'hero.allPassed': 'Tümü Geçti',
    'hero.commitLog': 'Build & Commit Günlüğü',
    'hero.buildTime': 'Turbopack Build',
    'hero.seconds': 'ms (Instant)',
    'hero.turbopackHmr': 'Persistent Cache & %90 Az Bellek Tüketimi',
    'hero.apiAction': 'Simülasyon & API Test',
    'hero.routeRunner': 'Route & Stream Koşucusu',
    'hero.routeRunnerDesc': "Next.js 16 Route Handlers, PPR ve Instant Navigations",

    // Test Arena
    'arena.suiteStatus': 'Suite Durumu',
    'arena.passed': 'Geçti',
    'arena.passRate': 'Başarı Oranı',
    'arena.execTime': 'Yürütme Süresi',
    'arena.totalMs': 'ms toplam',
    'arena.turbopackActive': 'Turbopack 16.3 Persistent Cache Aktif',
    'arena.avgPerTest': 'Test başına ortalama',
    'arena.assertionHealth': 'Assertion Sağlığı',
    'arena.zeroFlaky': 'Sıfır kararsız (flaky) test',
    'arena.strictTs': 'TypeScript 7 + React Compiler desteği',
    'arena.suiteControls': 'Suite Kontrolleri',
    'arena.runAll': 'Tüm Testleri Koş (Run All)',
    'arena.running': 'Koşuyor...',
    'arena.reset': 'Sıfırla (Reset)',
    'arena.parallelThreads': 'Paralel iş parçacıkları (Workers): 8 (Rust Engine)',
    'arena.testModules': 'Test Modülleri',
    'arena.scenarios': 'Senaryo',
    'arena.testDetail': 'Test Detayı',
    'arena.runTest': 'Testi Başlat',
    'arena.assertions': 'Doğrulama Kriterleri (Assertions)',
    'arena.sourceCode': 'Kaynak Kodu (Source Implementation)',
    'arena.runnerOutput': 'Runner Çıktı Akışı (Live Stream)',
    'arena.tsVersion': 'TypeScript 7 / Next.js 16.3',

    // Test Cases
    'test.tc1.name': 'Instant Navigations & Partial Prefetching',
    'test.tc1.desc': 'Next.js 16.3 Instant Navigations ve Partial Prefetching ile SPA düzeyinde sıfır gecikmeli sayfa geçişlerini test eder.',
    'test.tc2.name': 'Rust React Compiler & Otomatik Memoization',
    'test.tc2.desc': 'Turbopack içerisine entegre edilen Rust React Compiler ile useMemo/useCallback gerekmeden bileşen yeniden render optimizasyonunu doğrular.',
    'test.tc3.name': 'Server Action Revalidation Sözleşmesi',
    'test.tc3.desc': 'revalidatePath() önbellek geçersiz kılma ve sunucu mutasyonunda değişmez durum geçişini doğrular.',
    'test.tc4.name': 'Streaming SSR & Suspense Sınırları',
    'test.tc4.desc': 'Parçalı Transfer-Encoding, yedek iskeletler ve aşamalı HTML hidrasyon zamanlamasını test eder.',
    'test.tc5.name': 'App Router Middleware Koruması & Auth Başlıkları',
    'test.tc5.desc': 'Edge Middleware yeniden yazma kurallarını, çerez doğrulamasını ve yönlendirme döngülerini test eder.',
    'test.tc6.name': 'Turbopack Persistent Cache & Memory Eviction',
    'test.tc6.desc': 'Geliştirme ortamında %90 daha az bellek tüketimi ve derlemeler arası kalıcı önbellek doğrulaması.',

    // Performance Lab
    'perf.badge': 'Next.js 16.3 Telemetry & Engine Audits',
    'perf.title': 'Next.js 16.3 Benchmarks & Hardening Lab',
    'perf.runAll': 'Tüm Benchmarkları Çalıştır',
    'perf.running': 'Benchmark Koşuluyor...',
    'perf.opsSec': 'ops / sn',
    'perf.avgLatency': 'Ortalama Gecikme',
    'perf.stressTester': 'Next.js 16 Edge Load & Stress Tester',
    'perf.stressTitle': 'Eşzamanlı Yük Testi Simülatörü',
    'perf.fireLoad': 'Yük Testini Ateşle',
    'perf.concurrency': 'Eşzamanlı İstek (Concurrency)',
    'perf.workers': 'iş parçacığı',
    'perf.totalReqs': 'Toplam İstek Hacmi',
    'perf.requests': 'istek',
    'perf.throughput': 'Throughput',
    'perf.completed': 'Tamamlanan',
    'perf.latencyP50': 'Gecikme P50',
    'perf.successRate': 'Başarı Oranı',
    'perf.securityAudit': 'Next.js 16.3 Security Hardening Checklist',
    'perf.securityTitle': 'Next.js 16.3 Üretim Güvenlik & Güvenlik Yaması Denetimi',

    // Benchmarks Items
    'bench.compiler': 'Rust React Compiler AST Dönüşümü (1.000 bileşen)',
    'bench.turbocache': 'Turbopack Persistent Cache Hit Hızı',
    'bench.instantnav': 'Instant Navigations Partial Prefetch Yanıtı',
    'bench.json': 'JSON Serileştirme (10.000 nesne)',
    'bench.crypto': 'Edge Kripto İmza Doğrulama (HMAC-SHA256)',

    // API Simulator
    'api.badge': 'Next.js 16.3 API Sandbox',
    'api.title': 'Next.js 16.3 App Router API Koşucusu',
    'api.latency': 'Gecikme',
    'api.execute': 'İsteği Çalıştır',
    'api.executing': 'Çalışıyor...',
    'api.fast': '15ms (Instant)',
    'api.standard': '120ms (Standart)',
    'api.slow': '450ms (Yavaş Ağ)',
    'api.responseTab': 'Yanıt Çıktısı (JSON)',
    'api.codeTab': 'Next.js 16 Kodu',
    'api.requestLogs': 'İstek Kayıtları',

    // Counter
    'counter.badge': 'Client State Engine',
    'counter.currentVal': 'Mevcut değer',
    'counter.stepSize': 'Adım Boyutu',
    'counter.decrease': 'Azalt',
    'counter.increase': 'Artır',
    'counter.reset': 'Sıfırla',
    'counter.step': 'Adım',
    'counter.random': 'Rastgele',
    'counter.recentChanges': 'Son Değişiklikler',
    'counter.result': 'Sonuç',

    // Quick Notes
    'notes.badge': 'Not & Scratchpad Bento',
    'notes.placeholder': 'Bir deneme notu veya fikir yazın...',
    'notes.add': 'Ekle',
    'notes.tag': 'Etiket',
    'notes.searchPlaceholder': 'Notlarda ara...',
    'notes.all': 'Hepsi',
    'notes.empty': 'Henüz kaydedilmiş not bulunmuyor.',
    'notes.emptySub': 'Yukarıdaki formdan yeni bir deneme ekleyin.',
    'cat.deneme': 'Deneme',
    'cat.fikir': 'Fikir',
    'cat.todo': 'Görev',
    'cat.not': 'Not',

    // Developer Tools
    'tools.badge': 'Developer Utilities Bento',
    'tools.title': 'Geliştirici Araçları & Next.js 16.3 Yapılandırma Laboratuvarı',
    'tools.uuidTitle': 'UUID / Token Üretici',
    'tools.generateNew': 'Yeni Üret',
    'tools.uuidSub': 'RFC 4122 v4 standardında benzersiz ID',
    'tools.base64Title': 'Base64 Encoder / Decoder',
    'tools.base64Placeholder': 'Encode edilecek metin...',
    'tools.base64Sub': 'JWT & Auth header kodlama için',
    'tools.caseTitle': 'Metin Dönüştürücü',
    'tools.casePlaceholder': 'Bir metin girin...',
    'tools.jsonTitle': 'JSON Biçimlendirici & Doğrulayıcı',
    'tools.jsonFormat': 'Doğrula & Formatla',
    'tools.jsonSub': '// Formatlanmış JSON burada görüntülenecektir',
    'tools.nextConfigTitle': 'Next.js 16.3 Config (next.config.ts)',
    'tools.copy': 'Kopyala',

    // Footer
    'footer.runtime': 'Node.js 24 LTS (Krypton) • Next.js v16.3.3 (Latest) • React Compiler (Rust)',
    'footer.env': 'Ortam: Production-Preview (Latest Release)',
  },
  en: {
    // Header & Tabs
    'app.title': 'NextJS',
    'app.subtitle': 'Full-Stack Test Arena • Next.js 16.3 • Rust Turbopack Engine',
    'app.badge': 'v16.3',
    'nav.overview': 'Bento Dashboard',
    'nav.testArena': 'Test Arena',
    'nav.performanceLab': 'Performance & Security',
    'nav.apiSimulator': 'App Router & API',
    'nav.scratchpad': 'Notes & Scratchpad',
    'nav.tools': 'Developer Tools',
    'header.arenaAction': 'ARENA TESTS',
    'header.resetData': 'Reset sample data',
    'header.toggleTheme': 'Toggle Theme',
    'header.langSelect': 'Select Language',

    // Overview Hero
    'hero.badge': 'Next.js 16.3 (Latest Release) & Node.js 24 LTS',
    'hero.titleLine1': 'Test faster,',
    'hero.titleLine2': 'benchmark smarter.',
    'hero.desc': 'State-of-the-art Next.js 16.3 test suite: Instant Navigations, Rust React Compiler, Turbopack Persistent Cache, Server Actions validation, and Edge streaming.',
    'hero.enterArena': 'Enter Test Arena',
    'hero.perfLab': 'Performance Lab',
    'hero.notesCount': 'Notes',
    'hero.edgeLatency': 'Edge Latency',
    'hero.edgeRegion': 'Region: fra1 (Frankfurt) • Turbopack v16.3',
    'hero.testCoverage': 'Test Coverage',
    'hero.testModules': '6/6 Modules • 22 Assertions',
    'hero.regressionCheck': 'Regression Check',
    'hero.allPassed': 'All Passed',
    'hero.commitLog': 'Build & Commit Log',
    'hero.buildTime': 'Turbopack Build',
    'hero.seconds': 'ms (Instant)',
    'hero.turbopackHmr': 'Persistent Cache & 90% Less Memory Usage',
    'hero.apiAction': 'Simulation & API Test',
    'hero.routeRunner': 'Route & Stream Runner',
    'hero.routeRunnerDesc': 'Execute Next.js 16 Route Handlers, PPR, and Instant Navigations',

    // Test Arena
    'arena.suiteStatus': 'Suite Status',
    'arena.passed': 'Passed',
    'arena.passRate': 'Pass Rate',
    'arena.execTime': 'Execution Time',
    'arena.totalMs': 'ms total',
    'arena.turbopackActive': 'Turbopack 16.3 Persistent Cache Active',
    'arena.avgPerTest': 'Avg per test',
    'arena.assertionHealth': 'Assertion Health',
    'arena.zeroFlaky': 'Zero flaky tests detected',
    'arena.strictTs': 'TypeScript 7 + React Compiler enabled',
    'arena.suiteControls': 'Suite Controls',
    'arena.runAll': 'Run All Tests',
    'arena.running': 'Running...',
    'arena.reset': 'Reset',
    'arena.parallelThreads': 'Parallel worker threads: 8 (Rust Engine)',
    'arena.testModules': 'Test Modules',
    'arena.scenarios': 'Scenarios',
    'arena.testDetail': 'Test Details',
    'arena.runTest': 'Run Test',
    'arena.assertions': 'Assertions & Contracts',
    'arena.sourceCode': 'Source Implementation',
    'arena.runnerOutput': 'Runner Output Stream',
    'arena.tsVersion': 'TypeScript 7 / Next.js 16.3',

    // Test Cases
    'test.tc1.name': 'Instant Navigations & Partial Prefetching',
    'test.tc1.desc': 'Verifies Next.js 16.3 Instant Navigations and Partial Prefetching for zero-latency SPA-like page transitions.',
    'test.tc2.name': 'Rust React Compiler & Auto-Memoization',
    'test.tc2.desc': 'Validates automated component render optimization via Turbopack-integrated Rust React Compiler without manual useMemo.',
    'test.tc3.name': 'Server Action Revalidation Contract',
    'test.tc3.desc': 'Verifies revalidatePath() cache invalidation and immutable state transition on server mutate.',
    'test.tc4.name': 'Streaming SSR & Suspense Boundaries',
    'test.tc4.desc': 'Tests chunked Transfer-Encoding, fallback skeletons, and progressive HTML hydration timing.',
    'test.tc5.name': 'App Router Middleware Guard & Auth Headers',
    'test.tc5.desc': 'Evaluates Edge Middleware rewrite rules, cookie validation, and redirect prevention loops.',
    'test.tc6.name': 'Turbopack Persistent Cache & Memory Eviction',
    'test.tc6.desc': 'Tests 90% compiler memory eviction during long development sessions and cross-build persistent caching.',

    // Performance Lab
    'perf.badge': 'Next.js 16.3 Telemetry & Engine Audits',
    'perf.title': 'Next.js 16.3 Benchmarks & Hardening Lab',
    'perf.runAll': 'Run All Benchmarks',
    'perf.running': 'Benchmarking...',
    'perf.opsSec': 'ops / sec',
    'perf.avgLatency': 'Avg Latency',
    'perf.stressTester': 'Next.js 16 Edge Load & Stress Tester',
    'perf.stressTitle': 'Concurrent Load Test Simulator',
    'perf.fireLoad': 'Fire Load Test',
    'perf.concurrency': 'Concurrency Workers',
    'perf.workers': 'workers',
    'perf.totalReqs': 'Total Request Volume',
    'perf.requests': 'requests',
    'perf.throughput': 'Throughput',
    'perf.completed': 'Completed',
    'perf.latencyP50': 'Latency P50',
    'perf.successRate': 'Success Rate',
    'perf.securityAudit': 'Next.js 16.3 Security Hardening Checklist',
    'perf.securityTitle': 'Next.js 16.3 Production Security & CVE Patch Audit',

    // Benchmarks Items
    'bench.compiler': 'Rust React Compiler AST Transform (1,000 components)',
    'bench.turbocache': 'Turbopack Persistent Cache Hit Speed',
    'bench.instantnav': 'Instant Navigations Partial Prefetch Response',
    'bench.json': 'JSON Serialization (10,000 objects)',
    'bench.crypto': 'Edge Crypto Signature Verification (HMAC-SHA256)',

    // API Simulator
    'api.badge': 'Next.js 16.3 API Sandbox',
    'api.title': 'Next.js 16.3 App Router API Runner',
    'api.latency': 'Latency',
    'api.execute': 'Execute Request',
    'api.executing': 'Running...',
    'api.fast': '15ms (Instant)',
    'api.standard': '120ms (Standard)',
    'api.slow': '450ms (Slow Network)',
    'api.responseTab': 'Response Payload (JSON)',
    'api.codeTab': 'Next.js 16 Code',
    'api.requestLogs': 'Request Telemetry Logs',

    // Counter
    'counter.badge': 'Client State Engine',
    'counter.currentVal': 'Current value',
    'counter.stepSize': 'Step Size',
    'counter.decrease': 'Decrease',
    'counter.increase': 'Increase',
    'counter.reset': 'Reset',
    'counter.step': 'Step',
    'counter.random': 'Random',
    'counter.recentChanges': 'Recent Changes',
    'counter.result': 'Result',

    // Quick Notes
    'notes.badge': 'Notes & Scratchpad Bento',
    'notes.placeholder': 'Type a note or experimental idea...',
    'notes.add': 'Add',
    'notes.tag': 'Tag',
    'notes.searchPlaceholder': 'Search notes...',
    'notes.all': 'All',
    'notes.empty': 'No notes saved yet.',
    'notes.emptySub': 'Add a new note or experiment using the form above.',
    'cat.deneme': 'Experiment',
    'cat.fikir': 'Idea',
    'cat.todo': 'Task',
    'cat.not': 'Note',

    // Developer Tools
    'tools.badge': 'Developer Utilities Bento',
    'tools.title': 'Developer Tools & Next.js 16.3 Config Lab',
    'tools.uuidTitle': 'UUID / Token Generator',
    'tools.generateNew': 'Generate New',
    'tools.uuidSub': 'RFC 4122 v4 compliant unique identifier',
    'tools.base64Title': 'Base64 Encoder / Decoder',
    'tools.base64Placeholder': 'Text to encode/decode...',
    'tools.base64Sub': 'For JWT & Auth header encoding',
    'tools.caseTitle': 'Text Case Converter',
    'tools.casePlaceholder': 'Enter text here...',
    'tools.jsonTitle': 'JSON Formatter & Validator',
    'tools.jsonFormat': 'Validate & Format',
    'tools.jsonSub': '// Formatted JSON will appear here',
    'tools.nextConfigTitle': 'Next.js 16.3 Config (next.config.ts)',
    'tools.copy': 'Copy',

    // Footer
    'footer.runtime': 'Node.js 24 LTS (Krypton) • Next.js v16.3.3 (Latest) • React Compiler (Rust)',
    'footer.env': 'Environment: Production-Preview (Latest Release)',
  },
};

const I18nContext = createContext<I18nContextType>({
  language: 'tr',
  setLanguage: () => {},
  t: (k: string) => k,
});

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('nextjs_arena_lang');
    if (saved === 'en' || saved === 'tr') return saved;
    return 'tr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('nextjs_arena_lang', lang);
  };

  const t = (key: string): string => {
    const dict = translations[language] || translations['tr'];
    return (dict as any)[key] || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
