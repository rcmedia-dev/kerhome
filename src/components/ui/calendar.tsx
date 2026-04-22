'use client';

import * as React from 'react';
import { DayPicker } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ptBR } from 'date-fns/locale';

import 'react-day-picker/dist/style.css';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ptBR}
      components={{
        IconLeft: () => <ChevronLeft size={16} />,
        IconRight: () => <ChevronRight size={16} />,
      }}
      classNames={{
        months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
        month: 'space-y-4 w-full',
        caption: 'flex justify-center pt-1 relative items-center mb-2',
        caption_label: 'text-sm font-semibold text-gray-900 capitalize',
        nav: 'space-x-1 flex items-center',
        nav_button:
          'h-7 w-7 bg-transparent p-0 flex items-center justify-center rounded-full hover:bg-purple-100 text-gray-600 hover:text-purple-700 transition-colors',
        nav_button_previous: 'absolute left-1',
        nav_button_next: 'absolute right-1',
        table: 'w-full border-collapse space-y-1',
        head_row: 'flex',
        head_cell: 'text-gray-400 rounded-md w-9 font-normal text-[0.8rem] flex-1 text-center',
        row: 'flex w-full mt-2',
        cell: 'flex-1 h-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20',
        day: 'h-9 w-9 mx-auto p-0 font-normal rounded-full flex items-center justify-center transition-colors hover:bg-purple-100 hover:text-purple-700 cursor-pointer aria-selected:opacity-100',
        day_selected:
          'bg-purple-600 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white rounded-full',
        day_today: 'bg-orange-100 text-orange-700 font-semibold',
        day_outside: 'text-gray-300 opacity-50',
        day_disabled: 'text-gray-300 opacity-40 cursor-not-allowed hover:bg-transparent hover:text-gray-300',
        day_range_middle: 'aria-selected:bg-purple-100 aria-selected:text-purple-700',
        day_hidden: 'invisible',
        ...classNames,
      }}
      {...props}
    />
  );
}

Calendar.displayName = 'Calendar';

export { Calendar };
