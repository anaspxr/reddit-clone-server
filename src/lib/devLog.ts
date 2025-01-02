import { ENV } from "../configs/env";

export default function devLog(...args: unknown[]) {
  if (ENV.NODE_ENV === "development") {
    console.log(...args);
  }
}
