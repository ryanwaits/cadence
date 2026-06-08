import { describe, expect, test } from "bun:test";
import type { UpdateManifest } from "../adapters/types";
import type { Node } from "../schema/composition";
import { featureLaunch } from "./launch";

/** Find the first node of a given type in a beat's component tree. */
const find = <T extends Node["type"]>(nodes: Node[] | undefined, type: T): Extract<Node, { type: T }> | undefined =>
  nodes?.find((n): n is Extract<Node, { type: T }> => n.type === type);

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
    expect(find(beats[0].components as Node[], "code")?.code.source).toBe("npm i files-sdk@1.7.0");
    expect(find(beats[0].components as Node[], "badge")?.text).toBe("v1.7");
    const last = beats.at(-1);
    expect(last?.id).toBe("hero");
    expect(last?.layout).toBe("hero");
    expect(find(last?.components as Node[], "caption")?.text).toBe("One API for every storage provider.");
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
