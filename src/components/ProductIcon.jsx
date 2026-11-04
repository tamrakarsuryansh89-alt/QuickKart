import {
  Backpack, Package, PenLine, Pencil, Eraser, Highlighter, NotebookText,
  Calculator, DraftingCompass, Ruler, ClipboardList, Briefcase, FolderOpen,
} from "lucide-react";

const icons = {
  Backpack, Package, PenLine, Pencil, Eraser, Highlighter, NotebookText,
  Calculator, DraftingCompass, Ruler, ClipboardList, Briefcase, FolderOpen,
};

// small coloured tile with a line icon, tile colour depends on the category
export default function ProductIcon({ name, category, size = "large" }) {
  const Icon = icons[name] || Package;
  const tone = category ? category.toLowerCase().replace(/\s+/g, "-") : "all";
  const px = size === "large" ? 44 : 22;

  return (
    <div className={`icon-tile ${size} tone-${tone}`} aria-hidden="true">
      <Icon size={px} strokeWidth={1.7} />
    </div>
  );
}