"""
agent.models — Ollama Model Client & Tool Call Parser

WHAT THIS FILE DOES:
- Connects to Ollama's local HTTP API (/api/chat) using only Python stdlib (urllib).
- Resolves model roles ('main' and 'fallback') from config dynamically.
- Handles tool calling: parses native Ollama tool calls AND falls back to regex/json parsing if model outputs json text.
- Measures tokens in/out and round-trip duration in milliseconds.
- Supports request cancellation, timeouts, and optional thinking mode.
"""
import json
import time
import urllib.request
import urllib.error
import re
from dataclasses import dataclass
from typing import Any

@dataclass
class ToolCall:
    """A parsed tool call from the model."""
    name: str
    arguments: dict

@dataclass 
class ModelResponse:
    """Response from a model call."""
    text: str                          # The text content (may be empty if tool calls)
    tool_calls: list[ToolCall]         # Parsed tool calls (may be empty)
    tokens_in: int                     # Prompt tokens
    tokens_out: int                    # Completion tokens  
    duration_ms: int                   # Total request duration in ms
    mode: str                          # 'native', 'fallback_format', or 'text_only'
    thinking: str = ''                 # Thinking content if model supports it


class OllamaClient:
    """Model client for Ollama's local HTTP API."""
    
    OLLAMA_BASE = 'http://localhost:11434'
    
    def __init__(self, config: Any) -> None:
        """Initialize with an AgentConfig instance."""
        self._config = config
        self._cancelled = False
    
    def send(self, messages: list[dict], tools: list[dict] | None = None, 
             role: str = 'main') -> ModelResponse:
        """
        Send messages to the model and get a response.
        
        Args:
            messages: List of message dicts with 'role' and 'content'
            tools: Optional list of tool schemas (Ollama format)
            role: Model role from config ('main' or 'fallback')
        
        Returns:
            ModelResponse with text, tool_calls, token counts, timing
        """
        self._cancelled = False
        role_config = self._config.get_model_config(role)
        
        # Build request body
        body = {
            'model': role_config.model,
            'messages': messages,
            'stream': False,
            'options': {
                'temperature': role_config.temperature,
                'num_ctx': role_config.context_limit,
            },
        }
        
        # Add thinking support if configured
        if getattr(role_config, 'thinking', False):
            body['think'] = True
            
        # Add tools if provided
        if tools:
            body['tools'] = tools
            
        # Make the HTTP request
        start_time = time.time()
        try:
            data = json.dumps(body).encode('utf-8')
            req = urllib.request.Request(
                f'{self.OLLAMA_BASE}/api/chat',
                data=data,
                headers={'Content-Type': 'application/json'},
                method='POST'
            )
            
            with urllib.request.urlopen(req, timeout=role_config.timeout) as resp:
                response_data = json.loads(resp.read().decode('utf-8'))
        except urllib.error.URLError as e:
            raise ConnectionError(f'Failed to connect to Ollama at {self.OLLAMA_BASE}: {e}')
        except TimeoutError:
            raise TimeoutError(f'Ollama request timed out after {role_config.timeout}s')
            
        duration_ms = int((time.time() - start_time) * 1000)
        
        if self._cancelled:
            raise InterruptedError('Request was cancelled')
            
        # Parse response
        message = response_data.get('message', {})
        text = message.get('content', '')
        thinking = message.get('thinking', '')
        
        # Token counts from Ollama response
        tokens_in = response_data.get('prompt_eval_count', 0)
        tokens_out = response_data.get('eval_count', 0)
        
        # Try to extract native tool calls
        native_tool_calls = message.get('tool_calls', [])
        
        tool_calls = []
        mode = 'text_only'
        
        if native_tool_calls:
            # Native Ollama tool call format
            mode = 'native'
            for tc in native_tool_calls:
                func = tc.get('function', {})
                name = func.get('name', '')
                args = func.get('arguments', {})
                if isinstance(args, str):
                    try:
                        args = json.loads(args)
                    except json.JSONDecodeError:
                        args = {}
                tool_calls.append(ToolCall(name=name, arguments=args))
        elif tools and text:
            # Try fallback format: look for JSON object in text
            parsed = self._try_parse_fallback_tool_call(text)
            if parsed:
                tool_calls.append(parsed)
                mode = 'fallback_format'
                
        return ModelResponse(
            text=text,
            tool_calls=tool_calls,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            duration_ms=duration_ms,
            mode=mode,
            thinking=thinking,
        )
        
    def cancel(self) -> None:
        """Cancel the current request."""
        self._cancelled = True
        
    def _try_parse_fallback_tool_call(self, text: str) -> ToolCall | None:
        """
        Try to parse a tool call from plain text.
        Handles markdown codeblocks and various JSON layouts.
        """
        # First, check if there's a ```json ... ``` block
        code_block_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', text, re.DOTALL)
        if code_block_match:
            try:
                obj = json.loads(code_block_match.group(1))
                parsed = self._extract_tool_call_from_dict(obj)
                if parsed:
                    return parsed
            except json.JSONDecodeError:
                pass
                
        # Fallback to regex finding JSON objects
        json_pattern = r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}'
        matches = re.findall(json_pattern, text)
        
        for match in reversed(matches):  # Try last match first
            try:
                obj = json.loads(match)
                parsed = self._extract_tool_call_from_dict(obj)
                if parsed:
                    return parsed
            except json.JSONDecodeError:
                continue
                
        return None
        
    def _extract_tool_call_from_dict(self, obj: dict) -> ToolCall | None:
        """Extract tool call format from a dictionary."""
        # Format 1: {"tool": "name", "args": {...}}
        if 'tool' in obj and 'args' in obj:
            return ToolCall(name=obj['tool'], arguments=obj['args'])
        
        # Format 2: {"name": "...", "arguments": {...}}
        if 'name' in obj and 'arguments' in obj:
            return ToolCall(name=obj['name'], arguments=obj['arguments'])
        
        # Format 3: {"tool_name": "...", "parameters": {...}} 
        if 'tool_name' in obj and 'parameters' in obj:
            return ToolCall(name=obj['tool_name'], arguments=obj['parameters'])
            
        return None
