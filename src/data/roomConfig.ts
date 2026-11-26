/**
 * Shared spatial configuration for Room 1 (Cozy Couple Room)
 * and Room 2 (Garden Museum Room) connected via the East doorway.
 */

export const ROOM1_SIZE = 10;
export const ROOM1_HALF = ROOM1_SIZE / 2; // 5.0
export const ROOM1_WALL_HEIGHT = 3.5;

export const DOOR_X_START = 5.0;
export const DOOR_X_END = 5.4;
export const DOOR_Z = 0;
export const DOOR_WIDTH = 1.7;
export const DOOR_HEIGHT = 2.45;

export const MUSEUM_WIDTH = 16; // X: 5.4 -> 21.4
export const MUSEUM_DEPTH = 16; // Z: -8.0 -> +8.0
export const MUSEUM_CENTER_X = DOOR_X_END + MUSEUM_WIDTH / 2; // 13.4
export const MUSEUM_CENTER_Z = 0;
export const MUSEUM_HALF_X = MUSEUM_WIDTH / 2; // 8.0
export const MUSEUM_HALF_Z = MUSEUM_DEPTH / 2; // 8.0
export const MUSEUM_MIN_X = DOOR_X_END; // 5.4
export const MUSEUM_MAX_X = DOOR_X_END + MUSEUM_WIDTH; // 21.4
export const MUSEUM_MIN_Z = -MUSEUM_HALF_Z; // -8.0
export const MUSEUM_MAX_Z = MUSEUM_HALF_Z; // +8.0
export const MUSEUM_WALL_HEIGHT = 4.0;
export const WALL_THICKNESS = 0.2;

export const CHAR_MARGIN = 0.45;
export const DOOR_PASS_HALF_Z = 0.52;
