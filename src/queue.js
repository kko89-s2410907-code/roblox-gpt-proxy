// src/queue.js
const queue = [];
let busy = false;

async function _run(handler) {
  if (busy) return;
  const job = queue.shift();
  if (!job) return;

  busy = true;
  try {
    const result = await handler(job.data);
    job.resolve(result);
  } catch (err) {
    job.reject(err);
  } finally {
    busy = false;
    // 다음 작업까지 약간의 텀(레이트리밋 여유)
    setTimeout(() => _run(handler), 1100);
  }
}

function addToQueue(data, handler) {
  return new Promise((resolve, reject) => {
    queue.push({ data, resolve, reject });
    _run(handler);
  });
}

module.exports = { addToQueue };
