export const GAME_CONFIG = {
  RAIL_CENTER_X: 300,
  GAP: 45,
  BOTTOM_Y: 500,
  INITIAL_TIME: 60,
  GAME_OVER_DELAY: 2000,
  FEEDBACK_DURATION: 500,
};

export const getStaticY = (index) =>
  GAME_CONFIG.BOTTOM_Y - index * GAME_CONFIG.GAP;
