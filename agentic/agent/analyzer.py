"""
agent.analyzer — Dynamic LLM Architect & Specification Engine
Performs real codebase perception, scans disk file trees, and leverages
an LLM Architect prompt to synthesize bespoke, production-grade technical
blueprints for any prompt (invoices, kanban, dashboards, forms, etc.).
"""

import os
import json
import re
from dataclasses import dataclass, field
from typing import Optional, Any


@dataclass
class TaskAnalysis:
    """Structured breakdown of user task into an actionable plan."""
    original_task: str
    task_type: str                  # 'create', 'modify', 'fix'
    stack: str                      # 'html' or 'nextjs'
    goal: str
    checklist: list[str]
    ui_elements_required: list[str]
    files_to_touch: list[str]
    verification_criteria: list[str]
    domain_state: list[str] = field(default_factory=list)

    def format_plan_markdown(self) -> str:
        """Format the analysis into clean Claude/ChatGPT-style Markdown."""
        lines = [
            f"# Execution Plan: {self.goal}",
            f"**Stack:** {self.stack.upper()} | **Mode:** {self.task_type.upper()}",
            "",
            "## 📋 Implementation Checklist",
        ]
        for item in self.checklist:
            lines.append(f"- [ ] {item}")

        if self.domain_state:
            lines.append("")
            lines.append("## 📊 Domain Model & State")
            for st in self.domain_state:
                lines.append(f"- • `{st}`")

        if self.ui_elements_required:
            lines.append("")
            lines.append("## 🎨 Visual & DOM Requirements")
            for elem in self.ui_elements_required:
                lines.append(f"- • `{elem}`")

        lines.append("")
        lines.append("## ✅ Verification Checklist")
        for crit in self.verification_criteria:
            lines.append(f"- [ ] {crit}")
        lines.append("")

        return "\n".join(lines)


def scan_project_context(project_root: str, max_depth: int = 3) -> dict:
    """
    Perceive the real codebase structure on disk.
    Returns file tree, existing file paths, and key file snippets.
    """
    if not os.path.isdir(project_root):
        return {"tree": [], "files": [], "key_content": {}}

    ignored = {'.git', '.gitkeep', '__pycache__', 'node_modules', '.next', 'dist', '.cache'}
    file_tree = []
    file_list = []
    key_content = {}

    for root, dirs, files in os.walk(project_root):
        dirs[:] = [d for d in dirs if d not in ignored]
        rel_root = os.path.relpath(root, project_root).replace("\\", "/")
        depth = 0 if rel_root == "." else len(rel_root.split("/"))
        if depth >= max_depth:
            continue

        for f in files:
            if f in ignored:
                continue
            rel_file = f if rel_root == "." else f"{rel_root}/{f}"
            file_list.append(rel_file)
            file_tree.append(rel_file)

            # Read head of key files to help the Architect see existing structure
            if f in ("index.html", "package.json", "page.tsx", "layout.tsx", "script.js") and len(key_content) < 3:
                full_p = os.path.join(root, f)
                try:
                    with open(full_p, "r", encoding="utf-8", errors="replace") as fp:
                        lines = [fp.readline() for _ in range(30)]
                        key_content[rel_file] = "".join(lines).strip()
                except Exception:
                    pass

    file_list.sort()
    return {
        "tree": file_tree,
        "files": file_list,
        "key_content": key_content,
    }


ARCHITECT_SYSTEM_PROMPT = """You are a Principal Software Architect & Technical Lead.
Your responsibility is to analyze the user's task and existing codebase to synthesize a production-grade, bespoke implementation blueprint.

You MUST respond strictly with a valid JSON object (enclosed in ```json ... ``` or as pure JSON) matching this schema:
{
  "goal": "Concise technical goal statement",
  "task_type": "create" | "modify" | "fix",
  "domain_state": ["Key state variables, reactive models, formulas, or data structures needed"],
  "visual_components": ["Exact DOM elements, UI components, selectors, or layout containers required"],
  "files_to_touch": ["Exact file paths to create or modify"],
  "checklist": ["Actionable, ordered step-by-step implementation tasks"],
  "verification_criteria": ["Clear conditions to verify completion on screen and in code"]
}

STRICT ARCHITECTURAL DIRECTIVES:
1. NEVER guess or use generic placeholder text. Tailor the domain state, components, and formulas specifically to the user's domain (e.g. invoices have line items, rates, taxes, totals; kanban has columns, cards, drag events; login has forms, fields, state).
2. If modifying existing files, inspect the existing code provided and integrate seamlessly.
3. For HTML stack, target index.html, style.css, script.js.
4. For Next.js stack, target app/page.tsx, app/layout.tsx, app/globals.css with TypeScript and 'use client' where appropriate.
5. Return ONLY valid JSON.
"""


def _clean_json_response(raw_text: str) -> dict:
    """Extract and parse JSON from model response text safely."""
    text = raw_text.strip()
    # Try finding markdown json fence
    fence_match = re.search(r'```(?:json)?\s*([\s\S]*?)\s*```', text)
    if fence_match:
        text = fence_match.group(1).strip()

    # Find outermost curly braces
    first_brace = text.find('{')
    last_brace = text.rfind('}')
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        text = text[first_brace:last_brace + 1]

    return json.loads(text)


def analyze_task_intent(
    task: str,
    project_root: str,
    stack: str = "html",
    is_draft: bool = False,
    model: Optional[Any] = None
) -> TaskAnalysis:
    """
    Synthesize a rich specification using real codebase perception and the LLM Architect.
    Works dynamically for ANY prompt without brittle keyword matching.
    """
    clean_task = task.strip()
    norm_stack = "nextjs" if stack in ("nextjs", "next", "react") else "html"
    context = scan_project_context(project_root)

    # ── Stage 1: Dynamic LLM Architect Call (Production Path) ───────────────────
    if model is not None:
        try:
            user_content = [
                f"Target Stack: {norm_stack.upper()}",
                f"Existing Project Files: {json.dumps(context['files'])}",
            ]
            if context["key_content"]:
                user_content.append("Existing File Samples:")
                for fn, snippet in context["key_content"].items():
                    user_content.append(f"--- {fn} ---\n{snippet}\n")

            user_content.append(f"User Request:\n\"{clean_task}\"\n")
            user_content.append("Generate the structured JSON architecture blueprint now.")

            messages = [
                {"role": "system", "content": ARCHITECT_SYSTEM_PROMPT},
                {"role": "user", "content": "\n".join(user_content)},
            ]

            resp = model.send(messages, tools=None, role='main')
            if resp and resp.text:
                data = _clean_json_response(resp.text)
                return TaskAnalysis(
                    original_task=clean_task,
                    task_type=data.get("task_type", "create").lower(),
                    stack=norm_stack,
                    goal=data.get("goal", f"Implement {clean_task}"),
                    checklist=data.get("checklist", [f"Implement {clean_task}"]),
                    ui_elements_required=data.get("visual_components", []),
                    files_to_touch=data.get("files_to_touch", ["index.html" if norm_stack == "html" else "app/page.tsx"]),
                    verification_criteria=data.get("verification_criteria", ["Component renders cleanly without errors"]),
                    domain_state=data.get("domain_state", []),
                )
        except Exception as e:
            # Non-fatal — log and proceed with dynamic structural analysis
            print(f"[Architect] Notice: LLM architect call returned: {e}. Using structural planner.")

    # ── Stage 2: Dynamic Codebase Structural Fallback ──────────────────────────
    # If model is unavailable or in isolated unit-test environment, plan based
    # on real file system evidence rather than hardcoded string keywords.
    has_existing_code = len(context["files"]) > 0 and (
        "index.html" in context["files"] or "app/page.tsx" in context["files"] or "package.json" in context["files"]
    )
    task_type = "modify" if has_existing_code else "create"

    if norm_stack == "html":
        target_files = ["index.html", "style.css", "script.js"] if not has_existing_code else ["index.html", "style.css"]
        checklist = [
            f"Review current DOM structure in index.html to plan integration",
            f"Construct semantic markup and Tailwind classes in index.html for: {clean_task}",
            f"Apply responsive styling and layout rules in style.css",
            f"Wire up interactive events and state handling in script.js",
        ]
        verification = [
            f"DOM elements for '{clean_task}' physically exist on disk in index.html",
            "Page renders with responsive Tailwind layout and zero console errors",
        ]
    else:
        target_files = ["app/page.tsx", "app/globals.css"] if has_existing_code else ["app/page.tsx", "app/layout.tsx", "app/globals.css"]
        checklist = [
            f"Define TypeScript types, state, and event models in app/page.tsx",
            f"Implement responsive Next.js App Router component with 'use client' for: {clean_task}",
            f"Style layout using modern Tailwind CSS and Lucide icons",
            f"Ensure clean compilation with zero TypeScript errors",
        ]
        verification = [
            f"Component renders '{clean_task}' correctly in Next.js App Router",
            "TypeScript compiler passes with zero syntax or type errors",
        ]

    return TaskAnalysis(
        original_task=clean_task,
        task_type=task_type,
        stack=norm_stack,
        goal=f"{'Update' if has_existing_code else 'Build'} {clean_task}",
        checklist=checklist,
        ui_elements_required=[],
        files_to_touch=target_files,
        verification_criteria=verification,
        domain_state=[],
    )
