#!/usr/bin/env node

import { run } from '../src/server.mjs';

await run(process.argv.slice(2));
