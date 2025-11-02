/**
 * 图标生成脚本 - 从源图片生成所有 PWA 和 Web 图标
 * 
 * 使用方法: node scripts/generate-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 配置
const SOURCE_IMAGE = path.join(__dirname, '../public/yunmeiair.png');
const OUTPUT_DIR = path.join(__dirname, '../public');

// 图标尺寸配置
const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const MASKABLE_SIZES = [192, 512];

// 颜色配置
const BACKGROUND_COLOR = '#ffffff'; // 白色背景
const SAFE_ZONE_PADDING = 0.1; // maskable 图标的安全区域 (10%)

/**
 * 确保输出目录存在
 */
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * 生成标准图标
 * @param {number} size 图标尺寸
 */
async function generateIcon(size) {
  const outputPath = path.join(OUTPUT_DIR, `icon-${size}.png`);
  
  try {
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 } // 透明背景
      })
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log(`✓ 已生成: icon-${size}.png`);
  } catch (error) {
    console.error(`✗ 生成 icon-${size}.png 失败:`, error.message);
  }
}

/**
 * 生成 maskable 图标（带安全区域）
 * @param {number} size 图标尺寸
 */
async function generateMaskableIcon(size) {
  const outputPath = path.join(OUTPUT_DIR, `icon-maskable-${size}.png`);
  const padding = Math.floor(size * SAFE_ZONE_PADDING);
  const contentSize = size - padding * 2;
  
  try {
    // 先将源图片调整到内容区域大小
    const resizedBuffer = await sharp(SOURCE_IMAGE)
      .resize(contentSize, contentSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    // 创建带安全区域的完整图标（白色背景）
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // 白色背景
      }
    })
      .composite([{
        input: resizedBuffer,
        top: padding,
        left: padding
      }])
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log(`✓ 已生成: icon-maskable-${size}.png (含安全区域)`);
  } catch (error) {
    console.error(`✗ 生成 icon-maskable-${size}.png 失败:`, error.message);
  }
}

/**
 * 生成 favicon.ico
 */
async function generateFavicon() {
  const outputPath = path.join(OUTPUT_DIR, 'favicon.ico');
  const size = 32;
  
  try {
    // ICO 格式需要先生成 PNG，然后转换
    // 注意：sharp 不直接支持 ICO，这里生成 32x32 PNG 作为 favicon
    await sharp(SOURCE_IMAGE)
      .resize(size, size, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png({ quality: 100 })
      .toFile(outputPath.replace('.ico', '-temp.png'));
    
    // 将 PNG 重命名为 ICO (浏览器通常也支持 PNG 格式的 favicon)
    fs.renameSync(outputPath.replace('.ico', '-temp.png'), outputPath);
    
    console.log(`✓ 已生成: favicon.ico (32x32)`);
  } catch (error) {
    console.error(`✗ 生成 favicon.ico 失败:`, error.message);
  }
}

/**
 * 生成 Apple Touch Icon (带白色背景和圆角)
 */
async function generateAppleTouchIcon() {
  const outputPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
  const size = 180;
  const padding = 20; // Apple 推荐的内边距
  const contentSize = size - padding * 2;
  
  try {
    // 先将源图片调整到内容区域大小
    const resizedBuffer = await sharp(SOURCE_IMAGE)
      .resize(contentSize, contentSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    // 创建带白色背景的 Apple Touch Icon
    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // 白色背景
      }
    })
      .composite([{
        input: resizedBuffer,
        top: padding,
        left: padding
      }])
      .png({ quality: 100, compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log(`✓ 已生成: apple-touch-icon.png (180x180)`);
  } catch (error) {
    console.error(`✗ 生成 apple-touch-icon.png 失败:`, error.message);
  }
}

/**
 * 生成 OG Image (用于社交媒体分享)
 */
async function generateOGImage() {
  const outputPath = path.join(OUTPUT_DIR, 'og-image.png');
  const width = 1200;
  const height = 630;
  const logoSize = 300;
  
  try {
    // 先调整 Logo 尺寸
    const logoBuffer = await sharp(SOURCE_IMAGE)
      .resize(logoSize, logoSize, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toBuffer();
    
    // 创建 OG 图片（白色背景，居中 Logo）
    await sharp({
      create: {
        width: width,
        height: height,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 } // 白色背景
      }
    })
      .composite([{
        input: logoBuffer,
        top: Math.floor((height - logoSize) / 2),
        left: Math.floor((width - logoSize) / 2)
      }])
      .png({ quality: 95, compressionLevel: 9 })
      .toFile(outputPath);
    
    console.log(`✓ 已生成: og-image.png (1200x630)`);
  } catch (error) {
    console.error(`✗ 生成 og-image.png 失败:`, error.message);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🎨 开始生成图标...\n');
  console.log(`📂 源图片: ${SOURCE_IMAGE}`);
  console.log(`📂 输出目录: ${OUTPUT_DIR}\n`);
  
  // 检查源图片是否存在
  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`❌ 错误: 找不到源图片 ${SOURCE_IMAGE}`);
    process.exit(1);
  }
  
  // 确保输出目录存在
  ensureDirectoryExists(OUTPUT_DIR);
  
  try {
    // 获取源图片信息
    const metadata = await sharp(SOURCE_IMAGE).metadata();
    console.log(`📊 源图片信息: ${metadata.width}x${metadata.height}, 格式: ${metadata.format}\n`);
    
    // 生成标准图标
    console.log('📦 生成标准图标...');
    for (const size of ICON_SIZES) {
      await generateIcon(size);
    }
    
    console.log('\n📦 生成 Maskable 图标...');
    for (const size of MASKABLE_SIZES) {
      await generateMaskableIcon(size);
    }
    
    console.log('\n📦 生成特殊图标...');
    await generateFavicon();
    await generateAppleTouchIcon();
    await generateOGImage();
    
    console.log('\n✨ 所有图标生成完成！\n');
    
    // 显示生成的文件列表
    console.log('📋 已生成的文件:');
    const files = [
      ...ICON_SIZES.map(s => `icon-${s}.png`),
      ...MASKABLE_SIZES.map(s => `icon-maskable-${s}.png`),
      'favicon.ico',
      'apple-touch-icon.png',
      'og-image.png'
    ];
    
    files.forEach(file => {
      const filePath = path.join(OUTPUT_DIR, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        const sizeKB = (stats.size / 1024).toFixed(2);
        console.log(`  ✓ ${file} (${sizeKB} KB)`);
      }
    });
    
    console.log('\n💡 提示:');
    console.log('  1. 请检查生成的图标是否符合预期');
    console.log('  2. maskable 图标包含 10% 安全区域（白色背景）');
    console.log('  3. apple-touch-icon.png 专为 iOS 优化');
    console.log('  4. og-image.png 用于社交媒体分享预览');
    console.log('  5. 运行 npm run build 以应用新图标\n');
    
  } catch (error) {
    console.error('❌ 生成过程出错:', error);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('❌ 未捕获的错误:', error);
  process.exit(1);
});

