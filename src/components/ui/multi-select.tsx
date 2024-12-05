'use client';

import * as React from 'react';
import { Check, X } from 'lucide-react';
import { Badge } from './badge';
import { Command, CommandEmpty, CommandGroup, CommandItem } from './command';
import { Command as CommandPrimitive } from 'cmdk';

type Option = {
  label: string;
  value: string;
};

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (values: string[]) => void;
}

export function MultiSelect({ options, selected, onChange }: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleSelect = (value: string) => {
    onChange([...selected, value]);
  };

  return (
    <Command className="overflow-visible bg-white">
      <div className="group border border-input px-3 py-2 text-sm ring-offset-background rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex gap-1 flex-wrap">
          {selected.map((value) => {
            const option = options.find((o) => o.value === value);
            return (
              <Badge key={value} variant="secondary">
                {option?.label}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUnselect(value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleUnselect(value)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
          <CommandPrimitive.Input
            ref={inputRef}
            className="bg-transparent outline-none placeholder:text-muted-foreground flex-1"
            placeholder="Select..."
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && (
          <div className="absolute w-full z-10 top-0 rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
            <CommandGroup className="h-full overflow-auto">
              {options.map((option) => {
                const isSelected = selected.includes(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        handleUnselect(option.value);
                      } else {
                        handleSelect(option.value);
                      }
                      inputRef.current?.focus();
                    }}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        isSelected ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    {option.label}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </div>
        )}
      </div>
    </Command>
  );
} 