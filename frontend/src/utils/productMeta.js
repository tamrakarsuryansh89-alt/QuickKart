import {
  Backpack,
  Package,
  PenLine,
  Pencil,
  Eraser,
  Highlighter,
  NotebookText,
  Calculator,
  DraftingCompass,
  Ruler,
  ClipboardList,
  Briefcase,
  FolderOpen,
} from 'lucide-react';

export const PRODUCT_ICONS = {
  Backpack,
  Package,
  PenLine,
  Pencil,
  Eraser,
  Highlighter,
  NotebookText,
  Calculator,
  DraftingCompass,
  Ruler,
  ClipboardList,
  Briefcase,
  FolderOpen,
};

export const ICON_NAMES = Object.keys(PRODUCT_ICONS);

export const CATEGORIES = ['Bundles', 'Writing', 'Calculators', 'Geometry', 'Exam Gear'];

export function productIcon(name) {
  return PRODUCT_ICONS[name] || Package;
}

export function validateProduct(form) {
  const errors = {};
  const name = form.name.trim();
  if (!name) errors.name = 'Enter a product name.';
  else if (name.length > 100) errors.name = 'Keep the name under 100 characters.';

  const price = Number(form.price);
  if (form.price === '' || Number.isNaN(price)) errors.price = 'Enter a price.';
  else if (price <= 0) errors.price = 'Price must be greater than zero.';

  if (!form.category.trim()) errors.category = 'Choose a category.';
  if (!form.time.trim()) errors.time = 'Enter a delivery time, for example 10 mins.';
  return errors;
}
