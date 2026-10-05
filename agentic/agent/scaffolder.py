"""
agent.scaffolder — Environment & Stack Scaffolding Gate
Bootstraps instant, production-ready baselines for HTML and Next.js (TypeScript)
when target directories are empty or missing configuration files.
"""

import os
import json


def is_directory_empty(path: str) -> bool:
    """Check if directory contains any project files (ignoring .git, .gitkeep)."""
    if not os.path.isdir(path):
        return True
    items = [
        f for f in os.listdir(path)
        if f not in ('.git', '.gitkeep', '__pycache__', '.DS_Store')
    ]
    return len(items) == 0


def scaffold_html_baseline(project_root: str, task: str) -> list[str]:
    """Scaffold a modern HTML5 + Tailwind CSS starter if index.html does not exist."""
    created = []
    index_path = os.path.join(project_root, "index.html")
    
    if not os.path.exists(index_path):
        html_content = """<!DOCTYPE html>
<html lang="en" class="h-full bg-zinc-950 text-zinc-100">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tinker Prototype</title>
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <!-- Inter font -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Inter', sans-serif; }
  </style>
</head>
<body class="h-full flex items-center justify-center p-6 bg-zinc-950">
  <div id="app" class="w-full max-w-md">
    <!-- Component injected here -->
  </div>
  <script src="script.js"></script>
</body>
</html>
"""
        with open(index_path, "w", encoding="utf-8") as f:
            f.write(html_content)
        created.append("index.html")

    script_path = os.path.join(project_root, "script.js")
    if not os.path.exists(script_path):
        with open(script_path, "w", encoding="utf-8") as f:
            f.write("// Component logic\ndocument.addEventListener('DOMContentLoaded', () => {\n  console.log('App ready');\n});\n")
        created.append("script.js")

    style_path = os.path.join(project_root, "style.css")
    if not os.path.exists(style_path):
        with open(style_path, "w", encoding="utf-8") as f:
            f.write("/* Custom styles */\n")
        created.append("style.css")

    return created


def scaffold_nextjs_baseline(project_root: str, task: str) -> list[str]:
    """Scaffold a Next.js App Router with TypeScript and Tailwind CSS skeleton."""
    created = []
    
    # 1. package.json
    pkg_path = os.path.join(project_root, "package.json")
    if not os.path.exists(pkg_path):
        pkg_data = {
            "name": os.path.basename(project_root).lower(),
            "version": "0.1.0",
            "private": True,
            "scripts": {
                "dev": "next dev",
                "build": "next build",
                "start": "next start",
                "lint": "next lint"
            },
            "dependencies": {
                "react": "^18.3.1",
                "react-dom": "^18.3.1",
                "next": "^14.2.5",
                "lucide-react": "^0.400.0",
                "clsx": "^2.1.1",
                "tailwind-merge": "^2.4.0"
            },
            "devDependencies": {
                "typescript": "^5.5.3",
                "@types/node": "^20.14.9",
                "@types/react": "^18.3.3",
                "@types/react-dom": "^18.3.0",
                "postcss": "^8.4.39",
                "tailwindcss": "^3.4.4"
            }
        }
        with open(pkg_path, "w", encoding="utf-8") as f:
            json.dump(pkg_data, f, indent=2)
        created.append("package.json")

    # 2. tsconfig.json
    tsconfig_path = os.path.join(project_root, "tsconfig.json")
    if not os.path.exists(tsconfig_path):
        tsconfig_data = {
            "compilerOptions": {
                "target": "es5",
                "lib": ["dom", "dom.iterable", "esnext"],
                "allowJs": True,
                "skipLibCheck": True,
                "strict": True,
                "noEmit": True,
                "esModuleInterop": True,
                "module": "esnext",
                "moduleResolution": "bundler",
                "resolveJsonModule": True,
                "isolatedModules": True,
                "jsx": "preserve",
                "incremental": True,
                "plugins": [{"name": "next"}],
                "paths": {
                    "@/*": ["./*"]
                }
            },
            "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
            "exclude": ["node_modules"]
        }
        with open(tsconfig_path, "w", encoding="utf-8") as f:
            json.dump(tsconfig_data, f, indent=2)
        created.append("tsconfig.json")

    # 3. tailwind.config.ts
    tw_path = os.path.join(project_root, "tailwind.config.ts")
    if not os.path.exists(tw_path):
        tw_content = """import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
export default config
"""
        with open(tw_path, "w", encoding="utf-8") as f:
            f.write(tw_content)
        created.append("tailwind.config.ts")

    # 4. app/ directory and globals.css
    app_dir = os.path.join(project_root, "app")
    os.makedirs(app_dir, exist_ok=True)

    globals_css = os.path.join(app_dir, "globals.css")
    if not os.path.exists(globals_css):
        with open(globals_css, "w", encoding="utf-8") as f:
            f.write("@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nbody {\n  background-color: #09090b;\n  color: #f4f4f5;\n}\n")
        created.append("app/globals.css")

    # 5. app/layout.tsx
    layout_path = os.path.join(app_dir, "layout.tsx")
    if not os.path.exists(layout_path):
        layout_content = """import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tinker Next.js Application',
  description: 'Built with Tinker Agent',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark h-full bg-zinc-950 text-zinc-100">
      <body className="h-full antialiased">{children}</body>
    </html>
  )
}
"""
        with open(layout_path, "w", encoding="utf-8") as f:
            f.write(layout_content)
        created.append("app/layout.tsx")

    # 6. app/page.tsx
    page_path = os.path.join(app_dir, "page.tsx")
    if not os.path.exists(page_path):
        page_content = """export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-md">
        {/* Component injected here */}
      </div>
    </main>
  )
}
"""
        with open(page_path, "w", encoding="utf-8") as f:
            f.write(page_content)
        created.append("app/page.tsx")

    # 7. components/ directory
    components_dir = os.path.join(project_root, "components")
    os.makedirs(components_dir, exist_ok=True)

    return created


def ensure_stack_scaffold(project_root: str, stack: str, task: str) -> list[str]:
    """Ensures that the target project has the required baseline for the chosen stack."""
    os.makedirs(project_root, exist_ok=True)
    norm_stack = (stack or "html").lower()

    if norm_stack in ("nextjs", "next"):
        return scaffold_nextjs_baseline(project_root, task)
    else:
        # Default is modern HTML + Tailwind CDN
        return scaffold_html_baseline(project_root, task)
