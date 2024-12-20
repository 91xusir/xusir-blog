import { defineConfig } from "astro/config"; // 从"Astro/config"中导入defineConfig
import tailwind from "@astrojs/tailwind"; // 导入Tailwind CSS集成
import sitemap from "@astrojs/sitemap"; // 导入站点地图集成
import robotsTxt from "astro-robots-txt"; // 导入robots.txt文件集成
import { SITE_URL } from "./src/data/config"; // 导入站点URL

export default defineConfig({
  integrations: [tailwind(), sitemap(), robotsTxt()], // 配置集成
  site: SITE_URL, // 设置站点URL
  markdown: {
    shikiConfig: {
      theme: "dracula"
    }
  },
  build: {
    inlineStylesheets: 'auto', // 自动内联小型样式表
  }
});
