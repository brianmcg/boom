

const createElement = (tag, classes = []) => {
  const el = document.createElement(tag);

  if (classes) {
    el.setAttribute('class', classes.join(' '));
  }

  return el;
};

export const createTable = (data) => {
  const table = createElement('table');
  const tbody = createElement('tbody');
  const thead = createElement('thead');
  const theadr = createElement('tr');

  table.appendChild(thead);
  table.appendChild(tbody);
  thead.appendChild(theadr);

  data.ids.forEach((id) => {
    const th = createElement('th');
    const span = createElement('span', ['right', 'cell']);
    const text = document.createTextNode(id);

    theadr.appendChild(th);
    th.appendChild(span);
    span.appendChild(text);
  });

  data.rows.forEach((row) => {
    const tr = createElement('tr');
    tbody.appendChild(tr);

    data.ids.forEach((id) => {
      const td = createElement('td', ['half-width']);
      const span = createElement('span', ['right', 'cell', id]);
      const text = document.createTextNode(row[id]);

      span.appendChild(text);
      td.appendChild(span);
      tr.appendChild(td);
    });
  });

  return table;
};
