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

  it("includes the soft piano preset", () => {
    const piano = INSTRUMENT_OPTIONS.find((option) => option.id === "felt_piano")
    assert.ok(piano, "Soft Piano preset missing")
    assert.equal(piano?.voice.oscillator, "triangle")
  })

  it("registers the sampled grand instrument with audio assets", () => {
    const sampled = INSTRUMENT_OPTIONS.find((option) => option.id === "sampled_grand")
    assert.ok(sampled, "Sampled Grand preset missing")
    assert.equal(sampled?.playback, "sample")
    assert.ok(sampled?.sample)
    assert.ok(sampled?.sample?.files.length)
  })

  it("prioritises sampled instruments before generated voices", () => {
    const sampleIndices = INSTRUMENT_OPTIONS.reduce<number[]>((indices, option, index) => {
      if (option.playback === "sample") {
        indices.push(index)
      }
      return indices
    }, [])

    assert(sampleIndices.length > 0, "Expected at least one sampled instrument")

    const firstSynthIndex = INSTRUMENT_OPTIONS.findIndex((option) => option.playback === "synth")
    if (firstSynthIndex === -1) return

    assert(sampleIndices.every((index) => index < firstSynthIndex), "Sample instruments should precede synth options")
  })

  it("exposes additional sampled instrument presets", () => {
    const expectedSampleIds = ["sampled_violin", "sampled_flute", "sampled_trumpet"]

    for (const id of expectedSampleIds) {
      const option = INSTRUMENT_OPTIONS.find((entry) => entry.id === id)
      assert.ok(option, `${id} preset missing`)
      assert.equal(option?.playback, "sample")
      assert.ok(option?.sample?.files.length)
    }
  })
})
