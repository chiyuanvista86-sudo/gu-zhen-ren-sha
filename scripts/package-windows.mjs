import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const output = new URL('.packages/windows/', root);
const { version } = JSON.parse(readFileSync(new URL('package.json', root), 'utf8'));
mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'CULTIVATION.md', 'CULTIVATION.json']) {
  copyFileSync(new URL('dist/' + name, root), new URL(name, output));
}
for (const name of ['ART_SOURCES.md', 'ART_SOURCES.json', 'CHANGELOG.md']) {
  copyFileSync(new URL(name, root), new URL(name, output));
}
writeFileSync(new URL('Play.cmd', output), '@echo off\r\nstart "" "%~dp0index.html"\r\nexit /b\r\n');
writeFileSync(new URL('Windows-README.txt', output), `蛊道争仙 v${version} · Windows 离线版

将 ZIP 完整解压到固定文件夹，双击 Play.cmd，或用 Edge / Chrome 打开 index.html。
无需安装、无需 Node.js、无需联网。此包通过浏览器运行，不是原生 EXE 安装包。

桌面操作：
1–6：选择对应手牌；左右方向键：切换选牌；Enter：使用预览手牌。
Q / W / E / R：炼蛊 / 杀招 / 商行 / 战报。
P：暂停；Esc：关闭面板并取消选择；F：全屏（浏览器支持时）；H：快捷键帮助。
鼠标滚轮可横向浏览手牌。结束本轮使用按钮，特殊牌效在弹窗内确认。

存档保存在当前浏览器。使用同一浏览器并保留解压文件夹的位置，方便继续游戏。
离线版、在线版、APK 的进度分别保存。部分浏览器的隐私模式可能无法保留离线存档。
人物与蛊虫图片来源见 ART_SOURCES.md；仅保留蛊道争仙玩法。
`.replaceAll('\n', '\r\n'), 'utf8');
console.log(`Windows offline package staged: ${fileURLToPath(output)}`);
