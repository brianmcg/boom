/**
 * Class representing a table.
 */
class Table {
  /**
   * Creates a table.
   * @param  {Array} options.cols The column names.
   * @param  {Array} options.rows The row data.
   */
  constructor({ cols, rows }) {
    const tbody = document.createElement('tbody');
    const thead = document.createElement('thead');
    const theadr = document.createElement('tr');

    thead.setAttribute('class', 'thead');
    thead.appendChild(theadr);

    cols.forEach(id => {
      const th = document.createElement('th');
      const span = document.createElement('span');
      const text = document.createTextNode(id);

      th.setAttribute('class', 'half');
      span.setAttribute('class', ['cell', id].join(' '));
      theadr.appendChild(th);
      th.appendChild(span);
      span.appendChild(text);
    });

    rows.forEach(row => {
      const tr = document.createElement('tr');

      tbody.appendChild(tr);

      cols.forEach(id => {
        const td = document.createElement('td', ['half']);
        const span = document.createElement('span');
        const text = document.createTextNode(row[id]);

        span.setAttribute('class', ['cell', id].join(' '));
        span.appendChild(text);
        td.appendChild(span);
        tr.appendChild(td);
      });
    });

    this.view = document.createElement('table');
    this.view.setAttribute('class', 'table');
    this.view.appendChild(thead);
    this.view.appendChild(tbody);
  }
}

export default Table;
