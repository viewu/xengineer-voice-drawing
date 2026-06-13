import assert from "node:assert/strict";
import test from "node:test";

import { createStaticServer } from "../server.js";

test("serves the app shell from a local HTTP server", async () => {
  const server = createStaticServer(process.cwd());
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));

  const address = server.address();
  const response = await fetch(`http://127.0.0.1:${address.port}/`);
  const body = await response.text();

  await new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });

  assert.equal(response.status, 200);
  assert.match(body, /AI 语音绘图工具/);
});

