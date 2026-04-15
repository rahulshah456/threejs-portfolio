const mathRandom = (num = 8) => -Math.random() * num + Math.random() * num;

export interface BuildingData {
  scaleY: number;
  scaleXZ: number;
  posX: number;
  posZ: number;
}

export const buildings: BuildingData[] = Array.from({ length: 99 }, () => ({
  scaleY: 0.1 + Math.abs(mathRandom(8)),
  scaleXZ: 0.9 + mathRandom(0.1),
  posX: Math.round(mathRandom()),
  posZ: Math.round(mathRandom()),
}));
