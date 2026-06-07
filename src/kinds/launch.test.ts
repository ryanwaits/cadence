import { describe, expect, test } from "bun:test";
import type { UpdateManifest } from "../adapters/types";
import { featureLaunch } from "./launch";

const base: UpdateManifest = {
  product: "files-sdk",
  version: "1.7.0",
  features: [
    { title: "List folders with delimiters", kind: "feat" },
    { title: "Resumable uploads", kind: "feat" },
  ],
  tagline: "One API for every storage provider.",
};

describe("featureLaunch flow", () => {
  test("install-open (default): opens on the install terminal, closes on the hero", () => {
    const { beats } = featureLaunch({ ...base, install: "npm i files-sdk@1.7.0" });
    expect(beats[0].id).toBe("install");
    expect(beats[0].code?.source).toBe("npm i files-sdk@1.7.0");
    expect(beats[0].badge).toBe("v1.7");
    expect(beats.at(-1)?.id).toBe("hero");
    expect(beats.at(-1)?.hero).toBe(true);
    expect(beats.at(-1)?.caption).toBe("One API for every storage provider.");
  });

  test("install-open with no install line falls back to the title opener (stays non-null)", () => {
    const { beats } = featureLaunch(base);
    expect(beats[0].id).toBe("opener");
    expect(beats.at(-1)?.id).toBe("hero");
  });

  test("title-open keeps the classic opener + install closer", () => {
    const { beats } = featureLaunch({ ...base, install: "npm i files-sdk@1.7.0" }, { flow: "title-open" });
    expect(beats[0].id).toBe("opener");
    expect(beats.at(-1)?.id).toBe("cta");
  });
});
