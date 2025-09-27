#!/usr/bin/env python3
"""
Layer 3A to Layer 3B transformation: Red phase to green phase
Follows green phase derivation instruction from .lsf/memory/
"""

import re
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import List, Optional, Dict


@dataclass
class RedTask:
    """RED phase task"""
    id: str
    test_id: str
    traceability: str
    test_type: str
    file_location: str
    function_name: str
    expected_failure: str
    verify_failure: str


@dataclass
class GreenTask:
    """GREEN implementation task"""
    id: str
    requirement_id: str
    red_task_id: str
    traceability: str
    component: str
    file_location: str
    implementation: str
    configuration: str
    verify_pass: str


@dataclass
class GreenIntegrationTask:
    """GREEN integration task"""
    id: str
    component1: str
    component2: str
    purpose: str
    configuration: str
    dependencies: str
    verify_integration: str


@dataclass
class GreenConfigTask:
    """GREEN configuration task"""
    id: str
    description: str
    purpose: str
    commands: str
    dependencies: str
    verify: str


class RedToGreenTransformer:
    """Transform red phase to green phase following constitutional principles"""

    def __init__(self, red_phase_path: str, architecture_boundaries_path: str = ".lsf/memory/architecture-boundaries.md"):
        self.red_phase_path = Path(red_phase_path)
        self.boundaries_path = Path(architecture_boundaries_path)
        self.red_phase_content = self._read_file(self.red_phase_path)
        self.boundaries = self._read_file(self.boundaries_path) if self.boundaries_path.exists() else ""

    def _read_file(self, path: Path) -> str:
        """Read file content"""
        return path.read_text(encoding='utf-8')

    def parse_red_tasks(self) -> List[RedTask]:
        """Parse RED tasks from red-phase.md"""
        red_tasks = []

        # Pattern for RED tasks
        pattern = r'RED-(\d+): Write failing test \[(.*?)\]\n- Traceability: (.*?)\n- Test Type: (.*?)\n- File Location: (.*?)\n- Function Name: (.*?)\n- Expected Failure: (.*?)\n- Verify Failure: `(.*?)`'
        matches = re.findall(pattern, self.red_phase_content, re.MULTILINE)

        for match in matches:
            red_tasks.append(RedTask(
                id=f"RED-{match[0]}",
                test_id=match[1].strip(),
                traceability=match[2].strip(),
                test_type=match[3].strip(),
                file_location=match[4].strip(),
                function_name=match[5].strip(),
                expected_failure=match[6].strip(),
                verify_failure=match[7].strip()
            ))

        return red_tasks

    def extract_requirement_id(self, traceability: str) -> str:
        """Extract REQ-XXX from traceability chain"""
        req_match = re.search(r'REQ-\d+', traceability)
        return req_match.group() if req_match else 'REQ-UNKNOWN'

    def select_component(self, test_type: str, expected_failure: str) -> str:
        """Select component using architecture boundaries decision tree"""
        # Decision tree: Django/React built-in → existing pattern → configure

        if 'Backend' in test_type:
            if 'Model' in expected_failure or 'ImportError' in expected_failure:
                return 'Django ORM (models.Model from .lsf/memory/architecture-boundaries.md)'
            elif 'API' in expected_failure or 'URLError' in expected_failure:
                return 'Django API view (@api_view from .lsf/memory/architecture-boundaries.md)'
            elif 'Task' in expected_failure:
                return 'Celery task (@shared_task from .lsf/memory/architecture-boundaries.md)'
            else:
                return 'Django function from existing patterns'

        elif 'Frontend' in test_type:
            if 'Component' in expected_failure:
                return 'React functional component (from .lsf/memory/architecture-boundaries.md)'
            elif 'Hook' in expected_failure:
                return 'React hooks (useState/useEffect from .lsf/memory/architecture-boundaries.md)'
            elif 'Service' in expected_failure:
                return 'Axios API client (from .lsf/memory/architecture-boundaries.md)'
            else:
                return 'React component from existing patterns'

        else:
            return 'Existing component from .lsf/memory/architecture-boundaries.md'

    def determine_file_location(self, test_location: str, test_type: str) -> str:
        """Determine implementation file location"""
        # Map test files to implementation files
        if 'Backend' in test_type:
            if 'integration/test_' in test_location:
                return 'src/core/models.py' if 'Model' in test_type else 'src/core/views.py'
            elif 'contract/test_' in test_location:
                return 'src/api/views.py'
            elif 'unit/test_' in test_location:
                return 'src/utils/functions.py'
            else:
                return 'src/app.py'

        elif 'Frontend' in test_type:
            if 'integration/' in test_location:
                component_name = re.search(r'(\w+)\.test\.tsx', test_location)
                if component_name:
                    return f'src/frontend/src/components/{component_name.group(1)}.tsx'
                return 'src/frontend/src/components/Component.tsx'
            elif 'unit/' in test_location:
                return 'src/frontend/src/utils/functions.ts'
            else:
                return 'src/frontend/src/App.tsx'

        else:
            return 'src/implementation.py'

    def determine_implementation(self, component: str, test_id: str) -> str:
        """Generate minimal implementation description"""
        if 'models.Model' in component:
            return f'{test_id} model with required fields'
        elif '@api_view' in component:
            return f'{test_id} endpoint with validation'
        elif '@shared_task' in component:
            return f'{test_id} async task with error handling'
        elif 'React functional component' in component:
            return f'{test_id} component with props interface'
        elif 'React hooks' in component:
            return f'{test_id} hook with state management'
        elif 'Axios' in component:
            return f'{test_id} service with API methods'
        else:
            return f'Minimal implementation for {test_id}'

    def determine_configuration(self, component: str, file_location: str) -> str:
        """Determine required configuration"""
        configs = []

        if 'models.Model' in component:
            configs.append('Add to INSTALLED_APPS, run migrations')
        elif '@api_view' in component:
            configs.append('Add URL pattern to urls.py')
        elif '@shared_task' in component:
            configs.append('Import in celery.py autodiscover')
        elif 'React' in component:
            configs.append('Export from index.ts')

        return ', '.join(configs) if configs else 'None'

    def check_secret_dependencies(self, implementation: str) -> Optional[str]:
        """Check if implementation requires external service secrets"""
        secret_map = {
            'oauth': 'GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET',
            'email': 'SENDGRID_API_KEY, FROM_EMAIL',
            'payment': 'STRIPE_SECRET_KEY',
            'storage': 'AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY',
            'webhook': 'WEBHOOK_SECRET'
        }

        for service, secrets in secret_map.items():
            if service in implementation.lower():
                return f'REQUIRES-SECRETS: [{secrets}]'

        return None

    def create_green_tasks(self, red_tasks: List[RedTask]) -> List[GreenTask]:
        """Create GREEN implementation tasks from RED tasks"""
        green_tasks = []
        task_counter = 1

        for red_task in red_tasks:
            req_id = self.extract_requirement_id(red_task.traceability)
            component = self.select_component(red_task.test_type, red_task.expected_failure)
            file_location = self.determine_file_location(red_task.file_location, red_task.test_type)
            implementation = self.determine_implementation(component, red_task.test_id)
            configuration = self.determine_configuration(component, file_location)

            # Transform verify command from fail to pass
            verify_pass = red_task.verify_failure.replace('--tb=short', '').strip()

            green_task = GreenTask(
                id=f"{task_counter:03d}",
                requirement_id=req_id,
                red_task_id=red_task.id,
                traceability=red_task.traceability,
                component=component,
                file_location=file_location,
                implementation=implementation,
                configuration=configuration,
                verify_pass=verify_pass
            )
            green_tasks.append(green_task)
            task_counter += 1

        return green_tasks

    def create_integration_tasks(self, green_tasks: List[GreenTask]) -> List[GreenIntegrationTask]:
        """Create integration tasks for component wiring"""
        int_tasks = []
        task_counter = 1

        # Check for model → admin integration
        has_models = any('models.Model' in task.component for task in green_tasks)
        if has_models:
            int_tasks.append(GreenIntegrationTask(
                id=f"{task_counter:03d}",
                component1='Django models',
                component2='Django admin',
                purpose='Enable admin interface for models',
                configuration='Register models in admin.py',
                dependencies='Model implementations',
                verify_integration='python manage.py check'
            ))
            task_counter += 1

        # Check for API → frontend integration
        has_api = any('@api_view' in task.component for task in green_tasks)
        has_frontend = any('React' in task.component for task in green_tasks)
        if has_api and has_frontend:
            int_tasks.append(GreenIntegrationTask(
                id=f"{task_counter:03d}",
                component1='Django API',
                component2='React components',
                purpose='Connect backend API with frontend',
                configuration='CORS settings, API base URL',
                dependencies='Backend API + Frontend service',
                verify_integration='tests/run_all_tests_parallelized.py'
            ))
            task_counter += 1

        return int_tasks

    def create_config_tasks(self, green_tasks: List[GreenTask]) -> List[GreenConfigTask]:
        """Create configuration tasks"""
        config_tasks = []
        task_counter = 1

        # Check for database migrations
        has_models = any('models.Model' in task.component for task in green_tasks)
        if has_models:
            config_tasks.append(GreenConfigTask(
                id=f"{task_counter:03d}",
                description='database migrations',
                purpose='Apply model changes to database',
                commands='python manage.py makemigrations && python manage.py migrate',
                dependencies='Model implementations',
                verify='python manage.py showmigrations'
            ))
            task_counter += 1

        return config_tasks

    def generate_green_phase_file(self, green_tasks: List[GreenTask],
                                 int_tasks: List[GreenIntegrationTask],
                                 config_tasks: List[GreenConfigTask]) -> str:
        """Generate green-phase.md content"""
        content = ["# Green Phase: Implementation to Pass Tests", ""]

        # Backend implementation tasks
        backend_tasks = [t for t in green_tasks if 'Backend' in t.red_task_id or 'Django' in t.component]
        if backend_tasks:
            content.extend(["## Backend Implementation Tasks", ""])
            for task in backend_tasks:
                content.extend([
                    f"GREEN-{task.id}: Implement [{task.requirement_id}] to pass [{task.red_task_id}]",
                    f"- Traceability: {task.traceability}",
                    f"- Component: {task.component}",
                    f"- File Location: {task.file_location}",
                    f"- Implementation: {task.implementation}",
                    f"- Configuration: {task.configuration}",
                    f"- Verify Pass: `{task.verify_pass}`",
                    ""
                ])

        # Frontend implementation tasks
        frontend_tasks = [t for t in green_tasks if 'Frontend' in t.red_task_id or 'React' in t.component]
        if frontend_tasks:
            content.extend(["## Frontend Implementation Tasks", ""])
            for task in frontend_tasks:
                content.extend([
                    f"GREEN-{task.id}: Implement [{task.requirement_id}] to pass [{task.red_task_id}]",
                    f"- Traceability: {task.traceability}",
                    f"- Component: {task.component}",
                    f"- File Location: {task.file_location}",
                    f"- Implementation: {task.implementation}",
                    f"- Configuration: {task.configuration}",
                    f"- Verify Pass: `{task.verify_pass}`",
                    ""
                ])

        # Integration tasks
        if int_tasks:
            content.extend(["## Integration Tasks", ""])
            for task in int_tasks:
                content.extend([
                    f"GREEN-INT-{task.id}: Integrate {task.component1} with {task.component2}",
                    f"- Purpose: {task.purpose}",
                    f"- Configuration: {task.configuration}",
                    f"- Dependencies: {task.dependencies}",
                    f"- Verify Integration: `{task.verify_integration}`",
                    ""
                ])

        # Configuration tasks
        if config_tasks:
            content.extend(["## Configuration Tasks", ""])
            for task in config_tasks:
                content.extend([
                    f"GREEN-CONFIG-{task.id}: Configure {task.description}",
                    f"- Purpose: {task.purpose}",
                    f"- Commands: `{task.commands}`",
                    f"- Dependencies: {task.dependencies}",
                    f"- Verify: `{task.verify}`",
                    ""
                ])

        return "\n".join(content)

    def transform(self) -> str:
        """Execute full transformation"""
        # Parse RED tasks
        red_tasks = self.parse_red_tasks()

        # Create GREEN implementation tasks
        green_tasks = self.create_green_tasks(red_tasks)

        # Create integration tasks
        int_tasks = self.create_integration_tasks(green_tasks)

        # Create configuration tasks
        config_tasks = self.create_config_tasks(green_tasks)

        # Generate green phase file
        green_phase_content = self.generate_green_phase_file(green_tasks, int_tasks, config_tasks)

        return green_phase_content


def main():
    """CLI interface"""
    if len(sys.argv) < 2:
        print("Usage: python red_to_green.py <red-phase.md> [--output OUTPUT]")
        sys.exit(1)

    red_phase_file = sys.argv[1]
    output_file = "green-phase.md"

    if "--output" in sys.argv:
        idx = sys.argv.index("--output")
        if idx + 1 < len(sys.argv):
            output_file = sys.argv[idx + 1]

    try:
        transformer = RedToGreenTransformer(red_phase_file)
        green_phase_content = transformer.transform()

        # Write output file
        output_path = Path(output_file)
        output_path.write_text(green_phase_content, encoding='utf-8')

        print(f"✅ Generated: {output_path}")

    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()