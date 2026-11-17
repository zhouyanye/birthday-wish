# 🎂 生日快乐！Happy Birthday! 🎂

这是一份特别的生日礼物，请查收！🎁

## ✨ 玩法指南

打开网页后，你可以尝试以下互动：

1.  **🕯️ 许个愿吧**：
    *   在输入框里写下你的新年愿望。
    *   点击“许好了”，准备迎接惊喜。

2.  **🌬️ 吹灭蜡烛**：
    *   对着麦克风 **轻轻吹气**，就像真的吹蜡烛一样。
    *   如果麦克风没反应，也可以点击下面的小按钮帮忙吹灭哦。

3.  **🎁 拆礼物**：
    *   愿望发送后，点击那个跳动的礼物盒。
    *   看看会有什么惊喜发生？

4.  **🪄 隐藏彩蛋**：
    *   试试用手指或鼠标在屏幕上画画？
    *   左上角可以切换 **白天/黄昏/夜晚** 模式，每个时间段都有不同的风景。
    *   右上角的音乐开关，可以控制背景音乐。
    *   音乐按钮左边是分享按钮，可以把带名字的链接直接发给对方。

---

## 🚀 部署到 GitHub Pages

这是一个纯静态页面，推到 GitHub 就能用：

1. 仓库 **Settings → Pages → Build and deployment**，Source 选 `Deploy from a branch`。
2. Branch 选 `main`，目录选 `/ (root)`，保存。
3. 等待 1~2 分钟，访问 `https://zhouyanye.github.io/birthday-wish/`。
4. 分享时可以带上名字：`https://zhouyanye.github.io/birthday-wish/?name=小明`。
5. 麦克风只在 HTTPS 下可用（GitHub Pages 默认就是 HTTPS），本地用 `file://` 打开会自动退回到“手动吹灭”按钮。

仓库里的 `.nojekyll` 用来关闭 Jekyll 处理，避免静态资源被漏掉。

如果以后绑定了自定义域名或改了仓库名，记得把 `index.html` 里的 `og:url`、`og:image` 同步改掉，否则微信/QQ 分享卡片抓不到封面。
代码更新后页面没变化，通常是 GitHub Pages 的 CDN 缓存（约 10 分钟），可以把 `index.html` 里 `css/style.css?v=`、`js/*.js?v=` 的日期改一下再提交。
百度统计的站点域名要在百度统计后台添加 `zhouyanye.github.io`，数据才会归到这个站点。

---

愿你所有的愿望都能实现！
May all your wishes come true! ✨
