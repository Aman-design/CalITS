import type { AppMeta } from "@calcom/types/App";

import config from "./config.json";

export const metadata = {
  dirName: "salesforce",
  ...config,
} as AppMeta;

export default metadata;
