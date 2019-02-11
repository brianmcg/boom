import { SCREEN } from './config';

export const FONT_TYPES = {
  MAIN: 'main_font',
};

export const FONT_SIZES = {
  SMALL: `${SCREEN.HEIGHT / 15}px ${FONT_TYPES.MAIN}`,
  MEDIUM: `${SCREEN.HEIGHT / 10}px ${FONT_TYPES.MAIN}`,
  LARGE: `${SCREEN.HEIGHT / 5}px ${FONT_TYPES.MAIN}`,
};
