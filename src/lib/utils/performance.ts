/**
 * 性能监控工具
 * 用于测量和记录关键操作的性能指标
 */

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  success: boolean;
  cached?: boolean;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100; // 最多保存100条记录

  async measure<T>(
    name: string,
    fn: () => Promise<T>,
    options?: { cached?: boolean }
  ): Promise<T> {
    const start = performance.now();
    let success = false;
    
    try {
      const result = await fn();
      success = true;
      return result;
    } catch (error) {
      success = false;
      throw error;
    } finally {
      const duration = performance.now() - start;
      
      this.recordMetric({
        name,
        duration,
        timestamp: Date.now(),
        success,
        cached: options?.cached
      });
      
      const cacheInfo = options?.cached ? ' [缓存]' : '';
      const statusEmoji = success ? '✅' : '❌';
      console.log(
        `[性能] ${statusEmoji} ${name}${cacheInfo}: ${duration.toFixed(2)}ms`
      );
    }
  }


  private recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }


  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }


  getAverageTime(name: string): number | null {
    const filteredMetrics = this.metrics.filter(m => m.name === name && m.success);
    
    if (filteredMetrics.length === 0) return null;
    
    const total = filteredMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / filteredMetrics.length;
  }


  getStats(name?: string) {
    const filteredMetrics = name 
      ? this.metrics.filter(m => m.name === name)
      : this.metrics;
    
    if (filteredMetrics.length === 0) {
      return {
        count: 0,
        successCount: 0,
        failCount: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        cachedCount: 0
      };
    }
    
    const successMetrics = filteredMetrics.filter(m => m.success);
    const durations = successMetrics.map(m => m.duration);
    
    return {
      count: filteredMetrics.length,
      successCount: successMetrics.length,
      failCount: filteredMetrics.length - successMetrics.length,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      cachedCount: filteredMetrics.filter(m => m.cached).length
    };
  }


  printReport(name?: string) {
    const stats = this.getStats(name);
    const title = name ? `性能报告 - ${name}` : '性能报告 - 全部';
    
    console.group(`${title}`);
    console.log(`总次数: ${stats.count}`);
    console.log(`成功次数: ${stats.successCount}`);
    console.log(`失败次数: ${stats.failCount}`);
    console.log(`平均耗时: ${stats.averageDuration.toFixed(2)}ms`);
    console.log(`最快耗时: ${stats.minDuration.toFixed(2)}ms`);
    console.log(`最慢耗时: ${stats.maxDuration.toFixed(2)}ms`);
    console.log(`使用缓存次数: ${stats.cachedCount}`);
    console.groupEnd();
  }


  clear() {
    this.metrics = [];
    console.log('[性能] 已清除所有性能记录');
  }


  export(): string {
    return JSON.stringify(this.metrics, null, 2);
  }
}

export const performanceMonitor = new PerformanceMonitor();


export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T>,
  options?: { cached?: boolean }
): Promise<T> {
  return performanceMonitor.measure(name, fn, options);
}

export function usePerformance() {
  return {
    measure: measurePerformance,
    getStats: (name?: string) => performanceMonitor.getStats(name),
    printReport: (name?: string) => performanceMonitor.printReport(name),
    clear: () => performanceMonitor.clear()
  };
}


export function getPageLoadMetrics() {
  if (typeof window === 'undefined') return null;
  
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  if (!navigation) return null;
  
  return {
    dnsTime: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcpTime: navigation.connectEnd - navigation.connectStart,
    requestTime: navigation.responseStart - navigation.requestStart,
    responseTime: navigation.responseEnd - navigation.responseStart,
    domParseTime: navigation.domInteractive - navigation.responseEnd,
    resourceLoadTime: navigation.loadEventStart - navigation.domContentLoadedEventEnd,
    totalTime: navigation.loadEventEnd - navigation.fetchStart,
    fcp: getFirstContentfulPaint(),
    lcp: getLargestContentfulPaint()
  };
}


function getFirstContentfulPaint(): number | null {
  if (typeof window === 'undefined') return null;
  
  const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
  return fcpEntry ? fcpEntry.startTime : null;
}


function getLargestContentfulPaint(): number | null {
  if (typeof window === 'undefined') return null;
  
  const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
  if (lcpEntries.length === 0) return null;
  
  const lastEntry = lcpEntries[lcpEntries.length - 1] as any;
  return lastEntry ? lastEntry.renderTime || lastEntry.loadTime : null;
}


export function printPageLoadReport() {
  const metrics = getPageLoadMetrics();
  
  if (!metrics) {
    console.log('[性能] 页面加载指标不可用');
    return;
  }
  
  console.group('页面加载性能报告');
  console.log(`DNS 查询: ${metrics.dnsTime.toFixed(2)}ms`);
  console.log(`TCP 连接: ${metrics.tcpTime.toFixed(2)}ms`);
  console.log(`请求时间: ${metrics.requestTime.toFixed(2)}ms`);
  console.log(`响应时间: ${metrics.responseTime.toFixed(2)}ms`);
  console.log(`DOM 解析: ${metrics.domParseTime.toFixed(2)}ms`);
  console.log(`资源加载: ${metrics.resourceLoadTime.toFixed(2)}ms`);
  console.log(`总加载时间: ${metrics.totalTime.toFixed(2)}ms`);
  if (metrics.fcp) console.log(`FCP: ${metrics.fcp.toFixed(2)}ms`);
  if (metrics.lcp) console.log(`LCP: ${metrics.lcp.toFixed(2)}ms`);
  console.groupEnd();
}

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      printPageLoadReport();
    }, 1000);
  });
}

