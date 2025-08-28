// src/queue.js
const queue = [];
let processing = false;

async function processQueue(handler) {
  if (processing || queue.length === 0) return;
  processing = true;

  const { data, resolve, reject } = queue.shift();
  try {
    const result = await handler(data);
    resolve(result);
  } catch (err) {
    reject(err);
  } finally {
    processing = false;
    processQueue(handler);
  }
}

function addToQueue(data, handler) {
  return new Promise((resolve, reject) => {
    queue.push({ data, resolve, reject });
    processQueue(handler);
  });
}

module.exports = { addToQueue };
