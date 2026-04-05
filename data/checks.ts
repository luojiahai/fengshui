// data/checks.ts
import type { Check, StepKey } from '~/types/fengshui'

// External: checks.extCelestial.*
const extCelestial: Check = {
  id: 'ext-celestial',
  question: 'checks.extCelestial.question',
  info: 'checks.extCelestial.info',
  multiSelect: true,
  options: [
    { id: 'green-dragon',   label: 'checks.extCelestial.options.greenDragon.label',   score: 3 },
    { id: 'white-tiger',    label: 'checks.extCelestial.options.whiteTiger.label',    score: 3 },
    { id: 'red-phoenix',    label: 'checks.extCelestial.options.redPhoenix.label',    score: 3 },
    { id: 'black-tortoise', label: 'checks.extCelestial.options.blackTortoise.label', score: 3 },
  ],
}

const extSha: Check = {
  id: 'ext-sha',
  question: 'checks.extSha.question',
  info: 'checks.extSha.info',
  multiSelect: true,
  options: [
    { id: 'road-rush',      label: 'checks.extSha.options.roadRush.label',      score: -4, remedy: 'checks.extSha.options.roadRush.remedy' },
    { id: 'sharp-corner',   label: 'checks.extSha.options.sharpCorner.label',   score: -3, remedy: 'checks.extSha.options.sharpCorner.remedy' },
    { id: 'reverse-bow',    label: 'checks.extSha.options.reverseBow.label',    score: -3, remedy: 'checks.extSha.options.reverseBow.remedy' },
    { id: 'heavens-blade',  label: 'checks.extSha.options.heavensBlade.label',  score: -3, remedy: 'checks.extSha.options.heavensBlade.remedy' },
    { id: 'piercing-heart', label: 'checks.extSha.options.piercingHeart.label', score: -4, remedy: 'checks.extSha.options.piercingHeart.remedy' },
    { id: 'light-sha',      label: 'checks.extSha.options.lightSha.label',      score: -2, remedy: 'checks.extSha.options.lightSha.remedy' },
  ],
}

const extSurroundings: Check = {
  id: 'ext-surroundings',
  question: 'checks.extSurroundings.question',
  multiSelect: true,
  options: [
    { id: 'yin',  label: 'checks.extSurroundings.options.yin.label',  score: -3, remedy: 'checks.extSurroundings.options.yin.remedy' },
    { id: 'yang', label: 'checks.extSurroundings.options.yang.label', score: 3 },
  ],
}

const entDoorFaces: Check = {
  id: 'ent-door-faces',
  question: 'checks.entDoorFaces.question',
  info: 'checks.entDoorFaces.info',
  multiSelect: true,
  options: [
    { id: 'elevator', label: 'checks.entDoorFaces.options.elevator.label', score: -3, remedy: 'checks.entDoorFaces.options.elevator.remedy' },
    { id: 'bathroom', label: 'checks.entDoorFaces.options.bathroom.label', score: -3, remedy: 'checks.entDoorFaces.options.bathroom.remedy' },
    { id: 'kitchen',  label: 'checks.entDoorFaces.options.kitchen.label',  score: -2, remedy: 'checks.entDoorFaces.options.kitchen.remedy' },
    { id: 'balcony',  label: 'checks.entDoorFaces.options.balcony.label',  score: -3, remedy: 'checks.entDoorFaces.options.balcony.remedy' },
  ],
}

const entLight: Check = {
  id: 'ent-light',
  question: 'checks.entLight.question',
  multiSelect: false,
  options: [
    { id: 'good', label: 'checks.entLight.options.good.label', score: 2 },
    { id: 'poor', label: 'checks.entLight.options.poor.label', score: -1, remedy: 'checks.entLight.options.poor.remedy' },
  ],
}

const entClutter: Check = {
  id: 'ent-clutter',
  question: 'checks.entClutter.question',
  multiSelect: false,
  options: [
    { id: 'clean',     label: 'checks.entClutter.options.clean.label',     score: 2 },
    { id: 'cluttered', label: 'checks.entClutter.options.cluttered.label', score: -2, remedy: 'checks.entClutter.options.cluttered.remedy' },
  ],
}

const lrPosition: Check = {
  id: 'lr-position',
  question: 'checks.lrPosition.question',
  info: 'checks.lrPosition.info',
  multiSelect: false,
  options: [
    { id: 'front', label: 'checks.lrPosition.options.front.label', score: 3 },
    { id: 'back',  label: 'checks.lrPosition.options.back.label',  score: -2, remedy: 'checks.lrPosition.options.back.remedy' },
  ],
}

const lrSofa: Check = {
  id: 'lr-sofa',
  question: 'checks.lrSofa.question',
  info: 'checks.lrSofa.info',
  multiSelect: false,
  options: [
    { id: 'solid-wall', label: 'checks.lrSofa.options.solidWall.label', score: 3 },
    { id: 'window',     label: 'checks.lrSofa.options.window.label',    score: -2, remedy: 'checks.lrSofa.options.window.remedy' },
    { id: 'open-space', label: 'checks.lrSofa.options.openSpace.label', score: -3, remedy: 'checks.lrSofa.options.openSpace.remedy' },
  ],
}

const lrLight: Check = {
  id: 'lr-light',
  question: 'checks.lrLight.question',
  multiSelect: false,
  options: [
    { id: 'good', label: 'checks.lrLight.options.good.label', score: 2 },
    { id: 'poor', label: 'checks.lrLight.options.poor.label', score: -1, remedy: 'checks.lrLight.options.poor.remedy' },
  ],
}

const kitStoveSink: Check = {
  id: 'kit-stove-sink',
  question: 'checks.kitStoveSink.question',
  info: 'checks.kitStoveSink.info',
  multiSelect: false,
  options: [
    { id: 'separate', label: 'checks.kitStoveSink.options.separate.label', score: 3 },
    { id: 'adjacent', label: 'checks.kitStoveSink.options.adjacent.label', score: -3, remedy: 'checks.kitStoveSink.options.adjacent.remedy' },
  ],
}

const kitStoveBack: Check = {
  id: 'kit-stove-back',
  question: 'checks.kitStoveBack.question',
  multiSelect: false,
  options: [
    { id: 'wall',   label: 'checks.kitStoveBack.options.wall.label',   score: 2 },
    { id: 'window', label: 'checks.kitStoveBack.options.window.label', score: -2, remedy: 'checks.kitStoveBack.options.window.remedy' },
  ],
}

const kitBathroom: Check = {
  id: 'kit-bathroom',
  question: 'checks.kitBathroom.question',
  multiSelect: false,
  options: [
    { id: 'separate', label: 'checks.kitBathroom.options.separate.label', score: 2 },
    { id: 'adjacent', label: 'checks.kitBathroom.options.adjacent.label', score: -2, remedy: 'checks.kitBathroom.options.adjacent.remedy' },
  ],
}

const bedDirection: Check = {
  id: 'bed-direction',
  question: 'checks.bedDirection.question',
  info: 'checks.bedDirection.info',
  multiSelect: false,
  options: [
    { id: 'north-south', label: 'checks.bedDirection.options.northSouth.label', score: 2 },
    { id: 'east-west',   label: 'checks.bedDirection.options.eastWest.label',   score: -2, remedy: 'checks.bedDirection.options.eastWest.remedy' },
  ],
}

const bedHeadwall: Check = {
  id: 'bed-headwall',
  question: 'checks.bedHeadwall.question',
  multiSelect: false,
  options: [
    { id: 'solid-wall', label: 'checks.bedHeadwall.options.solidWall.label', score: 3 },
    { id: 'window',     label: 'checks.bedHeadwall.options.window.label',    score: -3, remedy: 'checks.bedHeadwall.options.window.remedy' },
  ],
}

const bedDoor: Check = {
  id: 'bed-door',
  question: 'checks.bedDoor.question',
  multiSelect: false,
  options: [
    { id: 'not-facing', label: 'checks.bedDoor.options.notFacing.label', score: 2 },
    { id: 'facing',     label: 'checks.bedDoor.options.facing.label',    score: -3, remedy: 'checks.bedDoor.options.facing.remedy' },
  ],
}

const bedMirror: Check = {
  id: 'bed-mirror',
  question: 'checks.bedMirror.question',
  multiSelect: false,
  options: [
    { id: 'not-facing', label: 'checks.bedMirror.options.notFacing.label', score: 2 },
    { id: 'facing',     label: 'checks.bedMirror.options.facing.label',    score: -2, remedy: 'checks.bedMirror.options.facing.remedy' },
  ],
}

const bathCenter: Check = {
  id: 'bath-center',
  question: 'checks.bathCenter.question',
  info: 'checks.bathCenter.info',
  multiSelect: false,
  options: [
    { id: 'not-center', label: 'checks.bathCenter.options.notCenter.label', score: 2 },
    { id: 'center',     label: 'checks.bathCenter.options.center.label',    score: -3, remedy: 'checks.bathCenter.options.center.remedy' },
  ],
}

const bathDoor: Check = {
  id: 'bath-door',
  question: 'checks.bathDoor.question',
  multiSelect: false,
  options: [
    { id: 'not-facing', label: 'checks.bathDoor.options.notFacing.label', score: 2 },
    { id: 'facing',     label: 'checks.bathDoor.options.facing.label',    score: -3, remedy: 'checks.bathDoor.options.facing.remedy' },
  ],
}

export const stepChecks: Record<StepKey, Check[]> = {
  external:   [extCelestial, extSha, extSurroundings],
  entrance:   [entDoorFaces, entLight, entClutter],
  livingRoom: [lrPosition, lrSofa, lrLight],
  kitchen:    [kitStoveSink, kitStoveBack, kitBathroom],
  bedroom:    [bedDirection, bedHeadwall, bedDoor, bedMirror],
  bathroom:   [bathCenter, bathDoor],
}

export const stepCheckIds: Record<StepKey, string[]> = Object.fromEntries(
  Object.entries(stepChecks).map(([key, checks]) => [key, checks.map(c => c.id)])
) as Record<StepKey, string[]>  // Object.fromEntries loses key-type narrowing; safe because stepChecks is keyed by StepKey

export const sectionMinMax: Record<StepKey, { min: number; max: number }> = {
  external:   { min: -22, max: 15 },
  entrance:   { min: -14, max: 4  },
  livingRoom: { min: -6,  max: 8  },
  kitchen:    { min: -7,  max: 7  },
  bedroom:    { min: -10, max: 9  },
  bathroom:   { min: -6,  max: 4  },
}
