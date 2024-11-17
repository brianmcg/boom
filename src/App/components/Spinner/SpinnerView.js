import { tags } from '@util/dom';
import loadingGif from '@assets/images/spinner.gif';

export default function SpinnerView() {
  const { div, img } = tags;
  return div({ class: 'spinner' }, img({ src: loadingGif }));
}
