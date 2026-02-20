import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Layout, AlertTriangle, Type, Heading1, Heading2, List, ListOrdered, Quote, Code } from 'lucide-react';
import { clsx } from 'clsx';

export const CommandList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command(item);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  return (
    <div className="flex flex-col p-1 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden min-w-[200px]">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 py-1 mb-1">
        Blocks
      </div>
      {props.items.length ? (
        props.items.map((item: any, index: number) => (
          <button
            className={clsx(
              "flex items-center gap-2 px-2 py-1.5 text-sm text-left rounded-md transition-colors",
              index === selectedIndex ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
            )}
            key={index}
            onClick={() => selectItem(index)}
          >
            {item.icon}
            <div className="flex flex-col">
              <span className="font-medium text-xs">{item.title}</span>
            </div>
          </button>
        ))
      ) : (
        <div className="px-2 py-2 text-sm text-gray-400">No results</div>
      )}
    </div>
  );
});
