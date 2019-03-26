export default class Table {
  constructor(data) {
    this.view = document.createElement('table');
    const tbody = document.createElement('tbody');
    const thead = document.createElement('thead');
    const theadr = document.createElement('tr');

    this.view.setAttribute('class', 'table');
    thead.setAttribute('class', 'thead');

    this.view.appendChild(thead);
    this.view.appendChild(tbody);
    thead.appendChild(theadr);

    data.ids.forEach((id) => {
      const th = document.createElement('th');
      th.setAttribute('class', 'half-width');
      const span = document.createElement('span');
      const text = document.createTextNode(id);

      span.setAttribute('class', ['cell', id].join(' '));
      theadr.appendChild(th);
      th.appendChild(span);
      span.appendChild(text);
    });

    data.rows.forEach((row) => {
      const tr = document.createElement('tr');
      tbody.appendChild(tr);

      data.ids.forEach((id) => {
        const td = document.createElement('td', ['half-width']);
        const span = document.createElement('span');
        const text = document.createTextNode(row[id]);

        span.setAttribute('class', ['cell', id].join(' '));
        span.appendChild(text);
        td.appendChild(span);
        tr.appendChild(td);
      });
    });
  }
}
