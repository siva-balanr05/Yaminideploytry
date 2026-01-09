import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminModeBanner from '../admin/components/AdminModeBanner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ProductListing = ({ mode = 'staff' }) => {
  const isAdminMode = mode === 'admin';
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchTerm, selectedCategory, products]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.usage_type === selectedCategory);
    }

    setFilteredProducts(filtered);
  };

  const getUsageTag = (usageType) => {
    const tags = {
      office: { label: '🏢 Office Use', color: '#007bff' },
      school: { label: '🎓 School/College', color: '#28a745' },
      shop: { label: '🏪 Shop/Business', color: '#ffc107' },
      home: { label: '🏠 Home Use', color: '#17a2b8' }
    };
    return tags[usageType] || { label: usageType, color: '#6c757d' };
  };

  if (loading) {
    return <div className="loading-state">⏳ Loading products...</div>;
  }

  return (
    <div className="product-listing-page">
      {/* Admin Mode Banner */}
      {isAdminMode && (
        <div className="product-admin-banner">
          <span className="banner-icon">⚙️</span>
          <div className="banner-text">
            <h3>Managing Products (Admin Mode)</h3>
            <p>You can create, edit, and manage products</p>
          </div>
        </div>
      )}
      
      {/* Hero Section - Redesigned */}
      <div className="product-hero-section">
        <div className="product-hero-content">
          <div className="product-hero-left">
            <span className="product-hero-icon">🖨️</span>
            <div className="product-hero-text">
              <h1>{isAdminMode ? 'Product Management' : 'Find Your Perfect Printer'}</h1>
              <p>{isAdminMode ? 'Manage product catalog and inventory' : 'Quality Printers & Service for Office, School, Shop & Home'}</p>
            </div>
          </div>
          {isAdminMode && (
            <button className="product-add-btn" onClick={() => navigate('/products/add')}>
              <span className="btn-icon">➕</span>
              <span>Add New Product</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="search-filter-bar">
        <div className="container">
          <div className="search-box">
            <input
              type="text"
              placeholder="🔍 Search printers or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="category-filters">
            <button
              className={selectedCategory === 'all' ? 'active' : ''}
              onClick={() => setSelectedCategory('all')}
            >
              All Products
            </button>
            <button
              className={selectedCategory === 'office' ? 'active' : ''}
              onClick={() => setSelectedCategory('office')}
            >
              🏢 Office
            </button>
            <button
              className={selectedCategory === 'school' ? 'active' : ''}
              onClick={() => setSelectedCategory('school')}
            >
              🎓 School
            </button>
            <button
              className={selectedCategory === 'shop' ? 'active' : ''}
              onClick={() => setSelectedCategory('shop')}
            >
              🏪 Shop
            </button>
            <button
              className={selectedCategory === 'home' ? 'active' : ''}
              onClick={() => setSelectedCategory('home')}
            >
              🏠 Home
            </button>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container">
        <div className="products-count">
          {filteredProducts.length} products found
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p>No products found matching your criteria</p>
            <button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }}>
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map(product => {
              const usageTag = getUsageTag(product.usage_type);
              return (
                <div key={product.id} className="product-card">
                  <div className="product-image">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} />
                    ) : (
                      <div className="placeholder-image">
                        <span>🖨️</span>
                      </div>
                    )}
                    <div
                      className="usage-tag"
                      style={{ background: usageTag.color }}
                    >
                      {usageTag.label}
                    </div>
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>
                    <p className="brand">{product.brand || 'Premium Brand'}</p>
                    <p className="description">
                      {product.description?.substring(0, 100)}
                      {product.description?.length > 100 && '...'}
                    </p>

                    {product.price && (
                      <div className="price">₹{product.price.toLocaleString()}</div>
                    )}

                    <div className="card-actions">
                      <button
                        className="btn-primary"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        View Details
                      </button>
                      {isAdminMode ? (
                        <button
                          className="btn-secondary"
                          onClick={() => navigate(`/products/edit/${product.id}`)}
                          style={{ background: '#10B981', color: 'white', border: 'none' }}
                        >
                          ✏️ Edit Product
                        </button>
                      ) : (
                        <button
                          className="btn-secondary"
                          onClick={() => navigate(`/enquiry/${product.id}`)}
                        >
                          📞 Enquire Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>{`
        .product-listing-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        /* Admin Mode Banner */
        .product-admin-banner {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 16px 24px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15);
        }
        .banner-icon {
          font-size: 22px;
          flex-shrink: 0;
        }
        .banner-text h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
        }
        .banner-text p {
          margin: 4px 0 0 0;
          font-size: 13px;
          opacity: 0.95;
        }

        /* Hero Section */
        .product-hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 20px;
        }
        .product-hero-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }
        .product-hero-left {
          display: flex;
          align-items: center;
          gap: 24px;
          flex: 1;
        }
        .product-hero-icon {
          font-size: 48px;
          flex-shrink: 0;
        }
        .product-hero-text h1 {
          margin: 0 0 8px 0;
          font-size: 36px;
          font-weight: 800;
          letter-spacing: -0.01em;
        }
        .product-hero-text p {
          margin: 0;
          font-size: 16px;
          opacity: 0.95;
        }
        .product-add-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          color: white;
          border: none;
          border-radius: 10px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .product-add-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
        }
        .product-add-btn:active {
          transform: translateY(0);
        }
        .btn-icon {
          font-size: 18px;
        }

        @media (max-width: 768px) {
          .product-hero-content {
            flex-direction: column;
            gap: 20px;
          }
          .product-hero-icon {
            font-size: 40px;
          }
          .product-hero-text h1 {
            font-size: 28px;
          }
          .product-add-btn {
            width: 100%;
            justify-content: center;
          }
        }

        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 60px 20px;
          text-align: center;
        }

        .hero-content h1 {
          font-size: 42px;
          margin: 0 0 15px 0;
        }

        .hero-content p {
          font-size: 20px;
          opacity: 0.9;
          margin: 0;
        }

        .search-filter-bar {
          background: white;
          padding: 30px 0;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .search-box {
          margin-bottom: 24px;
        }

        .search-input {
          width: 100%;
          max-width: 700px;
          display: block;
          margin: 0 auto;
          padding: 14px 20px;
          font-size: 15px;
          border: 2.5px solid #667eea;
          border-radius: 50px;
          background: white;
          transition: all 0.3s ease;
          color: #374151;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.08);
        }

        .search-input::placeholder {
          color: #9ca3af;
        }

        .search-input:focus {
          outline: none;
          background: white;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
        }

        .category-filters {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .category-filters button {
          padding: 10px 22px;
          border: 2px solid #e5e7eb;
          background: white;
          color: #374151;
          border-radius: 25px;
          cursor: pointer;
          font-weight: 600;
          font-size: 14px;
          transition: all 0.3s ease;
        }

        .category-filters button:hover {
          border-color: #667eea;
          color: #667eea;
          background: #f8fafc;
        }

        .category-filters button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
          box-shadow: 0 4px 14px rgba(102, 126, 234, 0.35);
        }

        .products-count {
          padding: 28px 0 24px;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 25px;
          padding-bottom: 50px;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: transform 0.3s, box-shadow 0.3s;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 220px;
          background: #f0f0f0;
          overflow: hidden;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .placeholder-image {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 60px;
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }

        .usage-tag {
          position: absolute;
          top: 15px;
          right: 15px;
          color: white;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .product-info {
          padding: 20px;
        }

        .product-info h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          color: #1a1a1a;
        }

        .brand {
          color: #667eea;
          font-weight: 600;
          margin: 0 0 12px 0;
          font-size: 14px;
        }

        .description {
          color: #666;
          font-size: 14px;
          line-height: 1.6;
          margin: 0 0 15px 0;
        }

        .price {
          font-size: 24px;
          font-weight: 700;
          color: #28a745;
          margin-bottom: 15px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
        }

        .btn-primary,
        .btn-secondary {
          flex: 1;
          padding: 12px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
        }

        .btn-primary {
          background: #667eea;
          color: white;
        }

        .btn-primary:hover {
          background: #5568d3;
        }

        .btn-secondary {
          background: #28a745;
          color: white;
        }

        .btn-secondary:hover {
          background: #218838;
        }

        .empty-state {
          text-align: center;
          padding: 80px 20px;
        }

        .empty-icon {
          font-size: 80px;
          margin-bottom: 20px;
        }

        .empty-state p {
          color: #666;
          font-size: 18px;
          margin-bottom: 25px;
        }

        .empty-state button {
          padding: 12px 30px;
          background: #667eea;
          color: white;
          border: none;
          border-radius: 25px;
          font-weight: 600;
          cursor: pointer;
        }

        .loading-state {
          text-align: center;
          padding: 100px 20px;
          font-size: 24px;
          color: #666;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 32px;
          }

          .products-grid {
            grid-template-columns: 1fr;
          }

          .category-filters {
            justify-content: flex-start;
            overflow-x: auto;
            flex-wrap: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductListing;
