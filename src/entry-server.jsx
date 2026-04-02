import React from 'react'
import { renderToString } from 'react-dom/server'
import App from './App'

export async function render(url) {
  let products = []
  let error = null
  try {
    const res = await fetch('https://api.escuelajs.co/api/v1/products?limit=24')
    if (!res.ok) throw new Error('API down')
    products = await res.json()
  } catch (err) {
    console.error('Server Fetch Error:', err)
    error = 'Note: Using demo products (Platzi API unreachable)'
    products = [
      { id: 1, title: "Modernist Canvas Sneakers", price: 129, category: { name: "Fashion" }, images: ["https://i.imgur.com/QkIa5tT.jpeg"] },
      { id: 2, title: "Structured Leather Tote", price: 899, category: { name: "Bags" }, images: ["https://i.imgur.com/K6b9f9u.jpeg"] },
      { id: 3, title: "Chronograph Gold Watch", price: 299, category: { name: "Accessories" }, images: ["https://i.imgur.com/i9O3s9k.jpeg"] }
    ]
  }

  const initialData = { products, error }

  const headTags = `
    <title>The Essence | Curated Collection</title>
    <meta name="description" content="Discover the Essence collection. Handcrafted luxury items for the modern lifestyle. Limited releases available now." />
    <meta property="og:title" content="Essence - Curated Collection" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  `
  const appHtml = renderToString(
    <React.StrictMode>
      <App ssrData={initialData} />
    </React.StrictMode>
  )
  return { appHtml, headTags, initialData }
}
