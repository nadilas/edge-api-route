import { z } from "zod";
import type { NextRequest } from "next/server";
import cors from "../../server/edge/cors";

const schema = z.object({
  message: z.string(),
});

type Schema = z.infer<typeof schema>;

const headers = {
  "Content-Type": "application/json",
};

const endpoint = async (req: NextRequest) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ errors: "invalid method" }), {
      headers,
      status: 405,
    });
  }

  const request = schema.safeParse(await req.json());
  if (!request.success) {
    return new Response(JSON.stringify({ errors: request.error.issues }), {
      headers: headers,
      status: 400,
    });
  }

  try {
    const {data: requestData} = request
    requestData.message = 'edge: ' + requestData.message
    const backendUrl = `${process.env.NEXTAUTH_URL}/api/lambda`
    console.log('posting to', backendUrl)
    const resp = await fetch(backendUrl, {
      method: "POST",
      body: JSON.stringify(requestData),
    });
    if (resp.ok) {
      const respText = await resp.text();
      console.log('sending edge response', respText)
      return new Response(respText, {
        headers,
      });
    } else {
      return new Response(JSON.stringify({errors: `failed to fetch: ${resp.statusText}`, response: await resp.text()}))
    }
  } catch (e: any) {
    console.error(e)
    return new Response(
        JSON.stringify({errors: `error in fetch: ${e.message}`}),
        {
            headers,
        })
    }
};

export const config = {
  runtime: "experimental-edge",
};

export default async function handler(req: NextRequest) {
  // You can read more about the available options here: https://github.com/expressjs/cors#configuration-options
  return cors(req, endpoint, {
    methods: ["POST"],
    origin: [process.env.NEXTAUTH_URL!],
  });
}
