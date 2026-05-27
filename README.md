# priyanshu.me

My personal website and blog built with Next.js, featuring my writing, journey, tech stack, workspace setup, and curated
bookmarks.

## ✨ Features

- **📝 Blog** - Markdown-based blog posts with beautiful styling
- **🚀 Journey** - My career timeline and experiences
- **🛠️ Stack** - Technologies and tools I use
- **💼 Workspace** - My desk setup and gear
- **🔖 Bookmarks** - Curated collection of useful links via Raindrop.io
- **📊 Analytics** - View counts and visitor tracking with Supabase
- **🎨 Modern UI** - Clean, responsive design with Tailwind CSS

## 🗂️ Project Structure

- `/` — Home page
- `/writing` — Blog listing page
- `/writing/[slug]` — Individual blog posts (markdown-based)
- `/journey` — Career timeline
- `/stack` — Tech stack and tools
- `/workspace` — Desk setup and gear
- `/bookmarks` — Bookmarks organized by category
- `/bookmarks/[slug]` — Category-specific bookmarks from Raindrop
- `/writing.xml` — RSS feed for blog posts
- `/api` — API routes

## 🚀 Running Locally

```bash
# Clone the repository
git clone https://github.com/404priyanshu/priyanshu.me.git
cd priyanshu.me

# Install dependencies
bun install

# Run development server
bun dev
```

The site will be available at `http://localhost:3000`

This project is Bun-only. Commit `bun.lockb` whenever dependencies change and do not commit npm, Yarn, or pnpm
lockfiles.

## 🔧 Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase (for view counting)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Raindrop (for bookmarks)
RAINDROP_TOKEN=your_raindrop_token

# Tinybird (optional - for analytics)
NEXT_PUBLIC_TINYBIRD_TOKEN=your_tinybird_token
```

## 📝 Adding Blog Posts

Blog posts are written in Markdown and stored in `content/writing/`:

1. Create a new `.md` file in `content/writing/`
2. Add frontmatter:

   ```markdown
   ---
   title: 'Your Post Title'
   date: '2025-11-01'
   description: 'Brief description of your post'
   ---

   # Your content here...
   ```

3. Save and the post will appear automatically!

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com)
- **Content**: Markdown files (local)
- **Bookmarks**: [Raindrop.io](https://raindrop.io)
- **Database**: [Supabase](https://supabase.com)
- **Deployment**: [Vercel](https://vercel.com)
- **Package Manager**: [Bun](https://bun.sh)

## 📦 Build for Production

```bash
# Build the production version
bun run build

# Start production server
bun start
```

## 🚢 Deployment

This project is deployed on [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables
4. Deploy!

Vercel will automatically deploy on every push to the main branch.

## 📄 License

Feel free to fork this project and make it your own! If you use this code:

- Give credit where it's due
- Don't directly copy without modifications
- Share your learnings with others

Built with inspiration from the open-source community.

## 🤝 Contributing

Found a bug or have a suggestion? Feel free to open an issue or submit a pull request!

## 📫 Contact

- Website: [priyanshu.me](https://priyanshu.me)
- GitHub: [@404priyanshu](https://github.com/404priyanshu)
- Twitter: [@404priyanshu](https://twitter.com/404priyanshu)

---

Made with ❤️ by Priyanshu Singh
