import React, { useState, useEffect } from 'react';
import { productsAPI, inventoryAPI, colorsAPI, sizesAPI } from '../services/api';
import { X, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://via.placeholder.com/100x100?text=No+Image';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};

const CATEGORIES = ['sneakers', 'sandals', 'boots', 'pumps', 'heels'];

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [expandedProduct, setExpandedProduct] = useState(null);

  // Delete confirmation modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Sale modal state
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [productForSale, setProductForSale] = useState(null);
  const [salePrice, setSalePrice] = useState('');

  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    category: '',
    cost_price: '',
    selling_price: '',
  });

  const [variants, setVariants] = useState([
    { color: '', sizes: [{ value: '', quantity: '' }], isCustomColor: false }
  ]);

  const [selectedImages, setSelectedImages] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, colorsRes, sizesRes] = await Promise.all([
        productsAPI.getAll(),
        colorsAPI.getAll(),
        sizesAPI.getAll(),
      ]);
      
      setProducts(productsRes.data.products || []);
      setColors(colorsRes.data.colors || colorsRes.data || []);
      setSizes(sizesRes.data.sizes || sizesRes.data || []);
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProductDetails = async (productId) => {
    try {
      const response = await productsAPI.getById(productId);
      setProductDetails(response.data);
      return response.data;
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      return null;
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    
    try {
      if (!productForm.name || !productForm.category || !productForm.cost_price || !productForm.selling_price || !productForm.description) {
        alert('Please fill in all required fields');
        return;
      }

      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('category', productForm.category);
      formData.append('cost_price', productForm.cost_price);
      formData.append('selling_price', productForm.selling_price);
      
      const formattedVariants = variants.map(v => ({
        color: v.color,
        sizes: v.sizes.map(s => ({
          value: s.value,
          quantity: parseInt(s.quantity) || 0
        }))
      }));
      formData.append('variants', JSON.stringify(formattedVariants));

      selectedImages.forEach(file => {
        console.log('Appending image:', file.name);
        formData.append('images', file);
      });

      // Debug: log all form data
      for (let [key, value] of formData.entries()) {
        console.log('FormData:', key, value instanceof File ? value.name : value);
      }

      await productsAPI.create(formData);
      
      setShowAddProduct(false);
      setProductForm({ name: '', description: '', category: '', cost_price: '', selling_price: '' });
      setVariants([{ color: '', sizes: [{ value: '', quantity: '' }] }]);
      setSelectedImages([]);
      
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create product');
    }
  };

  const handleEditProduct = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('category', productForm.category);
      formData.append('cost_price', productForm.cost_price);
      formData.append('selling_price', productForm.selling_price);

      // Add variants if any have been filled in
      const filledVariants = variants.filter(v => v.color && v.sizes.some(s => s.value));
      if (filledVariants.length > 0) {
        const formattedVariants = filledVariants.map(v => ({
          color: v.color,
          sizes: v.sizes.filter(s => s.value).map(s => ({
            value: s.value,
            quantity: parseInt(s.quantity) || 0
          }))
        }));
        formData.append('variants', JSON.stringify(formattedVariants));
      }

      // Add images if any selected
      selectedImages.forEach(file => {
        formData.append('images', file);
      });

      await productsAPI.update(selectedProduct.id, formData);
      setShowEditProduct(false);
      setSelectedProduct(null);
      setVariants([{ color: '', sizes: [{ value: '', quantity: '' }] }]);
      setSelectedImages([]);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update product');
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProductToDelete(null);
  };

  // Confirm and execute delete
  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    setDeleting(true);
    try {
      await productsAPI.delete(productToDelete.id);
      fetchData();
      closeDeleteModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete product');
    } finally {
      setDeleting(false);
    }
  };

  // Open sale modal
  const openSaleModal = (product) => {
    setProductForSale(product);
    // Suggest a sale price (e.g., 20% off selling price)
    const suggestedSalePrice = Math.floor(parseFloat(product.selling_price) * 0.8);
    setSalePrice(suggestedSalePrice.toString());
    setShowSaleModal(true);
  };

  // Close sale modal
  const closeSaleModal = () => {
    setShowSaleModal(false);
    setProductForSale(null);
    setSalePrice('');
  };

  // Mark product on sale
  const handleMarkOnSale = async () => {
    if (!productForSale || !salePrice) return;
    
    try {
      await productsAPI.markOnSale(productForSale.id, parseFloat(salePrice));
      fetchData();
      closeSaleModal();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to mark product on sale');
    }
  };

  // Remove product from sale
  const handleRemoveFromSale = async (productId) => {
    try {
      await productsAPI.removeFromSale(productId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove product from sale');
    }
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setProductForm({
      name: product.name,
      description: product.description || '',
      category: product.category,
      cost_price: product.cost_price,
      selling_price: product.selling_price,
    });
    // Reset variants and images for adding new ones
    setVariants([{ color: '', sizes: [{ value: '', quantity: '' }], isCustomColor: false }]);
    setSelectedImages([]);
    setShowEditProduct(true);
  };

  const toggleInventory = async (productId) => {
    if (expandedProduct === productId) {
      setExpandedProduct(null);
      setProductDetails(null);
    } else {
      setExpandedProduct(productId);
      await fetchProductDetails(productId);
    }
  };

  const handleUpdateInventory = async (productId, sizeId, colorId, newQuantity) => {
    try {
      await inventoryAPI.update(productId, { sizeId, colorId, quantity: parseInt(newQuantity) });
      await fetchProductDetails(productId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update inventory');
    }
  };

  // Variant management
  const addVariant = () => setVariants([...variants, { color: '', sizes: [{ value: '', quantity: '' }], isCustomColor: false }]);
  
  const removeVariant = (index) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants.length > 0 ? newVariants : [{ color: '', sizes: [{ value: '', quantity: '' }], isCustomColor: false }]);
  };

  const updateVariantColor = (index, color) => {
    const newVariants = [...variants];
    newVariants[index].color = color;
    setVariants(newVariants);
  };

  const addSizeToVariant = (variantIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes.push({ value: '', quantity: '' });
    setVariants(newVariants);
  };

  const removeSizeFromVariant = (variantIndex, sizeIndex) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes = newVariants[variantIndex].sizes.filter((_, i) => i !== sizeIndex);
    if (newVariants[variantIndex].sizes.length === 0) {
      newVariants[variantIndex].sizes = [{ value: '', quantity: '' }];
    }
    setVariants(newVariants);
  };

  const updateVariantSize = (variantIndex, sizeIndex, field, value) => {
    const newVariants = [...variants];
    newVariants[variantIndex].sizes[sizeIndex][field] = value;
    setVariants(newVariants);
  };

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(prev => [...prev, ...files]);
  };

  const removeImage = (index) => setSelectedImages(prev => prev.filter((_, i) => i !== index));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl text-center mb-8" style={{ fontFamily: "'Playfair Display', serif" }}>
        Product & Inventory Management
      </h1>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">{error}</div>}

      {/* Products Table */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>View all Products</h2>
          <span className="text-sm text-gray-500">{products.length} products</span>
        </div>

        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Product Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Colors</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sizes</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Total Stock</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Cost Price</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Selling Price</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Sale</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Tax %</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan="11" className="px-4 py-8 text-center text-gray-500">No products found</td>
                </tr>
              ) : (
                products.map((product) => (
                  <React.Fragment key={product.id}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <img
                          src={getImageUrl(product.main_image)}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                          onError={(e) => { e.target.src = 'https://via.placeholder.com/100x100?text=No+Image'; }}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm font-medium">
                        {product.name}
                        {product.on_sale && (
                          <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded">SALE</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm capitalize">{product.category}</td>
                      <td className="px-4 py-3 text-sm">{product.colors?.join(', ') || '-'}</td>
                      <td className="px-4 py-3 text-sm">
                        {product.sizes?.length > 0 
                          ? `${Math.min(...product.sizes.map(s => parseFloat(s.value || s)))}–${Math.max(...product.sizes.map(s => parseFloat(s.value || s)))}`
                          : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">{product.total_stock || 0}</td>
                      <td className="px-4 py-3 text-sm text-right">${parseFloat(product.cost_price || 0).toFixed(0)}</td>
                      <td className="px-4 py-3 text-sm text-right">
                        {product.on_sale && product.sale_price ? (
                          <div>
                            <span className="text-red-600 font-semibold">${parseFloat(product.sale_price).toFixed(0)}</span>
                            <span className="text-gray-400 line-through ml-1 text-xs">${parseFloat(product.selling_price || 0).toFixed(0)}</span>
                            <span className="block text-xs text-green-600 font-medium">
                              {Math.round(((parseFloat(product.selling_price) - parseFloat(product.sale_price)) / parseFloat(product.selling_price)) * 100)}% OFF
                            </span>
                          </div>
                        ) : (
                          `$${parseFloat(product.selling_price || 0).toFixed(0)}`
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-center">
                        {product.on_sale ? (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded font-medium">
                            On Sale
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded">
                            Regular
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">6%</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-sm">
                          <button onClick={() => openEditModal(product)} className="text-blue-600 hover:underline">Edit</button>
                          <span className="text-gray-300">•</span>
                          <button onClick={() => toggleInventory(product.id)} className="text-blue-600 hover:underline flex items-center gap-1">
                            Inventory {expandedProduct === product.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                          <span className="text-gray-300">•</span>
                          <button onClick={() => openDeleteModal(product)} className="text-red-600 hover:underline">Delete</button>
                        </div>
                      </td>
                    </tr>
                    
                    {expandedProduct === product.id && productDetails && (
                      <tr>
                        <td colSpan="10" className="px-4 py-4 bg-gray-50">
                          <div className="max-w-2xl">
                            <h4 className="font-medium mb-3">Inventory for {product.name}</h4>
                            <table className="w-full border border-gray-200 rounded">
                              <thead className="bg-white">
                                <tr>
                                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Size</th>
                                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Color</th>
                                  <th className="px-3 py-2 text-right text-sm font-medium text-gray-700">Quantity</th>
                                  <th className="px-3 py-2 text-left text-sm font-medium text-gray-700">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {productDetails.variants?.map((inv, idx) => (
                                  <tr key={inv.id || idx}>
                                    <td className="px-3 py-2 text-sm text-right">{inv.size}</td>
                                    <td className="px-3 py-2 text-sm capitalize">{productDetails.colors?.find(c => c.id === inv.color_id)?.value || '-'}</td>
                                    <td className="px-3 py-2 text-sm text-right">
                                      <input type="number" defaultValue={inv.quantity} min="0" className="w-20 px-2 py-1 border rounded text-right text-gray-900 bg-white" id={`qty-${inv.id}`} />
                                    </td>
                                    <td className="px-3 py-2 text-sm">
                                      <button onClick={() => handleUpdateInventory(product.id, inv.size_id, inv.color_id, document.getElementById(`qty-${inv.id}`).value)} className="text-blue-600 hover:underline">Update</button>
                                    </td>
                                  </tr>
                                ))}
                                {(!productDetails.variants || productDetails.variants.length === 0) && (
                                  <tr><td colSpan="4" className="px-3 py-4 text-center text-gray-500 text-sm">No inventory entries</td></tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Button */}
      <div className="fixed bottom-8 right-8 z-40">
        <button onClick={() => setShowAddProduct(true)} className="px-8 py-4 bg-primary text-white rounded-full text-sm tracking-wider hover:bg-gray-800 transition-colors shadow-lg">
          Add Product
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle size={32} className="text-red-600" />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Delete Product
              </h3>

              {/* Message */}
              <p className="text-center text-gray-600 mb-2">
                Are you sure you want to delete
              </p>
              <p className="text-center font-semibold text-gray-900 mb-4">
                "{productToDelete.name}"?
              </p>
              <p className="text-center text-sm text-gray-500 mb-6">
                This action cannot be undone. All inventory and images associated with this product will be permanently removed.
              </p>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Deletion'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {showSaleModal && productForSale && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🏷️</span>
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-center text-gray-900 mb-2">
                Put on Sale
              </h3>

              {/* Product Info */}
              <p className="text-center text-gray-600 mb-4">
                {productForSale.name}
              </p>

              {/* Current Price Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-500">Current Selling Price:</span>
                  <span className="font-medium">${parseFloat(productForSale.selling_price).toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cost Price:</span>
                  <span className="font-medium">${parseFloat(productForSale.cost_price).toFixed(0)}</span>
                </div>
              </div>

              {/* Sale Price Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Sale Price ($)</label>
                <input
                  type="number"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  placeholder="Enter sale price"
                  min="1"
                  max={parseFloat(productForSale.selling_price) - 1}
                  className="w-full px-4 py-3 border rounded-lg text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be less than the selling price of ${parseFloat(productForSale.selling_price).toFixed(0)}
                </p>
                {salePrice && parseFloat(salePrice) < parseFloat(productForSale.selling_price) && (
                  <p className="text-sm text-green-600 mt-2">
                    {Math.round(((parseFloat(productForSale.selling_price) - parseFloat(salePrice)) / parseFloat(productForSale.selling_price)) * 100)}% off
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={closeSaleModal}
                  className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleMarkOnSale}
                  disabled={!salePrice || parseFloat(salePrice) >= parseFloat(productForSale.selling_price)}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Put on Sale
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">ADD NEW PRODUCT</h3>
              <button onClick={() => setShowAddProduct(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <input type="text" placeholder="Product Name" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required className="w-full px-4 py-3 bg-gray-100 rounded-lg text-center text-gray-900" />
              
              <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required className="w-full px-4 py-3 bg-gray-100 rounded-lg text-center text-gray-900 appearance-none cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23666'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1.5rem' }}>
                <option value="">Category</option>
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price $</label>
                  <input type="number" placeholder="Min $1999" value={productForm.cost_price} onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })} required min="1999" className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price $</label>
                  <input type="number" placeholder="Enter selling price" value={productForm.selling_price} onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })} required className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900" />
                </div>
              </div>

              <textarea placeholder="Product Description (required)" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} required rows={3} className="w-full px-4 py-3 bg-gray-100 rounded-lg text-gray-900" />

              {/* Variants */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Variants (Color + Sizes)</h4>
                  <button type="button" onClick={addVariant} className="text-sm text-blue-600 hover:underline">+ Add Color Variant</button>
                </div>

                {variants.map((variant, variantIdx) => (
                  <div key={variantIdx} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      {variant.isCustomColor ? (
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => updateVariantColor(variantIdx, e.target.value.toLowerCase())}
                          placeholder="Enter custom color (e.g., grey, burgundy)"
                          className="flex-1 px-3 py-2 border-2 border-blue-500 rounded text-gray-900"
                          required
                        />
                      ) : (
                        <select 
                          value={variant.color} 
                          onChange={(e) => {
                            if (e.target.value === '__custom__') {
                              const newVariants = [...variants];
                              newVariants[variantIdx].isCustomColor = true;
                              newVariants[variantIdx].color = '';
                              setVariants(newVariants);
                            } else {
                              updateVariantColor(variantIdx, e.target.value);
                            }
                          }} 
                          className="flex-1 px-3 py-2 bg-primary text-white rounded appearance-none cursor-pointer" 
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5rem', paddingRight: '2.5rem' }} 
                          required
                        >
                          <option value="">Select Color</option>
                          {colors.map(c => <option key={c.id} value={c.value}>{c.value}</option>)}
                          <option value="__custom__">+ Add Custom Color...</option>
                        </select>
                      )}
                      {variant.isCustomColor && (
                        <button 
                          type="button" 
                          onClick={() => {
                            const newVariants = [...variants];
                            newVariants[variantIdx].isCustomColor = false;
                            newVariants[variantIdx].color = '';
                            setVariants(newVariants);
                          }} 
                          className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      {variants.length > 1 && <button type="button" onClick={() => removeVariant(variantIdx)} className="text-red-500"><Trash2 size={18} /></button>}
                    </div>

                    <div className="space-y-2">
                      {variant.sizes.map((size, sizeIdx) => (
                        <div key={sizeIdx} className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.5"
                            min="1"
                            value={size.value} 
                            onChange={(e) => updateVariantSize(variantIdx, sizeIdx, 'value', e.target.value)} 
                            placeholder="US Size" 
                            className="flex-1 px-3 py-2 border rounded text-gray-900"
                            required 
                          />
                          <input 
                            type="number" 
                            placeholder="Qty" 
                            value={size.quantity} 
                            onChange={(e) => updateVariantSize(variantIdx, sizeIdx, 'quantity', Math.floor(Math.abs(e.target.value)) || '')} 
                            min="0" 
                            step="1"
                            className="w-20 px-3 py-2 border rounded text-gray-900" 
                          />
                          {variant.sizes.length > 1 && <button type="button" onClick={() => removeSizeFromVariant(variantIdx, sizeIdx)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>}
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">
                        US Sizes (increments of 0.5) — Existing: {[...sizes].sort((a, b) => parseFloat(a.value) - parseFloat(b.value)).map(s => s.value).join(', ')}
                      </p>
                      <button type="button" onClick={() => addSizeToVariant(variantIdx)} className="text-xs text-blue-600 hover:underline">+ Add Size</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Images */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Product Images</h4>
                <p className="text-xs text-gray-500 mb-2">Name as: productname-color-view.png</p>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white" />
                {selectedImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedImages.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 object-cover rounded" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="w-full px-6 py-4 bg-primary text-white rounded-full tracking-wider hover:bg-gray-800">CREATE PRODUCT</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProduct && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-xl font-semibold">EDIT PRODUCT</h3>
              <button onClick={() => { setShowEditProduct(false); setSelectedProduct(null); }} className="text-gray-500"><X size={24} /></button>
            </div>

            <form onSubmit={handleEditProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input type="text" value={productForm.name} onChange={(e) => setProductForm({ ...productForm, name: e.target.value })} required className="w-full px-4 py-3 border rounded-lg text-gray-900" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select value={productForm.category} onChange={(e) => setProductForm({ ...productForm, category: e.target.value })} required className="w-full px-4 py-3 border rounded-lg text-gray-900">
                  <option value="">Select Category</option>
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price ($)</label>
                  <input type="number" value={productForm.cost_price} onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })} required className="w-full px-4 py-3 border rounded-lg text-gray-900" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price ($)</label>
                  <input type="number" value={productForm.selling_price} onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })} required className="w-full px-4 py-3 border rounded-lg text-gray-900" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={3} className="w-full px-4 py-3 border rounded-lg text-gray-900" />
              </div>

              {/* Add New Variants Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Add New Color Variants</h4>
                  <button type="button" onClick={addVariant} className="text-sm text-blue-600 hover:underline">+ Add Color Variant</button>
                </div>
                <p className="text-xs text-gray-500 mb-3">Add new colors and sizes. Existing variants will remain unchanged.</p>

                {variants.map((variant, variantIdx) => (
                  <div key={variantIdx} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <select value={variant.color} onChange={(e) => updateVariantColor(variantIdx, e.target.value)} className="flex-1 px-3 py-2 bg-primary text-white rounded appearance-none cursor-pointer" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='white'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.5rem', paddingRight: '2.5rem' }}>
                        <option value="">Select Color</option>
                        {colors.map(c => <option key={c.id} value={c.value}>{c.value}</option>)}
                        <option value="__new__">+ Add New Color...</option>
                      </select>
                      {variants.length > 1 && <button type="button" onClick={() => removeVariant(variantIdx)} className="text-red-500"><Trash2 size={18} /></button>}
                    </div>

                    {variant.color === '__new__' && (
                      <input
                        type="text"
                        placeholder="Enter new color name"
                        className="w-full px-3 py-2 border rounded mb-3 text-gray-900"
                        onChange={(e) => updateVariantColor(variantIdx, e.target.value)}
                      />
                    )}

                    <div className="space-y-2">
                      {variant.sizes.map((size, sizeIdx) => (
                        <div key={sizeIdx} className="flex items-center gap-2">
                          <input 
                            type="number" 
                            step="0.5"
                            min="1"
                            value={size.value} 
                            onChange={(e) => updateVariantSize(variantIdx, sizeIdx, 'value', e.target.value)} 
                            placeholder="US Size" 
                            className="flex-1 px-3 py-2 border rounded text-gray-900"
                          />
                          <input 
                            type="number" 
                            placeholder="Qty" 
                            value={size.quantity} 
                            onChange={(e) => updateVariantSize(variantIdx, sizeIdx, 'quantity', Math.floor(Math.abs(e.target.value)) || '')} 
                            min="0" 
                            step="1"
                            className="w-20 px-3 py-2 border rounded text-gray-900" 
                          />
                          {variant.sizes.length > 1 && <button type="button" onClick={() => removeSizeFromVariant(variantIdx, sizeIdx)} className="text-gray-400 hover:text-red-500"><X size={16} /></button>}
                        </div>
                      ))}
                      <button type="button" onClick={() => addSizeToVariant(variantIdx)} className="text-xs text-blue-600 hover:underline">+ Add Size</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Images Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Add New Images</h4>
                <p className="text-xs text-gray-500 mb-2">Name as: productname-color-view.png (e.g., siren-red-side.png)</p>
                <input type="file" accept="image/*" multiple onChange={handleImageSelect} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-primary file:text-white" />
                {selectedImages.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedImages.map((file, idx) => (
                      <div key={idx} className="relative">
                        <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 object-cover rounded" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs">×</button>
                        <p className="text-xs text-gray-500 truncate w-16">{file.name}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setShowEditProduct(false); setSelectedProduct(null); }} className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-gray-800">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManagement;