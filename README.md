# 蛊真人杀 · 升仙对决 v2.0.1

蛊真人题材的单人策略卡牌同人游戏。默认进入原创规则「升仙对决」：选择人物与配方，从一转修炼至五转，准备渡劫升仙，再以仙缘催动蛊虫与杀招，在周期灾劫与对手的压力下争取胜利。

## 游玩与下载

- 在线：https://chiyuanvista86-sudo.github.io/gu-zhen-ren-sha/
- 安卓手机 / 平板：[下载 APK](https://github.com/chiyuanvista86-sudo/gu-zhen-ren-sha/releases/latest/download/gu-zhen-ren-sha-android.apk)，需要 Android 8.0+ 及正常更新的系统 WebView。安装后可离线游玩，支持横竖屏；系统提示时允许浏览器或文件管理器「安装未知应用」。iPhone / iPad 无法安装 APK。
- 离线：在 GitHub Releases 下载 `gu-zhen-ren-sha-web.zip`，解压后双击 `index.html`。完整脚本、样式、SVG插画已内嵌。
- 仓库：https://github.com/chiyuanvista86-sudo/gu-zhen-ren-sha
- 顶部可切换「经典身份局」，保留 v1.1.0 的五人身份玩法及独立存档。

## 新模式内容

- 1v1 人机对战，双方30生命、一转、5元石和免费本命蛊开局。
- 方源、白凝冰、黑楼兰、太白云生四个人物，每人一个天赋、两个专属凡蛊、一只专属仙蛊、一项专属杀招。
- 十二种通用蛊方（九种凡蛊、三种仙蛊）、六项通用杀招，配方全部开放。每局另选五种通用蛊方与两项通用杀招。
- 四个常驻蛊位、耐久、指定敌蛊攻击、维护、升炼、拆解、主动护盾与护劫屏障。
- 每轮三个行动，交替执行，先手按轮交换；杀招由两只不同、尚未使用的蛊虫组成，参与组件本轮休眠。
- 元石每轮补给5，上限12。升到二、三、四、五转分别花费2、3、4、5元石，升转不提高补给。
- 五转花5元石宣告升仙，下一完整准备轮末承受6点地劫。成功后六转，初产2仙缘，后续每轮补给3仙缘，上限6。旧元石封存。
- 成仙后每三轮渡劫：雷、火、蚀元、风，循环增强。双方独立计数，面板公开预告。
- 账号只按完赛解锁人物，所有资源与成长在本局完成。方源、白凝冰初始开放，完成1局解锁黑楼兰，2局解锁太白云生；锁定人物可试玩。
- 自动存档、AI速度与暂停、人物托管、战报导出、规则说明、可下载的修改清单。

## 操作

点击己方空蛊位，再选择下方蛊方，点击「炼入」；选中场上蛊虫后点「催动」。默认攻击对方人物，点击敌蛊可改为拆除组件。「升转」与「宣告升仙」在行动栏操作。

杀招先花资源参悟，凑齐两只不同、尚可用的组件后发动。护盾在轮末渡劫后消散，护劫屏障跨轮保留。升仙前要准备抵挡6点地劫，也要防对手趁机拆掉护身组件。

## 设计与修改

- [CULTIVATION.md](./CULTIVATION.md)：新模式实际规则、人物/蛊虫/杀招完整清单。
- [CULTIVATION.json](./CULTIVATION.json)：结构化修改表，各项有 `requestedChanges` 字段。
- [CHANGELOG.md](./CHANGELOG.md)：本次更改与暂定数值。
- [DESIGN.md](./DESIGN.md)、[DESIGN.json](./DESIGN.json)：经典身份局的设计。

反馈可使用编号：N1–N4 人物、U01–U24 蛊虫、K01–K10 杀招。编辑说明文件不会自动修改游戏逻辑。

## 当前边界

当前为可玩的规则原型，尚未完成真人竞技平衡。使用浏览器本地档案，无登录和云同步。AI依据公开信息启发式决策，不保证最优打法。首版防御采用主动护盾，暂未实现手动响应、联网、七至九转、炼蛊随机失败或仙窍经营地图。

第18轮起天地压迫，双方逐渐损失生命；第26轮仍未结束则比较剩余生命，同血平局。经典模式仍为单人加四个AI，八个人物、十三类卡牌，规则与旧存档独立。

## 开发和构建

需要 Node.js 22 或更高版本。

```sh
npm ci
npm run dev
npm test
npm run build
npm run check
```

`dist/index.html` 是完整离线单文件；构建同时生成两种模式的 Markdown/JSON 清单。`npm run check` 包含规则测试、完整AI对局、TypeScript和离线嵌入完整性验证。

GitHub Actions 在 main 推送后测试、构建并部署 Pages，同时编译签名 APK；`v*` 标签还在断网安卓模拟器中测试开局、旋转与存档恢复，再发布 APK、离线 ZIP 和校验值。本项目独立使用仓库及工作流。

安卓工程位于 `android/`，使用 Java 17、Gradle 8.9、Android SDK 35，包名为 `io.github.chiyuanvista86.guzhenrensha`，通用 APK 不依赖特定处理器架构。先运行 `npm run build`，再运行 `gradle -p android assembleDebug`。签名发布使用 Actions Secrets `ANDROID_KEYSTORE_BASE64`（PKCS12）与 `ANDROID_KEYSTORE_PASSWORD`；本地发布还需设置 `ANDROID_KEYSTORE_FILE` 指向密钥文件。不要替换已发布的密钥，后续更新须使用相同签名并增加 `versionCode`。

安卓内置游戏由 WebViewAssetLoader 在本地 HTTPS 源加载，没有网络或存储权限。导出使用系统文件选择器；后台暂停 WebView 计时。手机和平板可各自游玩，但不会自动同步存档；网页版存档也不会自动迁入 APK。卸载会清除本机存档，后续同签名版本可直接覆盖安装。设计数据版本保持 `2.0.0`，安装包版本为 `2.0.1`。

主要源码：`src/cultivationData.ts` 为新模式数据；`src/cultivationEngine.ts` 为纯规则引擎与AI；`src/CultivationApp.tsx` 为界面；`src/cultivationStorage.ts` 为隔离存档。经典入口为 `src/LegacyApp.tsx`，旧引擎为 `src/engine.ts`。

## 作品说明

本作为非官方、非商业同人实验，与《蛊真人》原作者、出版方及三国杀官方无关联。人物、设定及名称属于相应权利人；代码与原创SVG插画由本项目独立实现，未使用官方卡面、美术或音频素材。
