---
"@waits/cadence": patch
---

Fix the global `cadence` CLI silently no-opping when installed as a scoped package. Bin resolution assumed the hoisted `.bin` sat one level above the package root, which holds for an unscoped install but not a scoped one (`node_modules/@scope/<pkg>`), where the hoist is two levels up. The runner is now found at either depth, and a launch that can't find its runner fails loudly with a non-zero exit instead of exiting 0 with no output.
