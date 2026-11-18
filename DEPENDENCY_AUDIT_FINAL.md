# Dependency audit — final review

Executed `npm audit --json`, `npm audit --omit=dev --json`, `npm outdated --json`, and `npm view picomatch version` on 17 November 2026. The uploaded lockfile was retained; no unsupported major upgrade, forced audit fix, dependency suppression or unreviewed override was applied.

**Result: 11 high-severity dependency-graph entries remain; production-only audit reports 0 vulnerabilities.** All 11 originate from the same unresolved picomatch ReDoS advisory rather than 11 independent root causes. This is not an all-clear for development tooling.

| Package                    | Locked version | Direct? | Dependency path / issue                                                                          |
| -------------------------- | -------------- | ------- | ------------------------------------------------------------------------------------------------ |
| @angular-devkit/architect  | 0.2202.7       | False   | @angular-devkit/core                                                                             |
| @angular-devkit/core       | 22.2.7         | False   | picomatch                                                                                        |
| @angular-devkit/schematics | 22.2.7         | False   | @angular-devkit/core                                                                             |
| @angular/build             | 22.2.7         | True    | @angular-devkit/architect, @parcel/watcher, picomatch, tinyglobby, vite                          |
| @angular/cli               | 22.2.7         | True    | @angular-devkit/architect, @angular-devkit/core, @angular-devkit/schematics, @schematics/angular |
| @parcel/watcher            | 2.6.0          | False   | picomatch                                                                                        |
| @schematics/angular        | 22.2.7         | False   | @angular-devkit/core, @angular-devkit/schematics                                                 |
| fdir                       | 6.5.0          | False   | picomatch                                                                                        |
| picomatch                  | 4.0.7          | False   | picomatch vulnerable to ReDoS through single-branch repeated extglobs                            |
| tinyglobby                 | 0.2.17         | False   | fdir, picomatch                                                                                  |
| vite                       | 8.3.5          | False   | picomatch, tinyglobby                                                                            |

The registry reports picomatch **4.0.7** as the latest release; the advisory affects versions through 4.0.7. npm marks picomatch/build/vite/tinyglobby/watcher as having no available safe fix. For some Angular CLI graph entries it proposes a major downgrade to CLI 16.2.0; that is not compatible with this Angular 22 application and was intentionally not applied. `npm outdated` showed only newer major lines for TypeScript/Node types, not a supported patch that resolves this issue.

This chain is in build/watch/development tooling. Production-only dependency audit excludes the affected tools, but this does not erase the development advisory. Do not expose the dev server publicly or process untrusted glob patterns through build tooling. Revisit when a patched compatible release is available; rerun the build and tests after updating the lockfile.

Source: GitHub advisory https://github.com/advisories/GHSA-fc5q-39xc-vjpf (CVE-2026-112366). npm audit output and installed dependency graph were the source of the package/version counts above.

The fresh install in this environment did not reproduce the Windows install-script warning; the observed npm environment warning was about an inherited http-proxy setting. No project setting was changed to suppress or bypass install-script/security checks.
