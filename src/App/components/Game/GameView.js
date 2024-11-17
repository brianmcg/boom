import { tags } from '@util/dom';

export default function GameView({ canvas }) {
  return tags.div({ class: 'game' }, canvas);
}
