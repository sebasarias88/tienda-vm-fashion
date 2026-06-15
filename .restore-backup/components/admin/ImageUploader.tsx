'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import { ImageIcon, X, Loader2, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

type ImageUploaderProps = {
  imagenes: string[]
  onChange: (imagenes: string[]) => void
}

export default function ImageUploader({ imagenes, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split('.').pop()
    const path = `productos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

    const { error } = await supabase.storage
      .from('productos')
      .upload(path, file, { upsert: true })

    if (error) return null

    const { data } = supabase.storage.from('productos').getPublicUrl(path)
    return data.publicUrl
  }

  const handleFiles = async (files: FileList | File[]) => {
    const arr = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (!arr.length) return
    if (imagenes.length + arr.length > 6) {
      toast.error('Máximo 6 imágenes por producto')
      return
    }

    setUploading(true)
    const urls: string[] = []

    for (const file of arr) {
      const url = await uploadFile(file)
      if (url) urls.push(url)
    }

    if (urls.length) {
      onChange([...imagenes, ...urls])
      toast.success(`${urls.length} imagen${urls.length > 1 ? 'es' : ''} subida${urls.length > 1 ? 's' : ''}`)
    } else {
      toast.error('Error al subir imágenes')
    }
    setUploading(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const eliminarImagen = async (url: string) => {
    const path = url.split('/productos/')[1]
    if (path) {
      await supabase.storage.from('productos').remove([`productos/${path}`])
    }
    onChange(imagenes.filter(i => i !== url))
    toast.success('Imagen eliminada')
  }

  const moverImagen = (from: number, to: number) => {
    const arr = [...imagenes]
    const [moved] = arr.splice(from, 1)
    arr.splice(to, 0, moved)
    onChange(arr)
  }

  return (
    <div className="space-y-3">
      <label className="block text-[10px] tracking-[2px] uppercase text-[rgba(240,235,228,0.65)] font-light">
        Imágenes del producto
        <span className="ml-2 text-[rgba(240,235,228,0.55)]">({imagenes.length}/6)</span>
      </label>

      {/* Grid de imágenes */}
      {imagenes.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <AnimatePresence>
            {imagenes.map((url, i) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group aspect-square"
              >
                <img
                  src={url}
                  alt={`Imagen ${i + 1}`}
                  className="w-full h-full object-cover rounded-[2px] border border-[rgba(184,146,42,0.3)]"
                />

                {/* Badge principal */}
                {i === 0 && (
                  <span className="absolute top-1.5 left-1.5 text-[8px] tracking-[1px] uppercase bg-[#B8922A] text-[#1A1A1A] px-2 py-0.5 rounded-[2px] font-medium">
                    Principal
                  </span>
                )}

                {/* Overlay acciones */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-[2px] flex items-center justify-center gap-2">
                  {i > 0 && (
                    <button
                      onClick={() => moverImagen(i, i - 1)}
                      className="p-1.5 bg-[rgba(184,146,42,0.92)] text-[#1A1A1A] rounded-[2px] hover:bg-[#B8922A] transition-colors"
                      title="Mover a principal"
                    >
                      <GripVertical size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => eliminarImagen(url)}
                    className="p-1.5 bg-[rgba(248,113,113,0.9)] text-white rounded-[2px] hover:bg-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Zona de drop */}
      {imagenes.length < 6 && (
        <label
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`block cursor-pointer border border-dashed rounded-[2px] px-4 py-8 text-center transition-all duration-200 ${
            dragOver
              ? 'border-[#B8922A] bg-[rgba(184,146,42,0.14)]'
              : 'border-[rgba(184,146,42,0.36)] hover:border-[rgba(184,146,42,0.62)] hover:bg-[rgba(184,146,42,0.24)]'
          }`}
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-[rgba(240,235,228,0.65)]">
              <Loader2 size={16} className="animate-spin text-[#B8922A]" />
              <span className="text-[11px] font-light tracking-[1px]">Subiendo imágenes...</span>
            </div>
          ) : (
            <>
              <ImageIcon size={20} className="mx-auto mb-2 text-[rgba(184,146,42,0.5)]" />
              <p className="text-[11px] tracking-[0.5px] text-[rgba(240,235,228,0.52)] font-light">
                Arrastra imágenes aquí o{' '}
                <span className="text-[#B8922A]">haz clic para seleccionar</span>
              </p>
              <p className="text-[9px] tracking-[1px] text-[rgba(240,235,228,0.52)] font-light mt-1 uppercase">
                JPG, PNG, WEBP — Máx. 5MB por imagen
              </p>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={e => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      )}
    </div>
  )
}