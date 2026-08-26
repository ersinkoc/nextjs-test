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
    'app.subtitle': 'Full-Stack Test Arenası • Bento Mimarisi • JIT Engine',
    'app.badge': 'v15.2',
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
    'hero.badge': 'Next.js 15 Full-Stack Test Arenası',
    'hero.titleLine1': 'Test faster,',
    'hero.titleLine2': 'benchmark smarter.',
    'hero.desc': 'Kapsamlı Next.js 15 test arenası: Server Actions doğrulaması, Edge streaming senaryoları, JIT performans ölçümleri ve güvenlik denetimleri tek çatı altında.',
    'hero.enterArena': 'Test Arenasına Gir',
    'hero.perfLab': 'Performans Lab',
    'hero.notesCount': 'Notlar',
    'hero.edgeLatency': 'Edge Latency',
    'hero.edgeRegion': 'Bölge: fra1 (Frankfurt) • Edge Engine',
    'hero.testCoverage': 'Test Kapsamı',
    'hero.testModules': '5/5 Modül • 17 Assertion',
    'hero.regressionCheck': 'Regresyon Kontrolü',
    'hero.allPassed': 'Tümü Geçti',
    'hero.commitLog': 'Build & Commit Günlüğü',
    'hero.buildTime': 'Build Süresi',
    'hero.seconds': 'saniye',
    'hero.turbopackHmr': 'Turbopack artımsal derleme',
    'hero.apiAction': 'Simülasyon & API Test',
    'hero.routeRunner': 'Route & Stream Koşucusu',
    'hero.routeRunnerDesc': "Route Handlers ve Server Actions'ı test edin",

    // Test Arena
    'arena.suiteStatus': 'Suite Durumu',
    'arena.passed': 'Geçti',
    'arena.passRate': 'Başarı Oranı',
    'arena.execTime': 'Yürütme Süresi',
    'arena.totalMs': 'ms toplam',
    'arena.turbopackActive': 'Turbopack JIT derleme aktif',
    'arena.avgPerTest': 'Test başına ortalama',
    'arena.assertionHealth': 'Assertion Sağlığı',
    'arena.zeroFlaky': 'Sıfır kararsız (flaky) test',
    'arena.strictTs': 'Katı TypeScript tip kontrolleri etkin',
    'arena.suiteControls': 'Suite Kontrolleri',
    'arena.runAll': 'Tüm Testleri Koş (Run All)',
    'arena.running': 'Koşuyor...',
    'arena.reset': 'Sıfırla (Reset)',
    'arena.parallelThreads': 'Paralel iş parçacıkları (Workers): 4',
    'arena.testModules': 'Test Modülleri',
    'arena.scenarios': 'Senaryo',
    'arena.testDetail': 'Test Detayı',
    'arena.runTest': 'Testi Başlat',
    'arena.assertions': 'Doğrulama Kriterleri (Assertions)',
    'arena.sourceCode': 'Kaynak Kodu (Source Implementation)',
    'arena.runnerOutput': 'Runner Çıktı Akışı (Live Stream)',
    'arena.tsVersion': 'TypeScript 5.8 / Next 15',

    // Test Cases
    'test.tc1.name': 'Server Action Revalidation Sözleşmesi',
    'test.tc1.desc': 'revalidatePath() önbellek geçersiz kılma ve sunucu mutasyonunda değişmez durum geçişini doğrular.',
    'test.tc2.name': 'Streaming SSR & Suspense Sınırları',
    'test.tc2.desc': 'Parçalı Transfer-Encoding, yedek iskeletler ve aşamalı HTML hidrasyon zamanlamasını test eder.',
    'test.tc3.name': 'App Router Middleware Koruması & Auth Başlıkları',
    'test.tc3.desc': 'Edge Middleware yeniden yazma kurallarını, çerez doğrulamasını ve yönlendirme döngülerini test eder.',
    'test.tc4.name': 'Hydration Uyuşmazlığı & DOM Tutarlılığı',
    'test.tc4.desc': 'Hidrasyon hatalarını (Error #418) önlemek için istemci tarih biçimlendiricileri ile sunucu zaman damgalarını simüle eder.',
    'test.tc5.name': 'Turbopack Artımsal HMR & Cache Tagging',
    'test.tc5.desc': 'Önbellek etiketi yeniden doğrulaması: etiket tabanlı isteğe bağlı önbellek temizleme (unstable_cache).',

    // Performance Lab
    'perf.badge': 'Performance & Security Telemetry',
    'perf.title': 'Next.js Engine Benchmarks & Audit Lab',
    'perf.runAll': 'Tüm Benchmarkları Çalıştır',
    'perf.running': 'Benchmark Koşuluyor...',
    'perf.opsSec': 'ops / sn',
    'perf.avgLatency': 'Ortalama Gecikme',
    'perf.stressTester': 'Next.js Edge Load & Stress Tester',
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
    'perf.securityAudit': 'Security Hardening Checklist',
    'perf.securityTitle': 'Next.js 15 Üretim Güvenlik Denetimi',

    // Benchmarks Items
    'bench.json': 'JSON Serileştirme (10.000 nesne)',
    'bench.vdom': 'React Sanal DOM Uzlaştırma (500 düğüm)',
    'bench.middleware': 'App Router Middleware Başlık Çözümleme',
    'bench.crypto': 'Edge Kripto İmza Doğrulama (HMAC-SHA256)',

    // API Simulator
    'api.badge': 'Route Handler & Server Action Sandbox',
    'api.title': 'Next.js App Router API Koşucusu',
    'api.latency': 'Gecikme',
    'api.execute': 'İsteği Çalıştır',
    'api.executing': 'Çalışıyor...',
    'api.fast': '50ms (Hızlı)',
    'api.standard': '300ms (Standart)',
    'api.slow': '800ms (Yavaş 3G)',
    'api.responseTab': 'Yanıt Çıktısı (JSON)',
    'api.codeTab': 'Next.js Kodu',
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
    'tools.title': 'Geliştirici Araçları & Next.js Yapılandırma Laboratuvarı',
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
    'tools.nextConfigTitle': 'Next.js 15 Config Üretici',
    'tools.copy': 'Kopyala',

    // Footer
    'footer.runtime': 'Node.js 22 LTS (Active) • Next.js v15.2.0 • React 19',
    'footer.env': 'Ortam: Production-Preview',
  },
  en: {
    // Header & Tabs
    'app.title': 'NextJS',
    'app.subtitle': 'Full-Stack Test Arena • Bento Architecture • JIT Engine',
    'app.badge': 'v15.2',
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
    'hero.badge': 'Next.js 15 Full-Stack Test Arena',
    'hero.titleLine1': 'Test faster,',
    'hero.titleLine2': 'benchmark smarter.',
    'hero.desc': 'A comprehensive Next.js 15 test suite: Server Actions validation, Edge streaming scenarios, JIT performance metrics, and security audits under one unified sandbox.',
    'hero.enterArena': 'Enter Test Arena',
    'hero.perfLab': 'Performance Lab',
    'hero.notesCount': 'Notes',
    'hero.edgeLatency': 'Edge Latency',
    'hero.edgeRegion': 'Region: fra1 (Frankfurt) • Edge Engine',
    'hero.testCoverage': 'Test Coverage',
    'hero.testModules': '5/5 Modules • 17 Assertions',
    'hero.regressionCheck': 'Regression Check',
    'hero.allPassed': 'All Passed',
    'hero.commitLog': 'Build & Commit Log',
    'hero.buildTime': 'Build Duration',
    'hero.seconds': 'seconds',
    'hero.turbopackHmr': 'Turbopack incremental build',
    'hero.apiAction': 'Simulation & API Test',
    'hero.routeRunner': 'Route & Stream Runner',
    'hero.routeRunnerDesc': 'Execute and test Route Handlers and Server Actions',

    // Test Arena
    'arena.suiteStatus': 'Suite Status',
    'arena.passed': 'Passed',
    'arena.passRate': 'Pass Rate',
    'arena.execTime': 'Execution Time',
    'arena.totalMs': 'ms total',
    'arena.turbopackActive': 'Turbopack JIT compilation active',
    'arena.avgPerTest': 'Avg per test',
    'arena.assertionHealth': 'Assertion Health',
    'arena.zeroFlaky': 'Zero flaky tests detected',
    'arena.strictTs': 'Strict TypeScript type safety enabled',
    'arena.suiteControls': 'Suite Controls',
    'arena.runAll': 'Run All Tests',
    'arena.running': 'Running...',
    'arena.reset': 'Reset',
    'arena.parallelThreads': 'Parallel worker threads: 4',
    'arena.testModules': 'Test Modules',
    'arena.scenarios': 'Scenarios',
    'arena.testDetail': 'Test Details',
    'arena.runTest': 'Run Test',
    'arena.assertions': 'Assertions & Contracts',
    'arena.sourceCode': 'Source Implementation',
    'arena.runnerOutput': 'Runner Output Stream',
    'arena.tsVersion': 'TypeScript 5.8 / Next 15',

    // Test Cases
    'test.tc1.name': 'Server Action Revalidation Contract',
    'test.tc1.desc': 'Verifies revalidatePath() cache invalidation and immutable state transition on server mutate.',
    'test.tc2.name': 'Streaming SSR & Suspense Boundaries',
    'test.tc2.desc': 'Tests chunked Transfer-Encoding, fallback skeletons, and progressive HTML hydration timing.',
    'test.tc3.name': 'App Router Middleware Guard & Auth Headers',
    'test.tc3.desc': 'Evaluates Edge Middleware rewrite rules, cookie validation, and redirect prevention loops.',
    'test.tc4.name': 'Hydration Mismatch & DOM Consistency',
    'test.tc4.desc': 'Simulates client-side date formatters vs server timestamps to prevent hydration errors (Error #418).',
    'test.tc5.name': 'Turbopack Incremental HMR & Cache Tagging',
    'test.tc5.desc': 'Tests cache-tag revalidation: unstable_cache with tag-based on-demand purge.',

    // Performance Lab
    'perf.badge': 'Performance & Security Telemetry',
    'perf.title': 'Next.js Engine Benchmarks & Audit Lab',
    'perf.runAll': 'Run All Benchmarks',
    'perf.running': 'Benchmarking...',
    'perf.opsSec': 'ops / sec',
    'perf.avgLatency': 'Avg Latency',
    'perf.stressTester': 'Next.js Edge Load & Stress Tester',
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
    'perf.securityAudit': 'Security Hardening Checklist',
    'perf.securityTitle': 'Next.js 15 Production Security Audit',

    // Benchmarks Items
    'bench.json': 'JSON Serialization (10,000 objects)',
    'bench.vdom': 'React Virtual DOM Re-conciliation (500 nodes)',
    'bench.middleware': 'App Router Middleware Header Resolution',
    'bench.crypto': 'Edge Crypto Signature Verification (HMAC-SHA256)',

    // API Simulator
    'api.badge': 'Route Handler & Server Action Sandbox',
    'api.title': 'Next.js App Router API Runner',
    'api.latency': 'Latency',
    'api.execute': 'Execute Request',
    'api.executing': 'Running...',
    'api.fast': '50ms (Fast)',
    'api.standard': '300ms (Standard)',
    'api.slow': '800ms (Slow 3G)',
    'api.responseTab': 'Response Payload (JSON)',
    'api.codeTab': 'Next.js Code',
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
    'tools.title': 'Developer Tools & Next.js Config Lab',
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
    'tools.nextConfigTitle': 'Next.js 15 Config Generator',
    'tools.copy': 'Copy',

    // Footer
    'footer.runtime': 'Node.js 22 LTS (Active) • Next.js v15.2.0 • React 19',
    'footer.env': 'Environment: Production-Preview',
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
    return 'tr'; // Default to Turkish or can toggle to English
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
