"""
agent.config — Typed Configuration Loader

WHAT THIS FILE DOES:
- Reads and parses config.toml using Python's standard tomllib.
- Validates and exposes strongly-typed configuration settings.
- Provides ModelRoleConfig for model roles ('main' and 'fallback').
- Exposes budget properties (max_steps, max_time_seconds, retry limits).
- Exposes sandbox properties (allowed_commands, timeouts, caps).
- Exposes accuracy levers (best_of_n, final_verification, no_progress).
"""
from dataclasses import dataclass
import tomllib
from pathlib import Path

@dataclass
class ModelRoleConfig:
    provider: str
    model: str
    context_limit: int
    thinking: bool
    temperature: float
    timeout: int

class AgentConfig:
    """Loads and provides typed access to config.toml."""
    
    def __init__(self, config_path: str | Path):
        """Load config from a TOML file."""
        with open(config_path, 'rb') as f:
            self._data = tomllib.load(f)
    
    def get_model_config(self, role: str) -> ModelRoleConfig:
        """Get model configuration for a role ('main' or 'fallback')."""
        mc = self._data['models'][role]
        return ModelRoleConfig(
            provider=mc['provider'],
            model=mc['model'],
            context_limit=mc['context_limit'],
            thinking=mc['thinking'],
            temperature=mc['temperature'],
            timeout=mc['timeout'],
        )
    
    # Budget properties
    @property
    def max_steps(self) -> int:
        return self._data['budgets']['max_steps']

    @property
    def max_time_seconds(self) -> int:
        return self._data['budgets']['max_time_seconds']

    @property
    def max_retries_same_failure(self) -> int:
        return self._data['budgets']['max_retries_same_failure']

    @property
    def max_consecutive_invalid_calls(self) -> int:
        return self._data['budgets']['max_consecutive_invalid_calls']
    
    # Sandbox properties
    @property
    def allowed_commands(self) -> list[str]:
        return self._data['sandbox']['allowed_commands']

    @property
    def command_timeout(self) -> int:
        return self._data['sandbox']['command_timeout']

    @property
    def output_cap_bytes(self) -> int:
        return self._data['sandbox']['output_cap_bytes']

    @property
    def approval_timeout(self) -> int:
        return self._data['sandbox']['approval_timeout']
    
    # Accuracy properties
    @property
    def best_of_n(self) -> int:
        return self._data['accuracy']['best_of_n']

    @property
    def final_verification(self) -> bool:
        return self._data['accuracy']['final_verification']

    @property
    def no_progress_threshold(self) -> int:
        return self._data['accuracy']['no_progress_threshold']

    # Stack properties
    @property
    def default_stack(self) -> str:
        return self._data.get('stacks', {}).get('default_stack', 'nextjs')
