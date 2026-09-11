# 部署到 GitHub Pages

本项目是**零构建的纯静态站点**（`index.html` + `styles.css` + `app.js`），
不需要 `npm install`、不需要打包，仓库根目录就是网站根目录。

- **线上地址**：https://trickabe.github.io/qingcai/
- **仓库地址**：https://github.com/Trickabe/qingcai
- **发布内容**：仓库根目录整体（由 `.github/workflows/deploy-pages.yml` 自动发布）

---

## 一、为什么用独立仓库

你的 `trickabe.github.io` 根路径已经被博客占用，`/FinanceTest` 是另一个 Vite 项目。
GitHub Pages 的**项目站点**规则是 `https://<用户名>.github.io/<仓库名>/`，
所以新建一个 `qingcai` 仓库，本 demo 就会落在 `/qingcai/`，与博客和 FinanceTest 互不影响。

项目内所有资源引用都是**相对路径**（`styles.css`、`app.js`），
hash 路由（`#dashboard`、`#assets` 等）只改变地址片段、不发起新的文档请求，
因此在子路径下可以直接运行，无需配置 `base`。

---

## 二、推送步骤（在你的本机终端执行）

在**有网络**的 PowerShell 里执行。仓库已经在本地初始化完成并完成了首次提交，所以只需配置远端并推送。

```powershell
cd "C:\Users\adminstration\Documents\ChatGPT\工行杯"

# 1. 关联远端
git remote add origin https://github.com/Trickabe/qingcai.git

# 2. 推送 main 分支
git push -u origin main
```

> 若提示 `remote origin already exists`，改用：
> ```powershell
> git remote set-url origin https://github.com/Trickabe/qingcai.git
> ```

### 关于认证

推送时会要求登录。**GitHub 早已不允许用账号密码推送**，请用下面任一方式：

- **浏览器登录（推荐）**：Windows 上 git 会弹出 Git Credential Manager 窗口，
  点 `Sign in with your browser` 授权一次，之后自动记住。
- **个人访问令牌（PAT）**：
  到 https://github.com/settings/tokens 生成一个 **classic token**，勾选 **`repo`** 权限。
  当 git 询问密码时，**粘贴令牌**而不是账号密码（用户名填 `Trickabe`）。
- **SSH**：如果你已配置 SSH key：
  ```powershell
  git remote set-url origin git@github.com:Trickabe/qingcai.git
  git push -u origin main
  ```

---

## 三、在 GitHub 上开启 Pages

推送完成后，仓库里已经有 workflow 文件，但还需要手动打开开关（只需做一次）：

1. 打开 https://github.com/Trickabe/qingcai/settings/pages
2. 找到 **Build and deployment** → **Source**
3. 选择 **GitHub Actions**（不要选 "Deploy from a branch"）
4. 保存

### 触发首次部署

推送时如果 Pages 还没开启，那次 workflow 会失败，属正常现象。
开启 Source 之后，到 https://github.com/Trickabe/qingcai/actions
找到 **Deploy static site to GitHub Pages**，点右上角 **Run workflow** 手动跑一次。

等它变成绿色 ✓（通常 30～60 秒），访问：

**https://trickabe.github.io/qingcai/**

> 首次开启后可能需要 1～2 分钟才会生效，属 CDN 缓存延迟。

---

## 四、以后如何更新

改完代码，直接提交并推送，Pages 会自动重新部署（约 1 分钟）：

```powershell
git add -A
git commit -m "更新说明"
git push
```

不需要本地构建，也不需要 `gh-pages` 分支。

---

## 五、本地预览

### 纯静态预览（与线上完全一致的行为）

直接双击 `index.html` 即可。数据全部是浏览器内的 Mock 数据。

### 带本机后端联调

```powershell
node dev-server.js
```

打开 http://127.0.0.1:4173 。开发服务器会把 `/backend/*` 转发到 `https://localhost:7285`。

> `app.js` 已做环境判断：**只有在 `localhost` / `127.0.0.1` 访问时才启用后端代理**，
> 部署到 GitHub Pages 后自动保持纯 Mock 模式，
> 避免线上向不存在的 `/backend` 发请求产生 404 与报错提示。

---

## 六、故障排查

| 现象 | 原因与处理 |
| --- | --- |
| 打开是 404 | Pages 还没构建完，或地址漏了结尾斜杠。等 1～2 分钟再试 |
| 页面无样式、控制台报 `styles.css` 404 | 说明资源被写成了绝对路径 `/styles.css`。本项目用的是相对路径，若手动改过请改回相对路径 |
| Actions 显示失败 `Get Pages site failed` | Source 没设成 **GitHub Actions**，回到第三节第 3 步 |
| Actions 显示 `Pages is disabled` | 同上，先在 Settings → Pages 里启用 |
| 页面能开但图表空白 | ECharts 从 CDN 加载（`cdn.jsdelivr.net`），网络不通时会静默跳过，其余界面不受影响 |
| 演示时看到"连接账户"报错 | 线上不会向后端发请求；该按钮在线上会提示未连接后端，属预期行为 |
