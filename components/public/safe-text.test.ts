import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { tokenizeLinks } from "./safe-text.tsx";

describe("safe-text linkify tokenizer", () => {
  it("returns a single text token when there is no URL", () => {
    const tokens = tokenizeLinks("plain message with no link");
    assert.deepEqual(tokens, [
      { type: "text", value: "plain message with no link" },
    ]);
  });

  it("turns a bare URL into a single url token", () => {
    const tokens = tokenizeLinks("https://example.com");
    assert.deepEqual(tokens, [{ type: "url", value: "https://example.com" }]);
  });

  it("extracts a URL embedded inside text", () => {
    const tokens = tokenizeLinks("see https://example.com for info");
    assert.deepEqual(tokens, [
      { type: "text", value: "see " },
      { type: "url", value: "https://example.com" },
      { type: "text", value: " for info" },
    ]);
  });

  it("strips trailing punctuation from the URL match", () => {
    const tokens = tokenizeLinks("visit https://example.com.");
    assert.deepEqual(tokens, [
      { type: "text", value: "visit " },
      { type: "url", value: "https://example.com" },
      { type: "text", value: "." },
    ]);
  });

  it("strips multiple trailing punctuation characters", () => {
    const tokens = tokenizeLinks("really? https://example.com?!");
    assert.deepEqual(tokens, [
      { type: "text", value: "really? " },
      { type: "url", value: "https://example.com" },
      { type: "text", value: "?!" },
    ]);
  });

  it("keeps closing parens out of the URL when next to one", () => {
    const tokens = tokenizeLinks("(see https://example.com)");
    assert.deepEqual(tokens, [
      { type: "text", value: "(see " },
      { type: "url", value: "https://example.com" },
      { type: "text", value: ")" },
    ]);
  });

  it("does NOT linkify javascript: URLs", () => {
    const tokens = tokenizeLinks("oops javascript:alert(1) here");
    assert.deepEqual(tokens, [
      { type: "text", value: "oops javascript:alert(1) here" },
    ]);
  });

  it("does NOT linkify data: URLs", () => {
    const tokens = tokenizeLinks("data:text/html,<script>");
    assert.deepEqual(tokens, [
      { type: "text", value: "data:text/html,<script>" },
    ]);
  });

  it("does NOT linkify schemeless www. links (project policy)", () => {
    const tokens = tokenizeLinks("see www.example.com");
    assert.deepEqual(tokens, [
      { type: "text", value: "see www.example.com" },
    ]);
  });

  it("handles two URLs on one line", () => {
    const tokens = tokenizeLinks(
      "compare https://a.example with https://b.example today",
    );
    assert.deepEqual(tokens, [
      { type: "text", value: "compare " },
      { type: "url", value: "https://a.example" },
      { type: "text", value: " with " },
      { type: "url", value: "https://b.example" },
      { type: "text", value: " today" },
    ]);
  });

  it("treats http and https equivalently", () => {
    const tokens = tokenizeLinks("plain http://example.org");
    assert.deepEqual(tokens, [
      { type: "text", value: "plain " },
      { type: "url", value: "http://example.org" },
    ]);
  });
});
