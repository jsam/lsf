"""Init command - Initialize LSF configuration by cloning and copying folders."""

import shutil
import tempfile
from pathlib import Path

import click
from loguru import logger
from rich.console import Console
from rich.progress import Progress, SpinnerColumn, TextColumn

console = Console()

# Repository URL
LSF_REPO_URL = "https://github.com/jsam/lsf.git"


@click.command(name="init")
@click.option(
    "--path",
    "-p",
    type=click.Path(),
    default=".",
    help="Project path to initialize (default: current directory)",
)
@click.option(
    "--overwrite",
    is_flag=True,
    help="Overwrite existing .claude and .lsf folders",
)
@click.option(
    "--backup",
    is_flag=True,
    help="Backup existing folders before overwriting",
)
def init_cmd(path: str, overwrite: bool, backup: bool) -> None:
    """Initialize LSF configuration by pulling from the LSF repository."""
    project_path = Path(path).resolve()

    console.print(
        f"🚀 Initializing LSF configuration in [bold]{project_path}[/bold]..."
    )

    # Check for existing folders
    existing_folders = []
    for folder in [".claude", ".lsf"]:
        folder_path = project_path / folder
        if folder_path.exists():
            existing_folders.append(folder)

    if existing_folders and not overwrite:
        console.print(
            f"❌ Folders already exist: {', '.join(existing_folders)}\n"
            f"Use --overwrite to replace them or --backup to save them first.",
            style="red",
        )
        raise click.ClickException("Configuration folders already exist")

    # Create temporary directory for cloning
    with tempfile.TemporaryDirectory() as temp_dir:
        temp_path = Path(temp_dir)

        with Progress(
            SpinnerColumn(),
            TextColumn("[progress.description]{task.description}"),
            console=console,
        ) as progress:
            # Clone repository
            clone_task = progress.add_task("Cloning LSF repository...", total=1)
            try:
                import git

                git.Repo.clone_from(LSF_REPO_URL, temp_path / "lsf")
                progress.advance(clone_task)
                logger.info(f"Successfully cloned repository from {LSF_REPO_URL}")
            except Exception as e:
                console.print(f"❌ Failed to clone repository: {str(e)}", style="red")
                logger.error(f"Clone failed: {e}")
                raise click.ClickException(f"Failed to clone repository: {str(e)}")

            # Copy folders
            copy_task = progress.add_task("Copying configuration folders...", total=2)

            for folder in [".claude", ".lsf"]:
                source_path = temp_path / "lsf" / folder
                target_path = project_path / folder

                if not source_path.exists():
                    console.print(
                        f"⚠️  {folder} not found in repository", style="yellow"
                    )
                    progress.advance(copy_task)
                    continue

                # Handle existing folder
                if target_path.exists():
                    if backup:
                        from datetime import datetime

                        backup_name = f"{folder}.backup.{datetime.now().strftime('%Y%m%d_%H%M%S')}"
                        backup_path = project_path / backup_name
                        shutil.move(str(target_path), str(backup_path))
                        console.print(
                            f"📦 Backed up {folder} to {backup_name}", style="dim"
                        )
                    else:
                        shutil.rmtree(target_path)

                # Copy folder
                try:
                    shutil.copytree(source_path, target_path)
                    console.print(f"✅ Copied {folder}", style="green")
                    logger.info(f"Successfully copied {folder} to {target_path}")
                except Exception as e:
                    console.print(f"❌ Failed to copy {folder}: {str(e)}", style="red")
                    logger.error(f"Failed to copy {folder}: {e}")

                progress.advance(copy_task)

    console.print(
        "\n✨ LSF configuration initialized successfully!", style="bold green"
    )
    console.print(
        "\nYour project now has the standard .claude and .lsf configuration folders.\n"
        "These folders contain templates and scripts for consistent development workflows.",
        style="dim",
    )
