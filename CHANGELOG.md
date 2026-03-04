# Project Changelog

This file documents all notable changes to this project.

## [2026-02-12] - Safe Dependency Updates & Fixes

### Added
- **`sweetalert2`**: Added as replacement for deprecated `sweetalert`.
- **`sass`**: Added Dart Sass to replace `node-sass`.

### Changed
- **Dependencies Updated**:
  - `axios` (^1.2.0 -> ^1.8.4)
  - `formik` (^2.2.9 -> ^2.4.9)
  - `react-bootstrap` (^2.7.4 -> ^2.10.10)
  - `react-select` (^5.7.3 -> ^5.9.0)
  - `recharts` (^2.6.2 -> ^2.15.3)
  - `lightgallery` (^2.7.0 -> ^2.8.2)
  - `react-calendar` (^4.2.1 -> ^4.8.0)
- **`package.json`**: Updated script `test` -> `sass --watch src/scss/main.scss src/css/style.css` (migrated from node-sass).

### Removed
- **`sweetalert`**: Removed deprecated library.

### Fixed
- **`AuthService.js`**:
  - Replaced `swal` with `Swal.fire`.
  - Fixed `no-undef` error handling (undefined `error` variable).
- **`Registration.js`**:
  - Replaced `swal` with `Swal.fire`.
  - Fixed runtime crash (accessing property of boolean `error`).
- **`Todo.js`**: Migrated alert syntax.
- **`AppProfile.js`**: Migrated alert syntax.
- **`StarRating.js`**: Migrated alert syntax.
- **`SweetAlert.js`**: Updated all demo alerts to use `sweetalert2` promise syntax.
- **`_mega-menu.scss`**: Fixed `SassError: 45vw and 3 are incompatible` by adding `rem` units to `calc()`.
