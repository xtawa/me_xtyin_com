# Minimalist Personal Home / 极简个人主页

A minimalist personal homepage inspired by [antfu.me](https://antfu.me). It features a clean dark mode design, a dynamic "Mac-style" blog window, and a scrolling photo wall. Content is managed dynamically via Notion.

这是一个灵感来自 [antfu.me](https://antfu.me) 的极简个人主页。它具有干净的深色模式设计、动态的“Mac风格”博客窗口以及滚动照片墙。内容通过 Notion 动态管理。

---

## ⚙️ Notion Configuration / Notion 配置

To make the dynamic content work, you need to set up a Notion Database and connect it to this project.
为了让动态内容生效，你需要设置一个 Notion 数据库并将其连接到本项目。

### 1. Create a Notion Integration / 创建 Notion 集成
1. Go to [My Integrations](https://www.notion.so/my-integrations). / 访问 [我的集成](https://www.notion.so/my-integrations)。
2. Click **New integration**. / 点击 **New integration**。
3. Name it (e.g., "Personal Site") and submit. / 命名（例如 "Personal Site"）并提交。
4. Copy the **Internal Integration Secret** (starts with `secret_...`). / 复制 **Internal Integration Secret**（以 `secret_` 开头）。

### 2. Setup the Database / 设置数据库
1. Create a new Page in Notion and create a **Table Database** inside it (`/table`). / 在 Notion 中新建一个页面，并在其中创建一个 **表格数据库** (`/table`)。
2. **Important**: You must configure the columns exactly as follows: / **重要**：你需要严格按照以下方式配置列：
   - **Column 1 Name**: `Key` (Type: `Title` / 标题)
   - **Column 2 Name**: `Value` (Type: `Text` or `Rich Text` / 文本或富文本)
3. Add the following rows to the database: / 在数据库中添加以下行：

| Key (Title) | Value (Text) | Description / 说明 |
| :--- | :--- | :--- |
| `name` | Your Name | Displayed in the main title. / 显示在主标题。 |
| `headline` | Your Headline | Displayed below the title. / 显示在标题下方。 |
| `myself` | `<p>HTML content...</p>` | Your bio. Supports HTML tags like `<a>`, `<b>`, `<p>`. / 个人简介。支持 HTML 标签。 |
| `blog_url` | `https://yourblog.com` | The URL loaded in the "Blog" window. / "Blog" 窗口加载的链接。 |

### 3. Connect Database / 连接数据库
1. Open your new Database page. / 打开你的新数据库页面。
2. Click the `...` (three dots) at the top right corner. / 点击右上角的 `...`（三点菜单）。
3. Select **Connect to** (or "Add connections") and choose the Integration you created in Step 1. / 选择 **Connect to**（或 "Add connections"），选择第一步创建的集成。
4. Copy the **Database ID** from the URL. / 从 URL 中复制 **Database ID**。
   - URL format: `https://www.notion.so/myworkspace/{DATABASE_ID}?v=...`
   - It is the 32-character string before the `?`. / 它是 `?` 之前的 32 位字符串。

---

## 🚀 Environment Variables / 环境变量

When deploying to Vercel or Netlify, add the following Environment Variables in the project settings:
部署到 Vercel 或 Netlify 时，请在项目设置中添加以下环境变量：

- `NOTION_TOKEN`: Your Integration Secret (from Step 1) / 你的集成 Secret
- `NOTION_DATABASE_ID`: Your Database ID (from Step 3) / 你的数据库 ID

---

## 📸 Photo Wall Configuration / 照片墙配置

To populate the "Photos" tab:
填充“Photos”标签页：

1. Create a folder named `photos` inside the `public` directory. / 在 `public` 目录下创建一个名为 `photos` 的文件夹。
2. Place your images (`.jpg`, `.png`, `.webp`) inside `public/photos/`. / 将你的图片（`.jpg`, `.png`, `.webp`）放入 `public/photos/` 中。
3. The app will automatically scan this folder and create the scrolling effect. / 程序会自动扫描该文件夹并生成滚动效果。

---

## 💻 Local Development / 本地开发

This project uses **Vite** for fast development and building.

1. Clone the repo. / 克隆仓库。
2. Install dependencies: / 安装依赖：
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory: / 在根目录创建 `.env` 文件：
   ```env
   NOTION_TOKEN=secret_your_token_here
   NOTION_DATABASE_ID=your_database_id_here
   ```
4. Start the dev server: / 启动服务器：
   ```bash
   npm run dev
   ```
5. Build for production: / 构建生产版本：
   ```bash
   npm run build
   ```
