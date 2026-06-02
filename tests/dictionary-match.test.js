import assert from "node:assert/strict";
import test from "node:test";
import {
  createInformationItemFromInput,
  createSubjectFromInput,
  matchDictionaryEntries,
  relatedEventMapIdsFromMatches,
  relatedTermIdsFromMatches
} from "../src/core/dictionary-match.js";

const dictionaryEntries = [
  {
    id: "term-buyback",
    domainId: "stock",
    term: "自己株式取得",
    aliases: ["自社株買い"],
    category: "capital-policy",
    status: "verified",
    shortExplanation: "short",
    whyItMatters: [],
    firstCheckpoints: [],
    relatedEventMapIds: ["event-buyback"]
  },
  {
    id: "term-status",
    domainId: "stock",
    term: "取得状況",
    category: "capital-policy",
    status: "verified",
    shortExplanation: "short",
    whyItMatters: [],
    firstCheckpoints: [],
    relatedEventMapIds: ["event-buyback"]
  }
];

test("createSubjectFromInput creates a stable manual subject", () => {
  const subject = createSubjectFromInput({
    domainId: "stock",
    name: "サンプル電機",
    tags: "watch, owned",
    now: () => "2026-06-02T00:00:00.000Z"
  });

  assert.equal(subject.name, "サンプル電機");
  assert.deepEqual(subject.tags, ["watch", "owned"]);
  assert.equal(subject.createdAt, "2026-06-02T00:00:00.000Z");
});

test("createInformationItemFromInput creates a manual information item", () => {
  const item = createInformationItemFromInput({
    domainId: "stock",
    subjectId: "subject-1",
    title: "自己株式の取得状況に関するお知らせ",
    bodyExcerpt: "自社株買いの途中経過。",
    tags: "self-share-buyback,status",
    eventType: "self_share_buyback_status",
    now: () => "2026-06-02T00:00:00.000Z"
  });

  assert.equal(item.title, "自己株式の取得状況に関するお知らせ");
  assert.deepEqual(item.subjectIds, ["subject-1"]);
  assert.deepEqual(item.tags, ["self-share-buyback", "status"]);
  assert.equal(item.raw.eventType, "self_share_buyback_status");
});

test("matchDictionaryEntries detects terms and aliases from item text", () => {
  const item = createInformationItemFromInput({
    domainId: "stock",
    title: "自己株式の取得状況に関するお知らせ",
    bodyExcerpt: "自社株買いの途中経過。"
  });
  const matches = matchDictionaryEntries(dictionaryEntries, item);

  assert.deepEqual(relatedTermIdsFromMatches(matches), ["term-buyback", "term-status"]);
  assert.deepEqual(relatedEventMapIdsFromMatches(matches), ["event-buyback"]);
  assert.deepEqual(matches[0].matchedTerms, ["自社株買い"]);
});
