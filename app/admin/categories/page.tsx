"use client";

import { useState, useEffect } from "react";
import { getCategories, saveCategory, deleteCategory } from "./actions";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_published: boolean;
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setIsLoading(true);
    const data = await getCategories();
    setCategories(data);
    setIsLoading(false);
  };

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setName(category.name);
    setSlug(category.slug);
    setDescription(category.description || "");
    setSortOrder(category.sort_order);
    setIsPublished(category.is_published);
  };

  const handleCancel = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder(0);
    setIsPublished(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("categoryId", editingId || "new");
    formData.append("name", name);
    formData.append("slug", slug);
    formData.append("description", description);
    formData.append("sortOrder", sortOrder.toString());
    formData.append("isPublished", isPublished.toString());

    const res = await saveCategory(formData);
    if (res.success) {
      handleCancel();
      loadCategories();
    } else {
      alert(res.error || "Failed to save category");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        loadCategories();
      } catch (err: any) {
        alert(err.message || "Failed to delete category");
      }
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto text-ink-black">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold uppercase tracking-widest">
            Categories
          </h1>
          <p className="text-sm opacity-60 mt-1">
            Manage product categories and taxonomy
          </p>
        </div>
        {!editingId && (
          <button
            onClick={() => setEditingId("new")}
            className="bg-brand-red text-white px-6 py-2.5 font-bold uppercase text-xs tracking-widest rounded-sm hover:bg-ink-black transition-colors"
          >
            Add Category
          </button>
        )}
      </div>

      {editingId && (
        <form
          onSubmit={handleSubmit}
          className="bg-ivory-mist/50 p-6 rounded-md mb-8 border border-ink-black/10"
        >
          <h2 className="text-sm font-bold uppercase tracking-widest mb-4">
            {editingId === "new" ? "Create Category" : "Edit Category"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-60 mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white border border-ink-black/20 px-3 py-2 text-sm focus:border-brand-red outline-none rounded-sm"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-60 mb-1">
                Slug (Optional)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-generated if left blank"
                className="w-full bg-white border border-ink-black/20 px-3 py-2 text-sm focus:border-brand-red outline-none rounded-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-widest opacity-60 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-ink-black/20 px-3 py-2 text-sm focus:border-brand-red outline-none rounded-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest opacity-60 mb-1">
                Sort Order
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full bg-white border border-ink-black/20 px-3 py-2 text-sm focus:border-brand-red outline-none rounded-sm"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer mt-5">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="accent-brand-red"
                />
                <span className="text-sm uppercase tracking-widest font-bold">
                  Published
                </span>
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-ink-black/10">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-xs font-bold uppercase tracking-widest border border-ink-black/20 rounded-sm hover:bg-ink-black/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-brand-red text-white px-6 py-2 font-bold uppercase text-xs tracking-widest rounded-sm hover:bg-ink-black transition-colors"
            >
              Save
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="text-center py-10 opacity-50 text-sm">Loading...</div>
      ) : (
        <div className="bg-white border border-ink-black/10 rounded-md overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-ink-black text-ivory-mist text-[10px] uppercase tracking-widest">
              <tr>
                <th className="p-4 font-normal">Name</th>
                <th className="p-4 font-normal hidden md:table-cell">Slug</th>
                <th className="p-4 font-normal text-center">Sort</th>
                <th className="p-4 font-normal text-center">Status</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-black/10">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-ivory-mist/30">
                  <td className="p-4 font-bold">{category.name}</td>
                  <td className="p-4 opacity-70 hidden md:table-cell">
                    {category.slug}
                  </td>
                  <td className="p-4 text-center">{category.sort_order}</td>
                  <td className="p-4 text-center">
                    <span
                      className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
                        category.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-ink-black/10 text-ink-black/60"
                      }`}
                    >
                      {category.is_published ? "Live" : "Draft"}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-xs uppercase tracking-widest opacity-60 hover:text-brand-red transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-xs uppercase tracking-widest opacity-60 hover:text-brand-red transition-colors"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center opacity-50">
                    No categories found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
