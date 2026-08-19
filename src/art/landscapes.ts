import type { IslandBiome } from './FloatingIsland';

/* One landscape palette per biome. The Learn screen blends between two of these
   as you scroll across a topic boundary, so the world you are walking through
   changes colour continuously rather than cutting. */

export interface Landscape {
  sky: string;
  mesaFar: string;
  mesaFarShade: string;
  mesaMid: string;
  mesaMidShade: string;
  ridge: string;
  basin: string;
  wallLeft: string;
  wallRight: string;
  fore: string;
  foreDeep: string;
  path: string;
  pathShade: string;
  plant: string;
  plantLit: string;
  bloom: string;
}

export const LANDSCAPES: Record<IslandBiome, Landscape> = {
  desert: {
    sky: '#FBE5E1',
    mesaFar: '#E0B3A2',
    mesaFarShade: '#D29F8C',
    mesaMid: '#C08B77',
    mesaMidShade: '#AC7460',
    ridge: '#B87A62',
    basin: '#EEDAC8',
    wallLeft: '#A9603F',
    wallRight: '#9C5236',
    fore: '#8A4527',
    foreDeep: '#7B3A22',
    path: '#FDF7EF',
    pathShade: '#E6CDB8',
    plant: '#0F6D55',
    plantLit: '#1B8A6B',
    bloom: '#F7D8D1',
  },
  savanna: {
    sky: '#F7F0DA',
    mesaFar: '#CBD98A',
    mesaFarShade: '#B8C776',
    mesaMid: '#A3B45E',
    mesaMidShade: '#8B9C4A',
    ridge: '#93A550',
    basin: '#EDE7C4',
    wallLeft: '#7C8A34',
    wallRight: '#6E7C2C',
    fore: '#5E6A22',
    foreDeep: '#4E5A1A',
    path: '#FAF6E4',
    pathShade: '#DCD5A8',
    plant: '#4A6B22',
    plantLit: '#7C9A34',
    bloom: '#E7A8C4',
  },
  jungle: {
    sky: '#E4F0DC',
    mesaFar: '#7FC48A',
    mesaFarShade: '#66B074',
    mesaMid: '#4E9C5E',
    mesaMidShade: '#3A8449',
    ridge: '#43904F',
    basin: '#E8EED2',
    wallLeft: '#2E7B3E',
    wallRight: '#256A34',
    fore: '#1C5628',
    foreDeep: '#14421E',
    path: '#F4FAE8',
    pathShade: '#CFDFB4',
    plant: '#1C7A3C',
    plantLit: '#8FD46A',
    bloom: '#F0F7C8',
  },
  tundra: {
    sky: '#E9F0F1',
    mesaFar: '#A8C2C6',
    mesaFarShade: '#93B0B6',
    mesaMid: '#7E9AA0',
    mesaMidShade: '#6A868C',
    ridge: '#749096',
    basin: '#DCE7E8',
    wallLeft: '#587076',
    wallRight: '#4E6B72',
    fore: '#40585E',
    foreDeep: '#34484E',
    path: '#F4FAFB',
    pathShade: '#C6D6D8',
    plant: '#2F5B57',
    plantLit: '#4E8078',
    bloom: '#C9E4E7',
  },
  forest: {
    sky: '#E7EFE3',
    mesaFar: '#8FB294',
    mesaFarShade: '#79A57F',
    mesaMid: '#628F69',
    mesaMidShade: '#4E7A55',
    ridge: '#558059',
    basin: '#E2EAD8',
    wallLeft: '#3E6B48',
    wallRight: '#345C3C',
    fore: '#2A4A30',
    foreDeep: '#22402A',
    path: '#F2F8EC',
    pathShade: '#C8D8BE',
    plant: '#1F4A2C',
    plantLit: '#6FA274',
    bloom: '#D8E8C8',
  },
  glacier: {
    sky: '#E7F5F8',
    mesaFar: '#A6DCE7',
    mesaFarShade: '#8CCBD9',
    mesaMid: '#69B6C9',
    mesaMidShade: '#55A0B4',
    ridge: '#5FA9BC',
    basin: '#DCEEF2',
    wallLeft: '#4A8EA2',
    wallRight: '#3D8296',
    fore: '#316E80',
    foreDeep: '#2A5F70',
    path: '#F6FCFD',
    pathShade: '#C2DEE6',
    plant: '#2F7488',
    plantLit: '#58A0B0',
    bloom: '#E4F6FA',
  },
  blossom: {
    sky: '#FBEDF0',
    mesaFar: '#F0B3C6',
    mesaFarShade: '#E4A0B6',
    mesaMid: '#D98BA6',
    mesaMidShade: '#C57892',
    ridge: '#CE8299',
    basin: '#F8E4E8',
    wallLeft: '#B8687F',
    wallRight: '#A85B78',
    fore: '#97506A',
    foreDeep: '#8C4359',
    path: '#FEF6F8',
    pathShade: '#ECCFD8',
    plant: '#B65C7C',
    plantLit: '#D98BA6',
    bloom: '#FBD9E3',
  },
};

const KEYS = Object.keys(LANDSCAPES.desert) as Array<keyof Landscape>;

function channels(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = channels(a);
  const [br, bg, bb] = channels(b);
  const to = (x: number, y: number) =>
    Math.round(x + (y - x) * t)
      .toString(16)
      .padStart(2, '0');
  return `#${to(ar, br)}${to(ag, bg)}${to(ab, bb)}`;
}

/** Blend two landscape palettes. `t` of 0 returns `a`, 1 returns `b`. */
export function mixLandscape(a: Landscape, b: Landscape, t: number): Landscape {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const out = {} as Landscape;
  for (const k of KEYS) out[k] = mixHex(a[k], b[k], t);
  return out;
}

/** A landscape colour as rgba, for translucent surfaces layered over the art. */
export function withAlpha(hex: string, alpha: number): string {
  const [r, g, b] = channels(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
