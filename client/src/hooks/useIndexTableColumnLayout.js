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

function syncStickyHeaderLayout(tableRoot) {
  const tableHeadings = Array.from(
    tableRoot.querySelectorAll('[data-index-table-heading]')
  );
  const stickyHeadings = Array.from(
    tableRoot.querySelectorAll('[data-index-table-sticky-heading]')
  );

  if (tableHeadings.length === 0 || tableHeadings.length !== stickyHeadings.length) {
    return;
  }

  stickyHeadings.forEach((stickyHeading, index) => {
    const tableHeading = tableHeadings[index];
    if (!tableHeading || tableHeading.offsetWidth === 0) {
      return;
    }

    stickyHeading.style.minWidth = `${tableHeading.offsetWidth}px`;
  });

  // Polaris keeps the selectable creator column pinned. Its cloned header needs
  // the same offset after our colgroup changes the checkbox column width.
  if (tableHeadings.length > 1 && tableHeadings[0].offsetWidth > 0) {
    stickyHeadings[1].style.left = `${tableHeadings[0].offsetWidth}px`;
  }
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

    const syncLayout = () => {
      applyColumnLayout(tableRoot);
      // Polaris measures the sticky header before this hook adds the colgroup.
      // Re-measure from the rendered table so the scrolled header uses its final widths.
      syncStickyHeaderLayout(tableRoot);
    };

    syncLayout();
    const frame = window.requestAnimationFrame(syncLayout);

    return () => window.cancelAnimationFrame(frame);
  }, [tableRootRef, ready]);
}
