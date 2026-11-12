import { useEffect, useState } from "react";
import api from "../../services/api";
import "./AdminProducts.css";

const emptyProduct = {
  name: "",
  category: "",
  description: "",
  price: "",
  rating: "0",
  image: "",
  stock: "0",
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/products");
      setProducts(data);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not load products. Sign in with an administrator account and check the API server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const updateField = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submitProduct = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      rating: Number(form.rating),
      stock: Number(form.stock),
      image: form.image || null,
    };

    try {
      if (editingId) {
        await api.put(`/api/products/${editingId}`, payload);
      } else {
        await api.post("/api/products", payload);
      }
      setForm(emptyProduct);
      setEditingId(null);
      await loadProducts();
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not save product.");
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      description: product.description || "",
      price: String(product.price),
      rating: String(product.rating),
      image: product.image || "",
      stock: String(product.stock),
    });
  };

  const deleteProduct = async (productId) => {
    setError("");
    try {
      await api.delete(`/api/products/${productId}`);
      setProducts((current) => current.filter((product) => product.id !== productId));
      if (editingId === productId) {
        setEditingId(null);
        setForm(emptyProduct);
      }
    } catch (requestError) {
      setError(requestError.response?.data?.detail || "Could not delete product.");
    }
  };

  return (
    <main className="admin-products">
      <header className="admin-products__header">
        <div>
          <h1>Product inventory</h1>
          <p>Manage products stored in the MediKart database.</p>
        </div>
        <button type="button" onClick={loadProducts} disabled={loading}>Refresh</button>
      </header>

      {error && <p className="admin-products__error" role="alert">{error}</p>}

      <form className="admin-products__form" onSubmit={submitProduct}>
        <h2>{editingId ? "Edit product" : "Add product"}</h2>
        <label>Name<input name="name" value={form.name} onChange={updateField} required maxLength="200" /></label>
        <label>Category<input name="category" value={form.category} onChange={updateField} required maxLength="100" /></label>
        <label>Price<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} required /></label>
        <label>Rating<input name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={updateField} /></label>
        <label>Stock<input name="stock" type="number" min="0" step="1" value={form.stock} onChange={updateField} /></label>
        <label>Image URL<input name="image" type="url" value={form.image} onChange={updateField} /></label>
        <label className="admin-products__description">Description<textarea name="description" value={form.description} onChange={updateField} rows="3" /></label>
        <div className="admin-products__actions">
          <button type="submit" disabled={saving}>{saving ? "Saving..." : editingId ? "Save changes" : "Add product"}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm(emptyProduct); }}>Cancel</button>}
        </div>
      </form>

      <section className="admin-products__table-wrap" aria-label="Product list">
        {loading ? <p role="status">Loading products...</p> : products.length === 0 ? <p>No database products yet.</p> : (
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
            <tbody>{products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td><td>{product.category}</td><td>₹{product.price}</td><td>{product.stock}</td>
                <td className="admin-products__row-actions">
                  <button type="button" onClick={() => editProduct(product)}>Edit</button>
                  <button type="button" onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </section>
    </main>
  );
}