import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { isJobPostingPublic, isNewsPostPublic } from "./public.ts";

describe("isNewsPostPublic", () => {
  const now = new Date("2026-04-25T12:00:00Z");

  it("returns false for a draft regardless of published_at", () => {
    assert.equal(isNewsPostPublic("draft", null, now), false);
    assert.equal(
      isNewsPostPublic("draft", "2026-04-24T12:00:00Z", now),
      false,
    );
  });

  it("returns false for an archived post", () => {
    assert.equal(
      isNewsPostPublic("archived", "2026-04-24T12:00:00Z", now),
      false,
    );
  });

  it("returns false when published_at is null", () => {
    assert.equal(isNewsPostPublic("published", null, now), false);
  });

  it("returns false when published_at is in the future", () => {
    assert.equal(
      isNewsPostPublic("published", "2026-04-26T12:00:00Z", now),
      false,
    );
  });

  it("returns true when published_at is in the past", () => {
    assert.equal(
      isNewsPostPublic("published", "2026-04-24T12:00:00Z", now),
      true,
    );
  });

  it("returns true when published_at exactly equals now", () => {
    assert.equal(
      isNewsPostPublic("published", "2026-04-25T12:00:00Z", now),
      true,
    );
  });

  it("returns false when published_at is unparseable", () => {
    assert.equal(isNewsPostPublic("published", "not-a-date", now), false);
  });
});

describe("isJobPostingPublic", () => {
  const today = "2026-04-25";

  it("returns false for a draft", () => {
    assert.equal(isJobPostingPublic("draft", "2026-04-30", today), false);
  });

  it("returns false for a closed posting", () => {
    assert.equal(isJobPostingPublic("closed", "2026-04-30", today), false);
  });

  it("returns false for an archived posting", () => {
    assert.equal(
      isJobPostingPublic("archived", "2026-04-30", today),
      false,
    );
  });

  it("returns false when the deadline is yesterday", () => {
    assert.equal(isJobPostingPublic("active", "2026-04-24", today), false);
  });

  it("returns true when the deadline is today", () => {
    assert.equal(isJobPostingPublic("active", "2026-04-25", today), true);
  });

  it("returns true when the deadline is in the future", () => {
    assert.equal(isJobPostingPublic("active", "2026-05-25", today), true);
  });
});
