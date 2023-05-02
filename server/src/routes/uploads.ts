import type { RouteOptions } from "fastify";
import { IncomingMessage, Server, ServerResponse } from "http";
import os from "os";
import fs from "fs/promises";

import path from "path";

const MAX_AGE = 60 * 60 ** 24;

export const getUpload: RouteOptions<
  Server,
  IncomingMessage,
  ServerResponse,
  {
    Params: {
      filename: string;
    };
  }
> = {
  method: "GET",
  url: "/uploads/:filename",
  schema: {
    params: {
      type: "object",
      required: ["filename"],
      properties: {
        filename: { type: "string" },
      },
    },
  },
  handler: async (req, res) => {
    const { filename } = req.params;

    const useGcs = !!process.env.USE_GCS_STORAGE;

    // const filename = path.basename(fileParam);

    let stream: any;
    if (useGcs) {
      const bucketName = process.env.GCS_BUCKET_NAME as string;
      const bucketPath = process.env.GCS_BUCKET_PATH
        ? `${process.env.GCS_BUCKET_PATH}/`
        : "";

      // const cloudStorage = new Storage();

      // const file = cloudStorage
      //   .bucket(bucketName)
      //   .file(`${bucketPath}${params.filename}`);
      // stream = file.createReadStream();
      const url = `https://storage.googleapis.com/${bucketName}/${bucketPath}${fileParam}`;
      res.redirect(url);
    } else {
      const filepath = path.format({
        dir: os.tmpdir(),
        base: filename,
      });
      const fd = await fs.open(filepath, "r");
      stream = fd.createReadStream();
      res.header("Cache-Control", `max-age=${MAX_AGE}, s-maxage=${MAX_AGE}`);
      res.send(stream);
    }
  },
};