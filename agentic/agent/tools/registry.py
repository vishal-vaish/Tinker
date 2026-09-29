"""
agent.tools.registry — Tool Registry & Schema Validator

WHAT THIS FILE DOES:
- Holds ToolDef definitions for all tools accessible to the agent.
- Converts registered tools to Ollama function calling schemas.
- Validates model arguments against JSON schema (required fields, types) prior to execution.
- Dispatches tool calls to handlers and standardizes error responses.
"""
import json
from dataclasses import dataclass
from typing import Callable, Any

@dataclass
class ToolDef:
    """Definition of an agent tool."""
    name: str
    description: str
    parameters: dict          # JSON Schema for the tool's parameters
    risk: str                 # 'read', 'write', 'execute', 'destructive', 'control'
    handler: Callable[..., dict]  # Function that executes the tool

class ToolRegistry:
    """Registry of available tools with schema validation."""
    
    def __init__(self):
        self._tools: dict[str, ToolDef] = {}
    
    def register(self, tool: ToolDef):
        """Register a tool definition."""
        self._tools[tool.name] = tool
    
    def get(self, name: str) -> ToolDef | None:
        """Get a tool by name."""
        return self._tools.get(name)
    
    def list_tools(self) -> list[ToolDef]:
        """List all registered tools."""
        return list(self._tools.values())
    
    def get_schemas(self) -> list[dict]:
        """
        Get tool schemas in Ollama format for passing to the model.
        Returns list of: {"type": "function", "function": {"name": ..., "description": ..., "parameters": ...}}
        """
        schemas = []
        for tool in self._tools.values():
            schemas.append({
                'type': 'function',
                'function': {
                    'name': tool.name,
                    'description': tool.description,
                    'parameters': tool.parameters,
                }
            })
        return schemas
    
    def validate_args(self, name: str, args: dict) -> tuple[bool, str]:
        """
        Validate tool call arguments against the tool's JSON schema.
        Returns (is_valid, error_message).
        Does basic validation: required fields, type checking.
        """
        tool = self._tools.get(name)
        if not tool:
            return False, f"Unknown tool: {name}"
        
        schema = tool.parameters
        # Check required fields
        required = schema.get('required', [])
        properties = schema.get('properties', {})
        
        for field in required:
            if field not in args:
                return False, f"Missing required argument: {field}"
        
        # Check types of provided fields
        for key, value in args.items():
            if key not in properties:
                continue  # Allow extra args, just ignore
            expected_type = properties[key].get('type')
            if expected_type and not self._check_type(value, expected_type):
                return False, f"Argument '{key}' should be {expected_type}, got {type(value).__name__}"
        
        return True, ''
    
    def execute(self, name: str, args: dict) -> dict:
        """
        Validate and execute a tool call.
        Returns a dict with 'success' (bool), 'result' or 'error' (str).
        """
        # Validate
        valid, error = self.validate_args(name, args)
        if not valid:
            return {'success': False, 'error': error}
        
        tool = self._tools[name]
        try:
            result = tool.handler(**args)
            # If the handler returned an error string, treat as failure
            if isinstance(result, str) and result.startswith('ERROR:'):
                return {'success': False, 'error': result}
            return {'success': True, 'result': result}
        except Exception as e:
            return {'success': False, 'error': f"{type(e).__name__}: {str(e)}"}
    
    @staticmethod
    def _check_type(value: Any, expected: str) -> bool:
        """Basic JSON schema type check."""
        type_map = {
            'string': str,
            'integer': int,
            'number': (int, float),
            'boolean': bool,
            'array': list,
            'object': dict,
        }
        expected_type = type_map.get(expected)
        if expected_type is None:
            return True  # Unknown type, allow
        return isinstance(value, expected_type)
