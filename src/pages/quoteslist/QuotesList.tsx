import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  TouchSensor,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import type { ReactNode } from "react";
import Card from "../../components/common/card/Card";
import type { QuoteData } from "../../store/slices/quotesSlice";

import { useDispatch } from "react-redux"; // ✅ Import useDispatch
import { reorderQuotes } from "../../store/slices/quotesSlice"; // ✅ Import the new action
// ✅ 1. DEFINE the props for the component
interface QuotesListProps {
  quotes: QuoteData[];
}

// ✅ 2. ACCEPT the props in the component signature
const QuotesList = ({ quotes }: QuotesListProps) => {
  const dispatch = useDispatch();

  function SortableItem({ id, children }: { id: string; children: ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition } =
      useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <li
        ref={setNodeRef}
        style={style}
        {...attributes}
        className="flex items-center gap-2"
      >
        {/* 👇 Drag Handle (on the left) */}
        <div
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-white touch-none"
        >
          {/* 6 dots grip icon (SVG) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            className="w-5 h-5"
          >
            <circle cx="5" cy="6" r="1.5" />
            <circle cx="5" cy="12" r="1.5" />
            <circle cx="5" cy="18" r="1.5" />
            <circle cx="11" cy="6" r="1.5" />
            <circle cx="11" cy="12" r="1.5" />
            <circle cx="11" cy="18" r="1.5" />
          </svg>
        </div>

        {/* 👇 Your card content */}
        <div className="flex-1">{children}</div>
      </li>
    );
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }, // desktop: small movement to start
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 150, tolerance: 5 }, // mobile: long press
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // ✅ CHANGED: Dispatch the reorder action to Redux
      dispatch(
        reorderQuotes({ activeId: String(active.id), overId: String(over.id) })
      );
    }
  };
  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={quotes.map((q) => q.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-4">
            {quotes.map((quote) => (
              <SortableItem key={quote.id} id={quote.id}>
                <Card className="bg-secondaryBg text-white rounded-xl w-full p-[10px] shadow-lg">
                  <h2 className="text-lg font-semibold text-white">
                    {quote.name}
                  </h2>
                  <p className="text-gray-400 text-sm font-medium">
                    {quote.trading_name}
                  </p>
                </Card>
              </SortableItem>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default QuotesList;
