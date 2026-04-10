// DataTable.jsx
import React, { useEffect, useRef } from 'react';
import { FiLoader } from 'react-icons/fi';

export default function DataTable({
  columns = [],
  data = [],
  selectable = false,
  selected = [],
  onSelect = () => {},
  onSelectAll = () => {},
  actions = null,
  emptyMessage = 'No records found',
  keyField = '', // default key field
  loading = false, //
  showCheckboxes = true, // control checkbox visibility
  highlightedItemId = null, // for highlighting specific row
  getRowId = (row) => {
    const id = keyField ? row[keyField] : row.id;
    return id !== undefined && id !== null ? String(id) : '';
  }, // function to get row ID
  itemLabel = 'item', // dynamic label for results count
}) {
  const allSelected = data.length > 0 && selected.length === data.length;
  const headerCheckboxRef = useRef();

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = false; // disable dash state
    }
  }, [selected, allSelected]);

  const handleRowSelect = (id) => {
    if (selected.includes(id)) {
      onSelect(selected.filter((sid) => sid !== id));
    } else {
      onSelect([...selected, id]);
    }
  };

  return (
    <div>
      {/* Results Count */}
      <div className="mb-3 text-sm text-gray-600 font-medium">
        Results: {String(data.length || 0)} {data.length === 1 ? itemLabel : `${itemLabel}s`} 
      </div>
      <div className="overflow-y-auto max-h-[400px] overflow-x-auto shadow rounded-md">
      <table className="w-full text-left border-gray-300 border-1 min-w-max text-xs sm:text-sm">
        <thead className="bg-white border-b-2 border-gray-400 sticky top-0 z-10">
          <tr>
            {selectable && showCheckboxes && (
              <th className="p-3 cursor-pointer sticky left-0 bg-white shadow-[4px_0_4px_rgba(0,0,0,0.1)] z-30" onClick={() => onSelectAll(allSelected ? [] : data.map((d) => getRowId(d)))}>
                <input
                  ref={headerCheckboxRef}
                  type="checkbox"
                  title="Select All"
                  checked={Boolean(allSelected)}
                  readOnly
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={`p-3 font-semibold text-gray-700 whitespace-nowrap ${
                  col.className || ''
                } ${col.sticky ? 'sticky right-0 sm:static ' : ''}`}
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="p-3 font-semibold text-gray-700 sticky right-0 bg-white shadow-[-4px_0_4px_rgba(0,0,0,0.1)] z-30 min-w-[120px]">
                Action
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={
                  columns.length + (selectable && showCheckboxes ? 1 : 0) + (actions ? 1 : 0)
                }
                className="p-6 text-center text-gray-600"
              >
                <div className="flex items-center justify-center gap-2">
                  <FiLoader className="w-5 h-5 animate-spin text-green-500" />
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((row) => {
              const rowId = getRowId(row);
              const isSelected = selected.includes(rowId);
              const isHighlighted = highlightedItemId && getRowId(row) === highlightedItemId;

              return (
                <tr
                  key={rowId}
                  id={isHighlighted ? `highlight-${highlightedItemId}` : undefined}
                  onClick={() => selectable && handleRowSelect(rowId)}
                  className={`transition-all duration-300 ${row.className || ''} ${
                    isHighlighted && isSelected 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                      : isHighlighted 
                        ? 'bg-gradient-to-r from-yellow-200 to-yellow-300 border-l-4 border-yellow-500 shadow-lg animate-pulse' 
                        : isSelected 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' 
                          : row.className 
                            ? '' 
                            : 'hover:bg-green-100'
                  }`}
                >
                  {selectable && showCheckboxes && (
                    <td className={`p-3 cursor-pointer sticky left-0 ${isSelected ? 'bg-green-100' : 'bg-white'} shadow-[4px_0_4px_rgba(0,0,0,0.1)] z-5`}>
                      <input
                        title="Select Row"
                        type="checkbox"
                        checked={Boolean(isSelected)}
                        onChange={(e) => { e.stopPropagation(); handleRowSelect(rowId); }}
                      />
                    </td>
                  )}
                  {columns.map((col) => {
                    const cellValue = row[col.key];
                    const displayValue = cellValue === null || cellValue === undefined ? '' : String(cellValue);
                    return (
                      <td
                        key={col.key}
                        className={`p-3 ${col.className || ''} ${
                          col.sticky ? 'sticky right-0 sm:static' : ''
                        }`}
                      >
                        {col.render
                          ? col.render(cellValue, row)
                          : displayValue}
                      </td>
                    );
                  })}

                  {actions && (
                    <td className="p-3 sticky right-0 bg-white shadow-lg z-5 min-w-[120px] md:bg-gray-50">
                      {actions(row)}
                    </td>
                  )}
                </tr>
              );
            })
          ) : (
            <tr>
              <td
                colSpan={
                  columns.length + (selectable && showCheckboxes ? 1 : 0) + (actions ? 1 : 0)
                }
                className="p-4 text-center text-gray-500"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
