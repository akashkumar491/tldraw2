#!/usr/bin/env bash
set -eux

.yarn/releases/yarn-3.5.0.cjs run -T lazy build --filter=apps/examples --filter=packages/tldraw