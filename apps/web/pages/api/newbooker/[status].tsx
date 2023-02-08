import type { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";

import { defaultResponder } from "@calcom/lib/server";

const newBookerSchema = z.object({
  status: z.enum(["enable", "disable"]),
});

/**
 * Very basic temporary api route to enable/disable new booker access.
 */
async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { status } = newBookerSchema.parse(req.query);

  if (status === "enable") {
    res.setHeader("Set-Cookie", "new-booker-enabled=true; path=/; expires=Thu, 01 Jan 2050 00:00:00 GMT");
  } else {
    res.setHeader("Set-Cookie", "new-booker-enabled=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT");
  }
  res.send({ status: 200, body: `Done – ${status}` });
}

export default defaultResponder(handler);
