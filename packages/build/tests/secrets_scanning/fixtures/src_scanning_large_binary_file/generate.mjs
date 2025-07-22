import { randomBytes } from "node:crypto";
import { createWriteStream, mkdirSync } from "node:fs";

mkdirSync('dist', { recursive: true });

const writer = createWriteStream('dist/out.txt', { flags: "w" });

async function writeLotOfBytesWithoutNewLines() {
  const max_size = 128 * 1024 * 1024; // 128MB
  const chunk_size = 1024 * 1024; // 1MB

  let bytes_written = 0;
  while (bytes_written < max_size) {
    const bytes_to_write = Math.min(chunk_size, max_size - bytes_written);
    const buffer = randomBytes(bytes_to_write).map((byte) =>
      // swap LF and CR to something else 
      byte === 0x0d || byte === 0x0a ? 0x0b : byte
    );
    
    writer.write(buffer);
    bytes_written += bytes_to_write;
  }
}

await writeLotOfBytesWithoutNewLines()
writer.write(process.env.ENV_SECRET)
await writeLotOfBytesWithoutNewLines()

await new Promise((resolve, reject) => {
  writer.close(err => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  })
})

