import vue from '@vitejs/plugin-vue'
import visualizer from 'rollup-plugin-visualizer'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { XNaiveUIResolver } from '@skit/x.naive-ui/unplugin'
import vueJsx from '@vitejs/plugin-vue-jsx'
import path from 'path'

// https://cn.vitejs.dev/config/
export default {
  plugins: [
    // Vite Vue Base
    vue(),
    vueJsx(),
    AutoImport({
      imports: [
        'vue',
        {
          'naive-ui': [
            'useDialog',
            'useMessage',
            'useNotification',
            'useLoadingBar'
          ]
        }
      ]
    }),
    Components({
      resolvers: [NaiveUiResolver(), XNaiveUIResolver()]
    }),
    // 打包结果体积分析
    {
      ...visualizer({
        filename: 'dist/report.html',
        gzipSize: true,
      }),
      apply: 'build',
    },
  ],
  resolve: {
    alias: [
      // 支持 @/xxx 的写法
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src'),
      },
    ],
  },
  server: {
    port: 81,
    host: '0.0.0.0',
    proxy: {
      // '/api': 'http://127.0.0.1:8652',
      '/api': 'http://47.97.21.184:3389',
    }
  },
  build: {
    // 不输出 brotli 压缩后的体积，提高构建速度
    // 服务端目前不支持此压缩方式
    brotliSize: false
  },
}
