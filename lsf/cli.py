"""LSF CLI - Main command-line interface."""

import click
from loguru import logger
from rich.console import Console

from lsf import __version__
from lsf.commands import init

console = Console()


@click.group()
@click.version_option(version=__version__, prog_name="lsf")
@click.option("--debug", is_flag=True, help="Enable debug logging")
def main(debug: bool) -> None:
    """LSF - Configuration Management CLI for .claude and .lsf folders.

    Initialize projects with standard configuration folders from the LSF repository.
    """
    if debug:
        logger.enable("lsf")
    else:
        logger.disable("lsf")


main.add_command(init.init_cmd)


if __name__ == "__main__":
    main()
