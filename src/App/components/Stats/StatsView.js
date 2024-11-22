import { tags } from '@util/dom';

export default function GameView({ child }) {
  return tags.div({ class: 'stats' }, child);
}
