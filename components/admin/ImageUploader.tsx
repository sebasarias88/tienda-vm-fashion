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
      <label className="block text-[10px] font-light uppercase tracking-[2px] text-[rgba(248,246,241,0.65)]">
        Imágenes del producto
        <span className="ml-2 text-[rgba(248,246,241,0.45)]">({imagenes.length}/6)</span>
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-stretch">
        {imagenes.length > 0 && (
          <div className="grid shrink-0 grid-cols-3 gap-2 sm:w-[9.75rem] sm:grid-cols-2 sm:content-start">
            <AnimatePresence>
              {imagenes.map((url, i) => (
                <motion.div
                  key={url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative aspect-square"
                >
                  <img
                    src={url}
                    alt={`Imagen ${i + 1}`}
                    className="h-full w-full rounded-[2px] border border-[rgba(212,175,55,0.28)] bg-white object-cover"
                  />

                  {i === 0 && (
                    <span className="absolute left-1.5 top-1.5 rounded-[2px] bg-[#D4AF37] px-1.5 py-0.5 text-[8px] font-medium uppercase tracking-[1px] text-[#0D0D0D]">
                      Principal
                    </span>
                  )}

                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 rounded-[2px] bg-black/55 opacity-0 transition-opacity group-hover:opacity-100">
                    {i > 0 && (
                      <button
                        type="button"
                        onClick={() => moverImagen(i, i - 1)}
                        className="rounded-[2px] bg-[rgba(212,175,55,0.92)] p-1.5 text-[#0D0D0D] transition-colors hover:bg-[#D4AF37]"
                        title="Mover a principal"
                      >
                        <GripVertical size={12} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => eliminarImagen(url)}
                      className="rounded-[2px] bg-[rgba(248,113,113,0.92)] p-1.5 text-white transition-colors hover:bg-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {imagenes.length < 6 && (
          <label
            onDragOver={e => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex min-h-[9.5rem] min-w-0 flex-1 cursor-pointer flex-col items-center justify-center rounded-[2px] border border-dashed px-4 py-8 text-center transition-all duration-200 ${
              dragOver
                ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)]'
                : 'border-[rgba(212,175,55,0.35)] bg-[#161616] hover:border-[rgba(212,175,55,0.55)] hover:bg-[rgba(212,175,55,0.06)]'
            }`}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-[rgba(248,246,241,0.65)]">
                <Loader2 size={16} className="animate-spin text-[#D4AF37]" />
                <span className="text-[11px] font-light tracking-[1px]">Subiendo imágenes...</span>
              </div>
            ) : (
              <>
                <ImageIcon size={20} className="mb-2 text-[rgba(212,175,55,0.55)]" />
                <p className="text-[12px] font-light text-[#F8F6F1]">
                  Arrastra imágenes aquí o{' '}
                  <span className="text-[#D4AF37]">haz clic para seleccionar</span>
                </p>
                <p className="mt-1 text-[10px] font-light uppercase tracking-[1px] text-[rgba(248,246,241,0.42)]">
                  JPG, PNG, WEBP — Máx. 5MB
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
    </div>
  )
}
