import React, { useState, useEffect } from 'react'

export default function App({ ssrData }) {
  const initialData = ssrData || (typeof window !== 'undefined' ? window.__INITIAL_DATA__ : null)

  const [products, setProducts] = useState(initialData?.products || [])
  const [loading, setLoading] = useState(!initialData?.products)
  const [categories, setCategories] = useState(initialData ? [...new Set(initialData.products.map(p => p.category?.name))] : [])
  const [error, setError] = useState(initialData?.error || null)

  useEffect(() => {
    if (products.length > 0) return

    const fetchData = async () => {
      try {
        const res = await fetch('https://api.escuelajs.co/api/v1/products?limit=24')
        if (!res.ok) throw new Error('API down')
        const data = await res.json()
        setProducts(data)
        setCategories([...new Set(data.map(p => p.category?.name))])
      } catch (err) {
        console.error('Error fetching products:', err)
        setError("Note: Using demo data due to API connection issues.")
        const mock = [
          { id: 1, title: "Modernist Canvas Sneakers", price: 129, category: { name: "Fashion" }, images: ["https://i.imgur.com/QkIa5tT.jpeg"] },
          { id: 2, title: "Structured Leather Tote", price: 899, category: { name: "Bags" }, images: ["https://i.imgur.com/K6b9f9u.jpeg"] }
        ]
        setProducts(mock)
        setCategories([...new Set(mock.map(p => p.category?.name))])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="app">
      <header className="header">
        <div className="container header-content">
          <div className="logo">ESSENCE</div>
          <nav className="nav-links">
            <a href="/new">NEW IN</a>
            <a href="/women">WOMEN</a>
            <a href="/men">MEN</a>
            <a href="/accessories">ACCESSORIES</a>
          </nav>
          <div style={{display: 'flex', gap: '1.5rem', fontWeight: 600, fontSize: '0.85rem'}}>
            <button aria-label="Search">SEARCH</button>
            <button aria-label="Cart">CART (0)</button>
          </div>
        </div>
      </header>
      
      <main className="container main-layout">
        <aside className="sidebar">
          <div className="filter-group">
            <h2 className="filter-title">Category</h2>
            <ul className="filter-list">
              {categories.filter(c => c).map(cat => (
                <li key={cat} className="filter-item">
                  <label htmlFor={`cat-${cat}`}>
                    <input type="checkbox" id={`cat-${cat}`} /> {cat}
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div className="filter-group">
            <h2 className="filter-title">Price Range</h2>
            <ul className="filter-list">
              <li className="filter-item"><label><input type="checkbox" /> Under $100</label></li>
              <li className="filter-item"><label><input type="checkbox" /> $100 - $500</label></li>
              <li className="filter-item"><label><input type="checkbox" /> Over $500</label></li>
            </ul>
          </div>
        </aside>

        <section className="listing">
          <header style={{marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'}}>
            <div>
              <p style={{fontSize: '0.75rem', color: 'var(--secondary)', marginBottom: '0.5rem', fontWeight: 600, letterSpacing: '1px'}}>HOME / CURATED SELECTION</p>
              <h1 style={{fontSize: '2.8rem', fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1}}>Essentials</h1>
            </div>
            <p style={{fontSize: '0.85rem', color: 'var(--secondary)', fontWeight: 500}}>{products.length} Items Available</p>
          </header>

          {error && <p style={{color: '#6B7280', fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '2rem'}}>{error}</p>}
          
          <div className="product-grid">
            {loading ? (
              Array.from({length: 6}).map((_, i) => (
                <div key={i} className="product-card">
                  <div className="image-wrapper skeleton"></div>
                  <div className="skeleton" style={{height: '1rem', width: '30%', marginBottom: '0.25rem'}}></div>
                  <div className="skeleton" style={{height: '1.25rem', width: '90%'}}></div>
                </div>
              ))
            ) : (
              products.map(product => {
                // Ensure image is a valid string, Platzi sometimes returns weird arrays
                const mainImage = Array.isArray(product.images) ? product.images[0] : product.images;
                
                return (
                  <article key={product.id} className="product-card">
                    <div className="image-wrapper">
                      <img src={mainImage} alt={`${product.title} in ${product.category?.name}`} loading="lazy" />
                      <div className="quick-view">SHOP NOW</div>
                    </div>
                    <div className="card-info">
                      <p className="card-brand">{product.category?.name || 'ESSENCE'}</p>
                      <h2 className="card-title">{product.title}</h2>
                      <div className="card-price">${product.price.toFixed(2)}</div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      </main>
      
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": products.slice(0, 10).map((p, i) => ({
            "@type": "ListItem",
            "position": i + 1,
            "url": `https://essence-retail.com/p/${p.id}`,
            "name": p.title
          }))
        })}}
      ></script>
    </div>
  )
}
