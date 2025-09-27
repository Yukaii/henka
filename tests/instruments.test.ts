import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  DEFAULT_INSTRUMENT_ID,
  INSTRUMENT_OPTIONS,
  getInstrumentConfig,
  isInstrumentId,
} from "../lib/instruments"

describe("Instrument definitions", () => {
  it("exposes the default instrument in the selectable options", () => {
    const optionIds = INSTRUMENT_OPTIONS.map((option) => option.id)
    assert(optionIds.includes(DEFAULT_INSTRUMENT_ID))
  })

  it("validates instrument identifiers", () => {
    assert.equal(isInstrumentId(DEFAULT_INSTRUMENT_ID), true)
    assert.equal(isInstrumentId("not_real"), false)
  })

  it("provides config metadata for playback shaping", () => {
    const config = getInstrumentConfig(DEFAULT_INSTRUMENT_ID)
    assert.equal(config.id, DEFAULT_INSTRUMENT_ID)
    assert.ok(config.voice.oscillator.length > 0)
    assert.ok(config.bass.gain > 0)
    assert.ok(config.envelope.attack > 0)
    assert.ok(config.envelope.release > 0)
  })
})
