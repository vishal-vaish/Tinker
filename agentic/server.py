"""
Tinker Agentic Web Server & Playground Bridge
Runs a lightweight, zero-dependency HTTP server with SSE (Server-Sent Events) streaming.
Serves playground.html, sandboxes files, and runs real agent tasks in sandboxes.
"""

import os
import sys
import json
import uuid
import re
import queue
import threading
import mimetypes
import traceback
import shutil
from http.server import HTTPServer, BaseHTTPRequestHandler
from socketserver import ThreadingMixIn
from urllib.parse import urlparse, parse_qs

# Set UTF-8 encoding on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

# Add current directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
REPO_ROOT = os.path.dirname(BASE_DIR)
SANDBOXES_ROOT = os.path.join(REPO_ROOT, "sandboxes")
sys.path.insert(0, BASE_DIR)

from agent.config import AgentConfig
from agent.models import OllamaClient
from agent.events import (
    EventEmitter, Event,
    RUN_STARTED, PLAN_CREATED, STEP_PROGRESS, TOOL_CALL, TOOL_RESULT,
    RUN_FINISHED, SPEECH_SUMMARY
)
from agent.loop import AgentLoop


class ThreadedHTTPServer(ThreadingMixIn, HTTPServer):
    """Handle requests in separate threads for non-blocking SSE and file serving."""
    daemon_threads = True


class TinkerHandler(BaseHTTPRequestHandler):

    def log_message(self, format, *args):
        # Concise console logging
        sys.stdout.write(f"[{self.log_date_time_string()}] {self.command} {self.path}\n")

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_DELETE(self):
        parsed = urlparse(self.path)
        path = parsed.path
        if path == "/api/sandboxes":
            qs = parse_qs(parsed.query)
            target = qs.get("path", [""])[0]
            self.handle_delete_sandbox(target)
            return
        self.send_error(404, "Route not found")

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        # 1. Root: Serve playground.html
        if path == "/" or path == "/index.html":
            self.serve_file(os.path.join(BASE_DIR, "playground.html"), "text/html; charset=utf-8")
            return

        # 2. API: List sandboxes
        if path == "/api/sandboxes":
            self.handle_list_sandboxes()
            return

        # 2b. API: List files for a specific sandbox
        if path == "/api/sandbox-files":
            qs = parse_qs(parsed.query)
            target = qs.get("path", [""])[0]
            self.handle_list_files(target)
            return

        # 2c. API: List execution run history/chat for a specific sandbox
        if path == "/api/sandbox-history":
            qs = parse_qs(parsed.query)
            target = qs.get("path", [""])[0]
            self.handle_sandbox_history(target)
            return

        # 2d. API: Current model and context configuration
        if path == "/api/config":
            self.handle_get_config()
            return

        # 3. Serve sandboxes files (drafts & projects)
        if path.startswith("/sandboxes/"):
            rel_path = path[len("/sandboxes/"):].replace("/", os.sep)
            file_path = os.path.abspath(os.path.join(SANDBOXES_ROOT, rel_path))
            
            # Security jail check
            if not file_path.startswith(os.path.abspath(SANDBOXES_ROOT)):
                self.send_error(403, "Access denied")
                return

            if os.path.isfile(file_path):
                mime, _ = mimetypes.guess_type(file_path)
                self.serve_file(file_path, mime or "application/octet-stream")
                return
            elif os.path.isdir(file_path):
                # Auto-serve index.html if exists
                index_candidate = os.path.join(file_path, "index.html")
                if os.path.isfile(index_candidate):
                    self.serve_file(index_candidate, "text/html; charset=utf-8")
                    return
                self.send_error(404, "Directory listing disabled")
                return
            else:
                self.send_error(404, "File not found")
                return

        # Fallback 404
        self.send_error(404, "Route not found")

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/run":
            self.handle_run_task()
            return

        if path == "/api/sandboxes" or path == "/api/sandboxes/create":
            self.handle_create_sandbox()
            return

        self.send_error(404, "Route not found")

    def serve_file(self, file_path, content_type):
        try:
            with open(file_path, "rb") as f:
                content = f.read()
            self.send_response(200)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            self.wfile.write(content)
        except Exception as e:
            self.send_error(500, f"Error reading file: {e}")

    def _get_files_recursive(self, folder):
        files = []
        if not os.path.isdir(folder):
            return files
        for root, dirs, fnames in os.walk(folder):
            dirs[:] = [d for d in dirs if d not in ('.git', 'node_modules', '__pycache__', '.venv')]
            for fn in fnames:
                fpath = os.path.join(root, fn)
                rel = os.path.relpath(fpath, folder).replace("\\", "/")
                files.append(rel)
        files.sort()
        return files

    def handle_list_files(self, target_rel):
        """List all files for a specific sandbox path."""
        clean_rel = target_rel.strip("/").replace("sandboxes/", "").replace("/", os.sep)
        full_dir = os.path.abspath(os.path.join(SANDBOXES_ROOT, clean_rel))
        
        if not full_dir.startswith(os.path.abspath(SANDBOXES_ROOT)) or not os.path.isdir(full_dir):
            self.send_error(404, "Sandbox not found")
            return

        files = self._get_files_recursive(full_dir)
        payload = json.dumps({"files": files}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_sandbox_history(self, target_rel):
        """Load past execution runs/chat history for a sandbox."""
        clean_rel = target_rel.strip("/").replace("sandboxes/", "").replace("/", os.sep)
        parts = clean_rel.split(os.sep)
        if len(parts) < 2:
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", "12")
            self.end_headers()
            self.wfile.write(b'{"runs": []}')
            return

        category = parts[0]  # 'drafts' or 'projects'
        name = parts[1]
        runs_dir = os.path.join(SANDBOXES_ROOT, "runs", category, name)

        runs = []
        if os.path.isdir(runs_dir):
            run_folders = [d for d in os.listdir(runs_dir) if os.path.isdir(os.path.join(runs_dir, d))]
            run_folders.sort()  # Chronological order

            for rf in run_folders:
                r_path = os.path.join(runs_dir, rf)
                summary_file = os.path.join(r_path, "run.json")
                timeline_file = os.path.join(r_path, "timeline.txt")

                run_data = {"run_id": rf}
                if os.path.isfile(summary_file):
                    try:
                        with open(summary_file, "r", encoding="utf-8") as f:
                            run_data.update(json.load(f))
                    except Exception:
                        pass
                
                steps = []
                events_file = os.path.join(r_path, "events.jsonl")
                if os.path.isfile(events_file):
                    try:
                        with open(events_file, "r", encoding="utf-8") as f:
                            for l in f:
                                if not l.strip():
                                    continue
                                ev = json.loads(l)
                                ev_type = ev.get("type")
                                p = ev.get("payload") or {}
                                if ev_type == "tool.call":
                                    tool = p.get("tool", "")
                                    args = p.get("arguments") or {}
                                    path = args.get("path") or p.get("path") or ""
                                    clean_path = os.path.basename(path) if path else ""
                                    if tool == "list_files":
                                        desc = "Explored project files"
                                    elif tool == "read_file":
                                        desc = f"Explored {clean_path}" if clean_path else "Explored files"
                                    elif tool == "create_file":
                                        desc = f"Created {clean_path}" if clean_path else "Created file"
                                    elif tool == "edit_file":
                                        desc = f"Edited {clean_path}" if clean_path else "Edited file"
                                    elif tool == "run_tests":
                                        desc = "Verified test suite"
                                    elif tool == "finish":
                                        desc = "Completed task verification"
                                    else:
                                        desc = p.get("human_desc") or f"Executed {tool}"
                                    steps.append({"type": "tool_call", "text": desc})
                                elif ev_type == "tool.result":
                                    if p.get("tool") == "finish":
                                        continue
                                    if p.get("success") is False:
                                        err_raw = (p.get("result") or "Error").split("\n")[0].strip()
                                        err_clean = re.sub(r'^(ERROR:\s*)+', 'Error: ', err_raw)
                                        steps.append({"type": "tool_error", "text": err_clean[:60]})
                                    elif p.get("tool") == "run_tests":
                                        res_str = (p.get("result") or "").lower()
                                        if "failed" in res_str:
                                            steps.append({"type": "tool_error", "text": "Verification checks failed"})
                    except Exception:
                        pass

                # Fallback to timeline.txt if events.jsonl is not present
                if not steps and os.path.isfile(timeline_file):
                    try:
                        with open(timeline_file, "r", encoding="utf-8") as f:
                            for line in f:
                                line = line.strip()
                                if not line or line.startswith("===") or "RUN STARTED" in line or "PLAN SYNTHESIZED" in line:
                                    continue
                                clean_line = re.sub(r'^\[\d{2}:\d{2}:\d{2}\]\s*', '', line).strip()
                                if clean_line.startswith("⏳ STEP"):
                                    continue
                                elif clean_line.startswith("✅") and "TOOL RESULT" in clean_line:
                                    res_part = clean_line.split("->")[-1].strip() if "->" in clean_line else clean_line
                                    if "ERROR" in res_part.upper() or "FAILED" in res_part.upper():
                                        err_clean = re.sub(r'^(ERROR:\s*)+', 'Error: ', res_part)
                                        steps.append({"type": "tool_error", "text": err_clean[:60]})
                                elif any(c in clean_line for c in ("[read_file", "[edit_file", "[create_file", "[list_files", "[run_tests", "[finish")):
                                    title_part = clean_line.split("[")[0].strip()
                                    if "list_files" in clean_line:
                                        title_part = "Explored project files"
                                    elif "read_file" in clean_line:
                                        title_part = title_part.replace("Inspecting", "Explored")
                                    elif "edit_file" in clean_line:
                                        title_part = title_part.replace("Updating markup in", "Edited").replace("Updating styles in", "Edited").replace("Updating logic in", "Edited")
                                    elif "run_tests" in clean_line:
                                        title_part = "Verified test suite"
                                    elif "finish" in clean_line:
                                        title_part = "Completed task verification"
                                    title_part = re.sub(r'[^\w\s\.\-_/]', '', title_part).strip()
                                    steps.append({"type": "tool_call", "text": title_part})
                    except Exception:
                        pass
                report_file = os.path.join(r_path, "REPORT.md")
                if os.path.isfile(report_file):
                    try:
                        with open(report_file, "r", encoding="utf-8") as f:
                            run_data["report_md"] = f.read()
                    except Exception:
                        pass

                plan_file = os.path.join(r_path, "plan.md")
                if os.path.isfile(plan_file):
                    try:
                        with open(plan_file, "r", encoding="utf-8") as f:
                            run_data["plan_md"] = f.read()
                    except Exception:
                        pass

                run_data["timeline_steps"] = steps
                runs.append(run_data)

        payload = json.dumps({"runs": runs}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_get_config(self):
        """Return active model, context limits, and budgets."""
        config_path = os.path.join(BASE_DIR, "config.toml")
        try:
            config = AgentConfig(config_path)
            model_cfg = config.get_model_config("main")
            payload = json.dumps({
                "model": model_cfg.model,
                "provider": model_cfg.provider,
                "context_limit": model_cfg.context_limit,
                "temperature": model_cfg.temperature,
                "timeout": model_cfg.timeout,
                "max_steps": config.max_steps,
                "max_time_seconds": config.max_time_seconds
            }).encode("utf-8")
        except Exception as e:
            payload = json.dumps({"error": str(e)}).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_list_sandboxes(self):
        """Scan real sandboxes/drafts and sandboxes/projects on disk."""
        drafts_dir = os.path.join(SANDBOXES_ROOT, "drafts")
        projects_dir = os.path.join(SANDBOXES_ROOT, "projects")

        result = {"drafts": [], "projects": []}

        if os.path.isdir(drafts_dir):
            for name in os.listdir(drafts_dir):
                full_path = os.path.join(drafts_dir, name)
                if os.path.isdir(full_path):
                    has_index = os.path.isfile(os.path.join(full_path, "index.html"))
                    mtime = os.path.getmtime(full_path)
                    files = self._get_files_recursive(full_path)
                    result["drafts"].append({
                        "name": name,
                        "path": f"/sandboxes/drafts/{name}/",
                        "has_index": has_index,
                        "files": files,
                        "mtime": mtime
                    })

        if os.path.isdir(projects_dir):
            for name in os.listdir(projects_dir):
                full_path = os.path.join(projects_dir, name)
                if os.path.isdir(full_path):
                    has_index = os.path.isfile(os.path.join(full_path, "index.html"))
                    mtime = os.path.getmtime(full_path)
                    files = self._get_files_recursive(full_path)
                    result["projects"].append({
                        "name": name,
                        "path": f"/sandboxes/projects/{name}/",
                        "has_index": has_index,
                        "files": files,
                        "mtime": mtime
                    })

        # Sort newest first
        result["drafts"].sort(key=lambda x: x["mtime"], reverse=True)
        result["projects"].sort(key=lambda x: x["mtime"], reverse=True)

        payload = json.dumps(result).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_create_sandbox(self):
        """Explicitly create a new sandbox on disk with starter baseline."""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length) if content_length > 0 else b"{}"
        try:
            data = json.loads(body.decode("utf-8")) if body else {}
        except Exception:
            data = {}

        mode = data.get("mode", "draft").strip().lower()
        custom_name = data.get("name", "").strip()
        stack = data.get("stack", "html").strip().lower()
        task = data.get("task", "New sandbox starter").strip()

        is_draft = (mode == "draft")
        unique_id = uuid.uuid4().hex[:6]
        if is_draft:
            if custom_name:
                clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', custom_name).strip('_')
                if not clean_name.startswith("draft_"):
                    clean_name = f"draft_{clean_name}"
            else:
                clean_name = f"draft_canvas_{unique_id}"
            folder_name = clean_name
            project_root = os.path.join(SANDBOXES_ROOT, "drafts", folder_name)
        else:
            if custom_name:
                clean_name = re.sub(r'[^a-zA-Z0-9_-]', '_', custom_name).strip('_')
            else:
                clean_name = f"project_{unique_id}"
            folder_name = clean_name
            project_root = os.path.join(SANDBOXES_ROOT, "projects", folder_name)

        os.makedirs(project_root, exist_ok=True)

        from agent.scaffolder import ensure_stack_scaffold
        created_files = ensure_stack_scaffold(project_root, stack, task)
        all_files = self._get_files_recursive(project_root)

        rel_target = f"sandboxes/{'drafts' if is_draft else 'projects'}/{folder_name}"
        has_index = os.path.isfile(os.path.join(project_root, "index.html"))
        preview_url = f"/{rel_target}/index.html" if has_index else f"/{rel_target}/"

        payload = json.dumps({
            "success": True,
            "name": folder_name,
            "path": f"/{rel_target}/",
            "preview_url": preview_url,
            "files": all_files,
            "created_files": created_files,
            "stack": stack,
            "mode": mode
        }).encode("utf-8")

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def handle_delete_sandbox(self, target_rel):
        """Safely delete a sandbox directory inside sandboxes/."""
        clean_rel = target_rel.strip("/").replace("sandboxes/", "").replace("/", os.sep)
        parts = clean_rel.split(os.sep)
        if len(parts) < 2 or parts[0] not in ("drafts", "projects"):
            self.send_error(400, "Invalid sandbox path")
            return

        full_dir = os.path.abspath(os.path.join(SANDBOXES_ROOT, clean_rel))
        # Jail check: must be strictly inside drafts or projects
        if not full_dir.startswith(os.path.abspath(SANDBOXES_ROOT)) or full_dir == os.path.abspath(SANDBOXES_ROOT):
            self.send_error(403, "Access denied")
            return

        if not os.path.isdir(full_dir):
            self.send_error(404, "Sandbox not found")
            return

        try:
            shutil.rmtree(full_dir)
            # Clean runs for this sandbox if exist
            runs_dir = os.path.join(SANDBOXES_ROOT, "runs", parts[0], parts[1])
            if os.path.isdir(runs_dir):
                shutil.rmtree(runs_dir)

            payload = json.dumps({"success": True, "deleted": parts[1]}).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
        except Exception as e:
            self.send_error(500, f"Error deleting sandbox: {e}")

    def handle_run_task(self):
        """Execute real AgentLoop and stream live events via SSE."""
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length)
        try:
            data = json.loads(body.decode("utf-8"))
        except Exception:
            self.send_error(400, "Invalid JSON payload")
            return

        task = data.get("task", "").strip()
        mode = data.get("mode", "draft").strip().lower()
        target_name = data.get("name", "").strip()
        stack = data.get("stack", "html").strip().lower()

        if not task:
            self.send_error(400, "Task cannot be empty")
            return

        # Prepare SSE response
        self.send_response(200)
        self.send_header("Content-Type", "text/event-stream")
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Connection", "keep-alive")
        self.end_headers()

        # Event queue to bridge agent thread and HTTP stream
        event_queue = queue.Queue()

        def sse_send(event_type, payload):
            try:
                msg = f"event: {event_type}\ndata: {json.dumps(payload)}\n\n"
                self.wfile.write(msg.encode("utf-8"))
                self.wfile.flush()
            except Exception:
                pass

        # Determine project_root
        is_draft = (mode == "draft")
        if is_draft:
            if target_name and target_name.startswith("draft_") and os.path.isdir(os.path.join(SANDBOXES_ROOT, "drafts", target_name)):
                project_root = os.path.join(SANDBOXES_ROOT, "drafts", target_name)
            else:
                raw_words = re.findall(r'[a-zA-Z0-9]+', (target_name or task).lower())
                meaningful = [w for w in raw_words if w not in ('create', 'build', 'make', 'add', 'a', 'an', 'the', 'with', 'and', 'for', 'in', 'to', 'of')]
                slug = '_'.join(meaningful[:3]) if meaningful else ('_'.join(raw_words[:3]) or 'canvas')
                unique_id = uuid.uuid4().hex[:6]
                folder_name = f"draft_{slug}_{unique_id}"
                project_root = os.path.join(SANDBOXES_ROOT, "drafts", folder_name)
                os.makedirs(project_root, exist_ok=True)
        else:
            if target_name and os.path.isdir(os.path.join(SANDBOXES_ROOT, "projects", target_name)):
                project_root = os.path.join(SANDBOXES_ROOT, "projects", target_name)
            else:
                raw_words = re.findall(r'[a-zA-Z0-9]+', (target_name or task).lower())
                meaningful = [w for w in raw_words if w not in ('create', 'build', 'make', 'add', 'a', 'an', 'the', 'with', 'and', 'for', 'in', 'to', 'of')]
                slug = '_'.join(meaningful[:3]) if meaningful else ('_'.join(raw_words[:3]) or 'project')
                unique_id = uuid.uuid4().hex[:6]
                folder_name = f"project_{slug}_{unique_id}"
                project_root = os.path.join(SANDBOXES_ROOT, "projects", folder_name)
                os.makedirs(project_root, exist_ok=True)

        config_path = os.path.join(BASE_DIR, "config.toml")
        config = AgentConfig(config_path)
        emitter = EventEmitter()
        model = OllamaClient(config)

        # Dynamic reload of agent modules so edits apply immediately without server restart
        import importlib
        import agent.events
        import agent.tracing
        import agent.analyzer
        import agent.scaffolder
        import agent.loop
        importlib.reload(agent.events)
        importlib.reload(agent.tracing)
        importlib.reload(agent.analyzer)
        importlib.reload(agent.scaffolder)
        importlib.reload(agent.loop)
        agent = agent.loop.AgentLoop(config, model, emitter)

        # Forward internal events to SSE
        def on_event(ev_type):
            def handler(event: Event):
                event_queue.put({"type": ev_type, "payload": event.payload})
            return handler

        emitter.subscribe(RUN_STARTED, on_event("run_started"))
        emitter.subscribe(PLAN_CREATED, on_event("plan_created"))
        emitter.subscribe(STEP_PROGRESS, on_event("step_progress"))
        emitter.subscribe(TOOL_CALL, on_event("tool_call"))
        emitter.subscribe(TOOL_RESULT, on_event("tool_result"))
        emitter.subscribe(RUN_FINISHED, on_event("run_finished"))
        emitter.subscribe(SPEECH_SUMMARY, on_event("speech_summary"))

        # Run agent in background thread
        run_result = {"done": False, "summary": None, "error": None}

        def worker():
            try:
                summary = agent.run(
                    task=task,
                    project_root=project_root,
                    requested_stack=stack,
                    is_draft=is_draft
                )
                run_result["summary"] = summary
            except Exception as e:
                traceback.print_exc()
                run_result["error"] = str(e)
            finally:
                run_result["done"] = True
                event_queue.put(None)  # Sentinel to finish

        t = threading.Thread(target=worker, daemon=True)
        t.start()

        # Stream events to browser
        rel_target = os.path.relpath(project_root, REPO_ROOT).replace("\\", "/")
        sse_send("init", {
            "target_dir": project_root,
            "rel_url": f"/{rel_target}/",
            "is_draft": is_draft,
            "task": task
        })

        while True:
            try:
                item = event_queue.get(timeout=0.2)
                if item is None:
                    break
                sse_send(item["type"], item["payload"])
            except queue.Empty:
                if run_result["done"]:
                    break

        # Check files created in project_root
        files_created = []
        if os.path.isdir(project_root):
            for root, _, filenames in os.walk(project_root):
                for f in filenames:
                    fpath = os.path.join(root, f)
                    rel = os.path.relpath(fpath, project_root).replace("\\", "/")
                    files_created.append(rel)

        has_index = "index.html" in files_created
        preview_url = f"/{rel_target}/index.html" if has_index else (f"/{rel_target}/" if files_created else None)

        sse_send("complete", {
            "status": "error" if run_result["error"] else "success",
            "error": run_result["error"],
            "preview_url": preview_url,
            "files": files_created,
            "project_root": project_root
        })


def run_server(port=8000):
    server_address = ("127.0.0.1", port)
    httpd = ThreadedHTTPServer(server_address, TinkerHandler)
    print(f"\n=======================================================")
    print(f"  ⚡ Tinker Web Playground Server running at:")
    print(f"     http://localhost:{port}")
    print(f"=======================================================\n")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server...")
        httpd.shutdown()


if __name__ == "__main__":
    port = 8000
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_server(port)
