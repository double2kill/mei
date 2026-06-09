import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ReactNode } from "react";

type SortableCardGridProps = {
  ids: string[];
  onReorder: (ids: string[]) => void;
  renderCard: (id: string, dragHandle: ReactNode, dragging: boolean) => ReactNode;
};

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (handle: ReactNode, dragging: boolean) => ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handle = (
    <button
      type="button"
      aria-label="拖拽排序"
      className="touch-manipulation cursor-grab rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white active:cursor-grabbing"
      {...attributes}
      {...listeners}
    >
      ⠿
    </button>
  );

  return (
    <div ref={setNodeRef} style={style} className="h-full">
      {children(handle, isDragging)}
    </div>
  );
}

export function SortableCardGrid({
  ids,
  onReorder,
  renderCard,
}: SortableCardGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(String(active.id));
    const newIndex = ids.indexOf(String(over.id));
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
    >
      <SortableContext items={ids} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ids.map((id) => (
            <SortableItem key={id} id={id}>
              {(handle, dragging) => renderCard(id, handle, dragging)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
