/**
 * PM2 配置文件
 * 用于生产环境部署和进程管理
 */

module.exports = {
  apps: [
    {
      name: 'yunmei-air',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: './',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s',
      max_restarts: 10,
      env: {
        NODE_ENV: 'dev',
        PORT: 3000,
        HOSTNAME: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOSTNAME: '0.0.0.0',
        // 透明代理配置（必填）
        NEXT_PUBLIC_PROXY_URL: 'https://yunmei.arisumika.top/proxy',
        NEXT_PUBLIC_API_BASE_URL: 'https://base.yunmeitech.com'
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true
    }
  ]
};