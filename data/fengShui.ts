export type FengShuiItem = {
  id: string;
  labelKey: string;
  adviceKey: string;
  score: number;
};

export const fengShuiCategoryItems: Record<string, FengShuiItem[]> = {
  door: [
    {
      id: "doorSouth",
      labelKey: "fengShuiItems.door.doorSouth.label",
      adviceKey: "fengShuiItems.door.doorSouth.advice",
      score: 3,
    },
    {
      id: "doorEast",
      labelKey: "fengShuiItems.door.doorEast.label",
      adviceKey: "fengShuiItems.door.doorEast.advice",
      score: 2,
    },
    {
      id: "doorMintang",
      labelKey: "fengShuiItems.door.doorMintang.label",
      adviceKey: "fengShuiItems.door.doorMintang.advice",
      score: 3,
    },
    {
      id: "doorUnluckyDirection",
      labelKey: "fengShuiItems.door.doorUnluckyDirection.label",
      adviceKey: "fengShuiItems.door.doorUnluckyDirection.advice",
      score: -2,
    },
    {
      id: "doorLongCorridor",
      labelKey: "fengShuiItems.door.doorLongCorridor.label",
      adviceKey: "fengShuiItems.door.doorLongCorridor.advice",
      score: -3,
    },
    {
      id: "doorElevator",
      labelKey: "fengShuiItems.door.doorElevator.label",
      adviceKey: "fengShuiItems.door.doorElevator.advice",
      score: -2,
    },
    {
      id: "doorSeeRed",
      labelKey: "fengShuiItems.door.doorSeeRed.label",
      adviceKey: "fengShuiItems.door.doorSeeRed.advice",
      score: 2,
    },
    {
      id: "doorSeeGreen",
      labelKey: "fengShuiItems.door.doorSeeGreen.label",
      adviceKey: "fengShuiItems.door.doorSeeGreen.advice",
      score: 2,
    },
    {
      id: "doorSeePainting",
      labelKey: "fengShuiItems.door.doorSeePainting.label",
      adviceKey: "fengShuiItems.door.doorSeePainting.advice",
      score: 2,
    },
    {
      id: "doorSeeStove",
      labelKey: "fengShuiItems.door.doorSeeStove.label",
      adviceKey: "fengShuiItems.door.doorSeeStove.advice",
      score: -3,
    },
    {
      id: "doorSeeToilet",
      labelKey: "fengShuiItems.door.doorSeeToilet.label",
      adviceKey: "fengShuiItems.door.doorSeeToilet.advice",
      score: -3,
    },
    {
      id: "doorSeeMirror",
      labelKey: "fengShuiItems.door.doorSeeMirror.label",
      adviceKey: "fengShuiItems.door.doorSeeMirror.advice",
      score: -2,
    },
  ],

  entryway: [
    {
      id: "entryBrightClean",
      labelKey: "fengShuiItems.entryway.entryBrightClean.label",
      adviceKey: "fengShuiItems.entryway.entryBrightClean.advice",
      score: 3,
    },
    {
      id: "entryHighCeiling",
      labelKey: "fengShuiItems.entryway.entryHighCeiling.label",
      adviceKey: "fengShuiItems.entryway.entryHighCeiling.advice",
      score: 2,
    },
    {
      id: "entryTransparent",
      labelKey: "fengShuiItems.entryway.entryTransparent.label",
      adviceKey: "fengShuiItems.entryway.entryTransparent.advice",
      score: 2,
    },
    {
      id: "entryDarkMessy",
      labelKey: "fengShuiItems.entryway.entryDarkMessy.label",
      adviceKey: "fengShuiItems.entryway.entryDarkMessy.advice",
      score: -3,
    },
    {
      id: "entrySharpCornerAttack",
      labelKey: "fengShuiItems.entryway.entrySharpCornerAttack.label",
      adviceKey: "fengShuiItems.entryway.entrySharpCornerAttack.advice",
      score: -2,
    },
    {
      id: "entryLowCeiling",
      labelKey: "fengShuiItems.entryway.entryLowCeiling.label",
      adviceKey: "fengShuiItems.entryway.entryLowCeiling.advice",
      score: -2,
    },
  ],

  livingRoom: [
    {
      id: "livingSofaWall",
      labelKey: "fengShuiItems.livingRoom.livingSofaWall.label",
      adviceKey: "fengShuiItems.livingRoom.livingSofaWall.advice",
      score: 3,
    },
    {
      id: "livingNoBeam",
      labelKey: "fengShuiItems.livingRoom.livingNoBeam.label",
      adviceKey: "fengShuiItems.livingRoom.livingNoBeam.advice",
      score: 3,
    },
    {
      id: "livingSofaCurve",
      labelKey: "fengShuiItems.livingRoom.livingSofaCurve.label",
      adviceKey: "fengShuiItems.livingRoom.livingSofaCurve.advice",
      score: 2,
    },
    {
      id: "livingSofaBackWater",
      labelKey: "fengShuiItems.livingRoom.livingSofaBackWater.label",
      adviceKey: "fengShuiItems.livingRoom.livingSofaBackWater.advice",
      score: -3,
    },
    {
      id: "livingSofaFaceDoor",
      labelKey: "fengShuiItems.livingRoom.livingSofaFaceDoor.label",
      adviceKey: "fengShuiItems.livingRoom.livingSofaFaceDoor.advice",
      score: -2,
    },
    {
      id: "livingDirectLight",
      labelKey: "fengShuiItems.livingRoom.livingDirectLight.label",
      adviceKey: "fengShuiItems.livingRoom.livingDirectLight.advice",
      score: -2,
    },
    {
      id: "livingSquareShape",
      labelKey: "fengShuiItems.livingRoom.livingSquareShape.label",
      adviceKey: "fengShuiItems.livingRoom.livingSquareShape.advice",
      score: 3,
    },
    {
      id: "livingSharpCornerFixed",
      labelKey: "fengShuiItems.livingRoom.livingSharpCornerFixed.label",
      adviceKey: "fengShuiItems.livingRoom.livingSharpCornerFixed.advice",
      score: 2,
    },
    {
      id: "livingIsolatedColumn",
      labelKey: "fengShuiItems.livingRoom.livingIsolatedColumn.label",
      adviceKey: "fengShuiItems.livingRoom.livingIsolatedColumn.advice",
      score: -2,
    },
    {
      id: "livingSharpCornerUnfixed",
      labelKey: "fengShuiItems.livingRoom.livingSharpCornerUnfixed.label",
      adviceKey: "fengShuiItems.livingRoom.livingSharpCornerUnfixed.advice",
      score: -3,
    },
  ],

  bedroom: [
    {
      id: "bedHeadWall",
      labelKey: "fengShuiItems.bedroom.bedHeadWall.label",
      adviceKey: "fengShuiItems.bedroom.bedHeadWall.advice",
      score: 3,
    },
    {
      id: "bedNorthSouth",
      labelKey: "fengShuiItems.bedroom.bedNorthSouth.label",
      adviceKey: "fengShuiItems.bedroom.bedNorthSouth.advice",
      score: 3,
    },
    {
      id: "bedChildEast",
      labelKey: "fengShuiItems.bedroom.bedChildEast.label",
      adviceKey: "fengShuiItems.bedroom.bedChildEast.advice",
      score: 2,
    },
    {
      id: "bedBeamPress",
      labelKey: "fengShuiItems.bedroom.bedBeamPress.label",
      adviceKey: "fengShuiItems.bedroom.bedBeamPress.advice",
      score: -3,
    },
    {
      id: "bedFaceWest",
      labelKey: "fengShuiItems.bedroom.bedFaceWest.label",
      adviceKey: "fengShuiItems.bedroom.bedFaceWest.advice",
      score: -2,
    },
    {
      id: "bedFaceMirror",
      labelKey: "fengShuiItems.bedroom.bedFaceMirror.label",
      adviceKey: "fengShuiItems.bedroom.bedFaceMirror.advice",
      score: -3,
    },
  ],

  study: [
    {
      id: "studyDeskWall",
      labelKey: "fengShuiItems.study.studyDeskWall.label",
      adviceKey: "fengShuiItems.study.studyDeskWall.advice",
      score: 3,
    },
    {
      id: "studyFacingWindow",
      labelKey: "fengShuiItems.study.studyFacingWindow.label",
      adviceKey: "fengShuiItems.study.studyFacingWindow.advice",
      score: 2,
    },
    {
      id: "studyPlant",
      labelKey: "fengShuiItems.study.studyPlant.label",
      adviceKey: "fengShuiItems.study.studyPlant.advice",
      score: 2,
    },
    {
      id: "studyDoorKitchenToilet",
      labelKey: "fengShuiItems.study.studyDoorKitchenToilet.label",
      adviceKey: "fengShuiItems.study.studyDoorKitchenToilet.advice",
      score: -3,
    },
    {
      id: "studyWallToilet",
      labelKey: "fengShuiItems.study.studyWallToilet.label",
      adviceKey: "fengShuiItems.study.studyWallToilet.advice",
      score: -2,
    },
  ],

  kitchen: [
    {
      id: "kitchenEast",
      labelKey: "fengShuiItems.kitchen.kitchenEast.label",
      adviceKey: "fengShuiItems.kitchen.kitchenEast.advice",
      score: 3,
    },
    {
      id: "kitchenStoveWall",
      labelKey: "fengShuiItems.kitchen.kitchenStoveWall.label",
      adviceKey: "fengShuiItems.kitchen.kitchenStoveWall.advice",
      score: 2,
    },
    {
      id: "kitchenSouth",
      labelKey: "fengShuiItems.kitchen.kitchenSouth.label",
      adviceKey: "fengShuiItems.kitchen.kitchenSouth.advice",
      score: -3,
    },
    {
      id: "kitchenStoveBadFacing",
      labelKey: "fengShuiItems.kitchen.kitchenStoveBadFacing.label",
      adviceKey: "fengShuiItems.kitchen.kitchenStoveBadFacing.advice",
      score: -3,
    },
    {
      id: "kitchenStoveNoBack",
      labelKey: "fengShuiItems.kitchen.kitchenStoveNoBack.label",
      adviceKey: "fengShuiItems.kitchen.kitchenStoveNoBack.advice",
      score: -2,
    },
  ],

  diningRoom: [
    {
      id: "diningRoundSquare",
      labelKey: "fengShuiItems.diningRoom.diningRoundSquare.label",
      adviceKey: "fengShuiItems.diningRoom.diningRoundSquare.advice",
      score: 3,
    },
    {
      id: "diningSoftLight",
      labelKey: "fengShuiItems.diningRoom.diningSoftLight.label",
      adviceKey: "fengShuiItems.diningRoom.diningSoftLight.advice",
      score: 2,
    },
    {
      id: "diningSoftColor",
      labelKey: "fengShuiItems.diningRoom.diningSoftColor.label",
      adviceKey: "fengShuiItems.diningRoom.diningSoftColor.advice",
      score: 2,
    },
    {
      id: "diningSharpTable",
      labelKey: "fengShuiItems.diningRoom.diningSharpTable.label",
      adviceKey: "fengShuiItems.diningRoom.diningSharpTable.advice",
      score: -3,
    },
    {
      id: "diningDoorCollision",
      labelKey: "fengShuiItems.diningRoom.diningDoorCollision.label",
      adviceKey: "fengShuiItems.diningRoom.diningDoorCollision.advice",
      score: -2,
    },
  ],

  bathroom: [
    {
      id: "toiletGoodPosition",
      labelKey: "fengShuiItems.bathroom.toiletGoodPosition.label",
      adviceKey: "fengShuiItems.bathroom.toiletGoodPosition.advice",
      score: 3,
    },
    {
      id: "toiletDryVent",
      labelKey: "fengShuiItems.bathroom.toiletDryVent.label",
      adviceKey: "fengShuiItems.bathroom.toiletDryVent.advice",
      score: 3,
    },
    {
      id: "toiletFaceDoor",
      labelKey: "fengShuiItems.bathroom.toiletFaceDoor.label",
      adviceKey: "fengShuiItems.bathroom.toiletFaceDoor.advice",
      score: -3,
    },
    {
      id: "toiletSameDoorKitchen",
      labelKey: "fengShuiItems.bathroom.toiletSameDoorKitchen.label",
      adviceKey: "fengShuiItems.bathroom.toiletSameDoorKitchen.advice",
      score: -3,
    },
  ],

  overall: [
    {
      id: "houseBright",
      labelKey: "fengShuiItems.overall.houseBright.label",
      adviceKey: "fengShuiItems.overall.houseBright.advice",
      score: 3,
    },
    {
      id: "houseVentilation",
      labelKey: "fengShuiItems.overall.houseVentilation.label",
      adviceKey: "fengShuiItems.overall.houseVentilation.advice",
      score: 3,
    },
    {
      id: "houseSmoothLayout",
      labelKey: "fengShuiItems.overall.houseSmoothLayout.label",
      adviceKey: "fengShuiItems.overall.houseSmoothLayout.advice",
      score: 2,
    },
    {
      id: "houseDarkDamp",
      labelKey: "fengShuiItems.overall.houseDarkDamp.label",
      adviceKey: "fengShuiItems.overall.houseDarkDamp.advice",
      score: -3,
    },
    {
      id: "houseNoAirflow",
      labelKey: "fengShuiItems.overall.houseNoAirflow.label",
      adviceKey: "fengShuiItems.overall.houseNoAirflow.advice",
      score: -3,
    },
  ],
};

export const fengShuiItems: FengShuiItem[] = Object.values(
  fengShuiCategoryItems
).flat();
