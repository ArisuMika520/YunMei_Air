'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { feedback } from '@/lib/utils/interactions';
import { buttonVariants } from '@/lib/animations/variants';

export default function SettingsPage() {
  const router = useRouter();

  const settingsSections = [
    {
      id: 'theme',
      title: '自定义主题',
      description: '个性化您的应用外观',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      link: '/settings/theme'
    },
    {
      id: 'side-button',
      title: '侧边快捷按钮',
      description: '选择侧边按钮的显示位置',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
      ),
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      link: '/settings/side-button'
    },
    {
      id: 'offline-test',
      title: '离线功能测试',
      description: '检查离线功能和缓存状态',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      link: '/settings/offline-test'
    }
  ];

  return (
    <div className="min-h-screen safe-top safe-bottom">
      {/* 头部导航 - 固定定位 */}
      <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-neutral-100 safe-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <motion.button
            onClick={() => {
              feedback.buttonClick();
              router.back();
            }}
            variants={buttonVariants}
            initial="idle"
            whileHover="hover"
            whileTap="tap"
            className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
          >
            <svg className="w-6 h-6 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <h1 className="text-2xl font-bold text-gradient">设置</h1>
        </div>
      </header>

      {/* 主内容 */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <div className="space-y-3">
          {settingsSections.map((section, index) => (
            <motion.button
              key={section.id}
              onClick={() => {
                feedback.buttonClick();
                router.push(section.link);
              }}
              variants={buttonVariants}
              initial="idle"
              whileHover="hover"
              whileTap="tap"
              className="w-full card p-5 text-left group"
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <div className="flex items-center gap-4">
                {/* 图标 */}
                <div className={`flex-shrink-0 w-12 h-12 ${section.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <div className={section.iconColor}>
                    {section.icon}
                  </div>
                </div>
                
                {/* 文字内容 */}
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-neutral-900 mb-1 group-hover:text-primary-600 transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-sm text-neutral-500">
                    {section.description}
                  </p>
                </div>
                
                {/* 箭头 */}
                <div className="flex-shrink-0">
                  <svg 
                    className="w-6 h-6 text-neutral-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* 使用说明 */}
        <section className="card p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 mt-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-blue-900 mb-2">💡 使用提示</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>点击上方选项进入详细设置页面</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>所有设置会自动保存到本地</span>
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
