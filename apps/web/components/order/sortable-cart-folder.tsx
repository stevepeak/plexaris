import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

import { CartFolder, type CartFolderProps } from './cart-folder'

interface SortableCartFolderProps extends CartFolderProps {
  /** Ordered item ids inside this folder, used for inner SortableContext */
  itemIds: string[]
}

function EmptyDropZone({ folderId }: { folderId: string }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `${folderId}-empty`,
    data: { type: 'folder' as const, containerId: folderId },
  })

  return (
    <div
      ref={setNodeRef}
      className={`py-4 pl-8 text-xs text-muted-foreground ${isOver ? 'bg-accent' : ''}`}
    >
      Drag items here
    </div>
  )
}

export function SortableCartFolder({
  itemIds,
  children,
  ...props
}: SortableCartFolderProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props.id,
    data: { type: 'folder' as const },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'z-10 opacity-50' : undefined}
      {...attributes}
    >
      <div className="flex">
        <button
          ref={setActivatorNodeRef}
          type="button"
          className="flex shrink-0 cursor-grab items-center px-1 text-muted-foreground hover:text-foreground active:cursor-grabbing"
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <CartFolder {...props} open={props.open}>
            <SortableContext
              items={itemIds}
              strategy={verticalListSortingStrategy}
            >
              {children}
              {itemIds.length === 0 && <EmptyDropZone folderId={props.id} />}
            </SortableContext>
          </CartFolder>
        </div>
      </div>
    </div>
  )
}
