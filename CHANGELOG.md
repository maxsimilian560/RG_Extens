# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.10] - 2026-01-30

### Changed

- Changed includePath

## [0.1.9] - 2026-01-30

### Changed

- Changed includePath
- Move focus to terminal when starting build (can be changed in options)
- Opens terminal when starting build (can be changed in options)

## [0.1.8] - 2026-01-30

### Changed

- Updated @types/node from 22.15.11 to 25.1.0
- Updated @types/vscode from 1.99.1 to 1.108.1
- Updated @typescript-eslint/eslint-plugin from 8.32.0 to 8.54.0
- Updated @typescript-eslint/parser from 8.32.0 to 8.54.0
- Updated @vscode/test-cli from 0.0.10 to 0.0.12
- Updated eslint from 9.26.0 to 9.39.2
- Updated js-yaml to 4.1.1
- Updated glob to 10.5.0
- Updated qs to 6.14.1
- Updated @modelcontextprotocol/sdk to 1.24.0
- Updated diff to 8.0.3
- The buildEngine function has been changed to buildEngine64
- The debugDeleteRinegineVariable function has been changed to deleteRinegineVariable
- The deleteRinegineVariable function now removes paths in includePath from the C/C++ extension
- Now the updateIncludePath function removes irrelevant paths
- Changed paths to comply with the Rinegine WIP branch

## [0.1.7] - 2025-07-31

### Fixed

- Fixed Rinegine path checking on Windows

## [0.1.6] - 2025-07-14

### Changed

- Changed path for executable file for Linux.

## [0.1.5] - 2025-07-07

### Fixed

- Fixed paths to work properly on Linux

## [0.1.4] - 2025-05-14

### Fixed

- Fixed a bug with paths. The path to Rinegine was accepted only with \

## [0.1.3] - 2025-05-06

### Added

- The module system has been moved from project definitions to the builder. It is now recommended to connect modules through it.

### Changed

- Now the project uses hints from all modules and addons. Even if they are not connected

## [0.1.2] - 2025-04-20

### Fixed

- Fix CHANGELOG

## [0.1.1] - 2025-04-20

### Fixed

- In 0.1.1, the version display in README was corrected and the list of changes in CHANGELOG was clarified.

## [0.1.0] - 2025-04-20

### Changed

- Changed language syntax, only suitable for Rinegine 0.2.2 and above (not released yet), if you have any problem, please contact me.

## [0.0.6] - 2024-10-01

### Changed

- Now, when you call the builder, the open file will be saved

## [0.0.5] - 2024-10-01

### Fixed

- Corrected README

## [0.0.4] - 2024-10-01

### Added

- Changelog will now be maintained

### Fixed

- Now the project builder console window will not re-open if one is already open
