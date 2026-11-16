import { expect, test } from "vite-plus/test";
import { hasLiteralPin } from "./pins.ts";

const v = { hull: "v0.12.0", splice: "0.5.1" };
const c = {
  hull: "5a72442649f6958e91a50283a91e985f45e10a09",
  splice: "8dcdf9a9faf35cd5b504c326c9107f8da689264e",
};

test("flags a full SHA, a 7-char SHA, --ref vX and @pkg@version", () => {
  expect(hasLiteralPin(`blob/${c.hull}/x`, v, c)).toBe(true);
  expect(hasLiteralPin("at `5a72442` here", v, c)).toBe(true);
  expect(hasLiteralPin("--ref v0.12.0 --piece", v, c)).toBe(true);
  expect(hasLiteralPin("pnpm dlx @keelstackhq/splice@0.5.1 new", v, c)).toBe(true);
});

test("does not flag tokens, longer versions or other text", () => {
  expect(hasLiteralPin("@keelstackhq/splice@0.5.10 new", v, c)).toBe(false);
  expect(hasLiteralPin("--ref v0.12.01", v, c)).toBe(false);
  expect(hasLiteralPin("@keelstackhq/splice@{{ks.bare.splice}}", v, c)).toBe(false);
  expect(hasLiteralPin("5a724421 and x5a72442", v, c)).toBe(false);
  expect(hasLiteralPin("hull v0.12.0 ships it", v, c)).toBe(false);
});
