import { tags } from '@util/dom';
import translate from '@util/translate';
import { rows, cols } from './data';

export default function HomeView({ showButton, onClickStart }) {
  const { div, span, table, thead, tr, th, tbody, td } = tags;

  return div(
    { class: 'home' },
    span({ class: 'title' }, translate('home.title')),
    table(
      { class: 'table' },
      thead(
        { class: 'thead' },
        tr(
          cols.map(h =>
            th(
              { class: 'half' },
              span({ class: `cell ${h.row}` }, translate(h.name))
            )
          )
        )
      ),
      tbody(
        rows.map(row =>
          tr(
            Object.keys(row).map((key, i) =>
              td(span({ class: `cell ${key}` }, translate(row[cols[i].row])))
            )
          )
        )
      )
    ),
    div(
      {
        class: 'button',
        id: 'button',
        onclick: onClickStart,
        style: () => `display: ${showButton.val ? 'block' : 'none'}`,
      },
      span(translate('home.play'))
    )
  );
}
