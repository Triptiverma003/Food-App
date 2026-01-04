'use client'

import { ArrowLeft, Loader, PlusCircle, Upload } from 'lucide-react'
import Link from 'next/link'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { motion } from "motion/react"
import Image from 'next/image'
import axios from 'axios'

const categories = [
  "Fruits & Vegetables",
  "Dairy & Eggs",
  "Rice, Atta & Grains",
  "Snacks & Biscuits",
  "Spices & Masalas",
  "Beverages & Drinks",
  "Personal Care",
  "Household Essentials",
  "Instant & Packaged Food",
  "Baby & Pet Care"
]

const units = ["kg", "g", "liter", "ml", "piece", "pack"]

function AddGrocery() {
  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [unit, setUnit] = useState("")
  const [price, setPrice] = useState("")
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [backendImage, setBackendImage] = useState<File | null>(null)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setBackendImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("category", category)
      formData.append("price", price)
      formData.append("unit", unit)

      if (backendImage) {
        formData.append("image", backendImage)
      }

      // 🔥 LOG SENT DATA (same like screenshot)
      console.group("📤 Grocery Data Sent")
      for (const [key, value] of formData.entries()) {
        console.log(key, value)
      }
      console.groupEnd()

      const result = await axios.post(
        "/api/admin/add-grocery",
        formData
      )

      // 🔥 LOG RESPONSE (same like screenshot)
      console.group("✅ Grocery Created (Response)")
      console.log(result.data)
      console.groupEnd()

      // Optional: reset form
      setName("")
      setCategory("")
      setUnit("")
      setPrice("")
      setBackendImage(null)
      setPreview(null)

      setLoading(false)

    } catch (error: any) {
      console.group("❌ Add Grocery Error")
      console.error(error.response?.data || error.message)
      console.groupEnd()
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 to-white py-16 px-4 relative'>

      <Link
        href="/"
        className='absolute top-6 left-6 flex items-center gap-2 text-green-700 font-semibold bg-white px-4 py-2 rounded-full shadow-md hover:bg-green-100 transition-all'
      >
        <ArrowLeft className='w-5 h-5' />
        <span className='hidden md:flex'>Back to home</span>
      </Link>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className='bg-white w-full max-w-2xl shadow-2xl rounded-3xl border border-green-100 p-8'
      >

        <div className='flex flex-col items-center mb-8'>
          <div className='flex items-center gap-3'>
            <PlusCircle className='text-green-600 w-8 h-8' />
            <h1 className='text-xl font-semibold'>Add Your Grocery</h1>
          </div>
          <p className='text-gray-500 text-sm mt-2 text-center'>
            Fill out the details below to add a new grocery item.
          </p>
        </div>

        <form className='flex flex-col gap-6' onSubmit={handleSubmit}>

          <div>
            <label className='block text-gray-700 font-medium mb-1'>
              Grocery Name <span className='text-red-500'>*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400'
            />
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
            <div>
              <label className='block text-gray-700 font-medium mb-1'>Category *</label>
              <select
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                className='w-full border rounded-xl px-4 py-3 bg-white'
              >
                <option value="">Select Category</option>
                {categories.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-gray-700 font-medium mb-1'>Unit *</label>
              <select
                required
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className='w-full border rounded-xl px-4 py-3 bg-white'
              >
                <option value="">Select Unit</option>
                {units.map((u, i) => (
                  <option key={i} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className='block text-gray-700 font-medium mb-1'>
              Price <span className='text-red-500'>*</span>
            </label>
            <input
              type="number"
              required
              value={price}
              onChange={e => setPrice(e.target.value)}
              className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-green-400'
            />
          </div>

          <div className='flex items-center gap-5'>
            <label
              htmlFor="image"
              className='cursor-pointer flex items-center gap-2 bg-green-50 text-green-700 font-semibold border rounded-xl px-6 py-3'
            >
              <Upload className='w-5 h-5' /> Upload image
            </label>

            <input
              type="file"
              id="image"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            {preview && (
              <Image
                src={preview}
                width={100}
                height={100}
                alt="preview"
                className='rounded-xl border object-cover'
              />
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            disabled={loading}
            className='mt-4 w-full bg-green-600 text-white font-semibold py-3 rounded-xl flex justify-center'
          >
            {loading ? <Loader className='animate-spin' /> : "Add Grocery"}
          </motion.button>

        </form>
      </motion.div>
    </div>
  )
}

export default AddGrocery
