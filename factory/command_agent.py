"""
Command Agent Wrapper.

Wraps Claude API to execute .claude/commands/*.md files as agents.
Agents use command file as system prompt and have access to factory tools.
"""

import json
import re
from pathlib import Path
from typing import Any

from anthropic import Anthropic

from factory.result import AgentResult


class CommandAgent:
    """Wraps a Claude command file as an executable agent."""

    def __init__(self, command_name: str, tools: list[Any] | None = None):
        """
        Initialize agent with command file and tools.

        Args:
            command_name: Name of command file (without .md extension)
            tools: List of tool instances (with .definition and .execute())
        """
        self.command_name = command_name
        self.command_path = Path(f".claude/commands/{command_name}.md")

        if not self.command_path.exists():
            raise FileNotFoundError(f"Command file not found: {self.command_path}")

        self.instructions = self.command_path.read_text()
        self.client = Anthropic()
        self.tools = tools or []

        # Build tool definitions for Anthropic API
        self.tool_definitions = [tool.definition for tool in self.tools] if self.tools else []

    def execute(self, context: dict[str, Any]) -> AgentResult:
        """
        Execute the command as an agent conversation.

        Args:
            context: Context for this phase (input files, parameters, etc.)

        Returns:
            AgentResult with output artifacts and decision log
        """
        # Build user message from context
        user_message = self._build_context_message(context)

        # Initialize conversation
        messages = [{"role": "user", "content": user_message}]

        # Execute agent conversation with tool loop
        while True:
            response = self.client.messages.create(
                model="claude-sonnet-4-5",
                max_tokens=16000,
                system=self.instructions,
                messages=messages,
                tools=self.tool_definitions if self.tool_definitions else None
            )

            # Check if agent is done or needs to use tools
            if response.stop_reason == "end_turn":
                # Agent is done
                break
            elif response.stop_reason == "tool_use":
                # Execute tools and continue
                tool_results = self._execute_tools(response.content)

                # Add assistant message and tool results to conversation
                messages.append({"role": "assistant", "content": response.content})
                messages.append({"role": "user", "content": tool_results})
            elif response.stop_reason == "max_tokens":
                # Hit token limit - could extend or fail
                print(f"Warning: Agent hit max tokens in phase {self.command_name}")
                break
            else:
                # Unexpected stop reason
                print(f"Warning: Unexpected stop_reason: {response.stop_reason}")
                break

        # Extract results from conversation
        artifacts = self._extract_artifacts(messages)
        decisions = self._extract_decisions(messages)

        return AgentResult(
            output_artifacts=artifacts,
            decision_log=decisions,
            metadata={"command": self.command_name}
        )

    def _build_context_message(self, context: dict[str, Any]) -> str:
        """Build user message from context."""
        lines = [f"Execute phase: {self.command_name}\n"]

        for key, value in context.items():
            if isinstance(value, Path):
                lines.append(f"{key}: {value}")
            elif isinstance(value, (str, int, float, bool)):
                lines.append(f"{key}: {value}")
            elif isinstance(value, (list, dict)):
                lines.append(f"{key}: {json.dumps(value, indent=2)}")
            else:
                lines.append(f"{key}: {str(value)}")

        return "\n".join(lines)

    def _execute_tools(self, content: list[dict]) -> list[dict]:
        """Execute tool calls from agent response."""
        tool_results = []

        for block in content:
            if block.get("type") == "tool_use":
                tool_name = block["name"]
                tool_input = block["input"]
                tool_use_id = block["id"]

                # Find matching tool
                tool = next((t for t in self.tools if t.definition["name"] == tool_name), None)

                if tool:
                    try:
                        # Execute tool
                        result = tool.execute(**tool_input)

                        # Convert result to string if needed
                        if isinstance(result, (dict, list)):
                            result_content = json.dumps(result, indent=2)
                        else:
                            result_content = str(result)

                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": tool_use_id,
                            "content": result_content
                        })
                    except Exception as e:
                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": tool_use_id,
                            "content": f"Error executing tool: {str(e)}",
                            "is_error": True
                        })
                else:
                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": tool_use_id,
                        "content": f"Tool not found: {tool_name}",
                        "is_error": True
                    })

        return tool_results

    def _extract_artifacts(self, messages: list[dict]) -> dict[str, Path]:
        """Extract generated artifacts from conversation."""
        artifacts = {}

        # Look for file paths mentioned in assistant messages
        # This is a simple heuristic - agents should follow conventions
        for message in messages:
            if message["role"] == "assistant":
                content = message.get("content", [])
                if isinstance(content, list):
                    for block in content:
                        if block.get("type") == "text":
                            text = block.get("text", "")
                            # Look for patterns like "Generated: specs/requirements.md"
                            matches = re.findall(r'(?:Generated|Created|Wrote):\s*([^\s]+\.(?:md|yaml|yml|py|js|ts|tsx))', text)
                            for match in matches:
                                path = Path(match)
                                if path.exists():
                                    artifacts[path.name] = path

        return artifacts

    def _extract_decisions(self, messages: list[dict]) -> list[dict[str, Any]]:
        """Extract decisions from conversation."""
        decisions = []

        for message in messages:
            if message["role"] == "assistant":
                content = message.get("content", [])
                if isinstance(content, list):
                    for block in content:
                        if block.get("type") == "text":
                            text = block.get("text", "")
                            # Look for decision markers (simple heuristic)
                            if "DECISION:" in text or "Decision:" in text:
                                decisions.append({
                                    "phase": self.command_name,
                                    "text": text[:500]  # Truncate if long
                                })

        return decisions
