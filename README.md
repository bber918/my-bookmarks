# 📚 我的收藏面板

一个简洁美观的个人收藏链接管理面板，记录并展示你收藏的每一篇好文。

## 功能

- 🏠 **收藏面板** — 以卡片网格展示所有收藏链接
- 🔍 **搜索** — 实时搜索过滤收藏内容
- 🏷️ **分类过滤** — 技术 / 生活 / 设计 / 其他
- ➕ **快捷添加** — 右下角 FAB 按钮打开添加面板
- 📋 **JSON 导出** — 添加时可直接生成 JSON 代码，方便提交到仓库
- 📱 **响应式** — 桌面和移动端均可使用

## 如何添加收藏

### 方式一：通过页面添加（推荐调试）

1. 打开 `https://你的用户名.github.io/bookmark-site/`
2. 点击右下角的 **+** 按钮
3. 填写 URL、标题、简介、分类等信息
4. 点击「生成 JSON 代码」复制结果
5. 或直接在页面点击「添加收藏」（刷新后会丢失——仅用于预览）

### 方式二：直接编辑 bookmarks.json

编辑 `bookmarks.json` 文件，在 `bookmarks` 数组中添加新条目：

```json
{
  "url": "https://example.com/article",
  "title": "文章标题",
  "desc": "简短描述",
  "category": "tech",
  "source": "来源名称",
  "date": "2024-01-15"
}
```

**分类可选值：** `tech`（技术）, `life`（生活）, `design`（设计）, `other`（其他）

### 方式三：提 PR / Issue

Fork 本仓库 → 编辑 `bookmarks.json` → 提交 Pull Request。

## 本地开发

```bash
# 使用任意 HTTP 服务器预览
npx serve .
# 或
python -m http.server 8080
```

## 部署

### GitHub Pages

1. 在仓库 Settings → Pages 中，将 Source 设为 `main` 分支的根目录
2. 访问 `https://你的用户名.github.io/bookmark-site/`

## 快速推送（在本地执行）

如果你在本地已经有这个项目，可以一键推送到 GitHub：

```bash
# 设置你的 GitHub 信息
GITHUB_USER="你的用户名"
TOKEN="你的 GitHub Token"

# 创建仓库并推送（使用 curl）
curl -s -X POST -H "Authorization: token $TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/user/repos \
  -d '{"name":"my-bookmarks","description":"📚 个人收藏面板","private":false}'

# 推送代码
git remote add origin https://$TOKEN@github.com/$GITHUB_USER/my-bookmarks.git
git branch -M main
git push -u origin main
```

---

✨ Happy Collecting!
