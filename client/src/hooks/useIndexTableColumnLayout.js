import { useLayoutEffect } from 'react';

const COLUMN_WIDTHS = ['4%', '23%', '11%', '8%', '12%', '14%', '14%', '14%'];

function colgroupMatches(colgroup) {
  if (!colgroup || colgroup.children.length !== COLUMN_WIDTHS.length) {
    return false;
  }

  return COLUMN_WIDTHS.every((width, index) => colgroup.children[index]?.style.width === width);
}

function applyColumnLayout(tableRoot) {
  if (!tableRoot) {
    return;
  }

  tableRoot.querySelectorAll('table').forEach((table) => {
    let colgroup = table.querySelector('colgroup[data-crm-column-layout]');
    if (colgroupMatches(colgroup)) {
      return;
    }

    if (!colgroup) {
      colgroup = document.createElement('colgroup');
      colgroup.setAttribute('data-crm-column-layout', 'true');
      table.prepend(colgroup);
    }

    colgroup.replaceChildren(
      ...COLUMN_WIDTHS.map((width) => {
        const col = document.createElement('col');
        col.style.width = width;
        return col;
      })
    );
  });
}

export function useIndexTableColumnLayout(tableRootRef, ready = true) {
  useLayoutEffect(() => {
    if (!ready) {
      return undefined;
    }

    const tableRoot = tableRootRef.current;
    if (!tableRoot) {
      return undefined;
    }

    applyColumnLayout(tableRoot);
    const frame = window.requestAnimationFrame(() => applyColumnLayout(tableRoot));

    return () => window.cancelAnimationFrame(frame);
  }, [tableRootRef, ready]);
}
