import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { ChordGenerator } from "../lib/chord-generator"

describe("ChordGenerator Roman numeral mapping", () => {
  it("distinguishes between I and IV chords in G major", () => {
    const generator = new ChordGenerator()
    const progression = generator.generateProgressionFromRoman(["I", "IV", "V", "I"], "G")

    assert.equal(progression.chords.length, 4)

    const chordNames = progression.chords.map((chord) => chord.name)
    assert.equal(chordNames[0].startsWith("G"), true)
    assert.equal(chordNames[1].startsWith("C"), true)
    assert.equal(chordNames[2].startsWith("D"), true)
    assert.equal(chordNames[3].startsWith("G"), true)

    const rootMidis = progression.chords.map((chord) => chord.rootMidi)
    assert.notStrictEqual(rootMidis[0], rootMidis[1])
    assert.notStrictEqual(rootMidis[1], rootMidis[2])
    assert.strictEqual(rootMidis[0], rootMidis[3])

    const firstChordNotes = progression.chords[0].notes.join(",")
    const secondChordNotes = progression.chords[1].notes.join(",")
    assert.notStrictEqual(firstChordNotes, secondChordNotes)
  })

  it("handles extended roman numerals without collapsing degrees", () => {
    const generator = new ChordGenerator()
    const progression = generator.generateProgressionFromRoman(["Imaj7", "vi7", "ii7", "V7"], "C")

    const chordNames = progression.chords.map((chord) => chord.name)
    assert.equal(chordNames[0].startsWith("C"), true)
    assert.equal(chordNames[1].startsWith("A"), true)
    assert.equal(chordNames[2].startsWith("D"), true)
    assert.equal(chordNames[3].startsWith("G"), true)

    const romanNumerals = progression.chords.map((chord) => chord.romanNumeral)
    assert.deepStrictEqual(romanNumerals, ["Imaj7", "vi7", "ii7", "V7"])
  })

  it("respects inversion suffixes when computing degrees", () => {
    const generator = new ChordGenerator()
    const progression = generator.generateProgressionFromRoman(["I", "IV/1st"], "F")

    const [tonic, subdominant] = progression.chords
    assert.notStrictEqual(tonic.rootMidi, subdominant.rootMidi)
    assert.strictEqual(subdominant.rootMidi - tonic.rootMidi, 5)
    assert.strictEqual(subdominant.romanNumeral, "IV/1st")
  })

  it("applies voice leading to beginner progressions", () => {
    const generator = new ChordGenerator()
    const progression = generator.generateProgressionFromRoman(["I", "V", "vi", "IV"], "C", "beginner")

    const noteExpectations = [
      [60, 64, 67],
      [59, 62, 67],
      [60, 64, 69],
      [60, 65, 69],
    ]

    const inversions = [0, 1, 1, 2]

    progression.chords.forEach((chord, index) => {
      assert.deepStrictEqual(chord.notes, noteExpectations[index])
      assert.strictEqual(chord.inversion ?? 0, inversions[index])
    })
  })
})
