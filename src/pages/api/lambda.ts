import { z } from "zod";
import type { NextApiRequest, NextApiResponse } from "next";

const schema = z.object({
  message: z.string(),
});

type Schema = z.infer<typeof schema>;

const headers = {
  "Content-Type": "application/json",
};

const endpoint = async (req: NextApiRequest, res: NextApiResponse) => {
    res.setHeader('content-type', 'application/json')
  
    if (req.method !== "POST") {
    res.statusCode = 405
    res.end(JSON.stringify({ errors: "invalid method" }))
    return
  }

  const request = schema.safeParse(JSON.parse(req.body));
  if (!request.success) {
    res.statusCode = 400
    res.end(JSON.stringify({ errors: request.error.issues }))
    return
  }

  const resp = JSON.stringify({
    response: 'backend: ' + request.data.message
  })
  console.log('sending response', resp)
  res.end(resp)
};

export default endpoint