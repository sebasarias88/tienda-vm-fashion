'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Categoria } from '@/types'
import { Input } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import AdminFormLayout from '@/components/admin/mobile/AdminFormLayout'
import toast from 'react-hot-toast'
import { ImageIcon, X } from 'lucide-react'

type CategoriaFormProps = {
  categoria?: Categoria | null
  categoriasRaiz: Categoria[]
  ordenDefault?: number
  onSuccess: () => void
  onCancel: () => void
}

function FormSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-gradient-to-r from-[rgba(201,168,76,0.35)] to-transparent" />
        <h3 className="shrink-0 text-[10px] font-light uppercase tracking-[2.5px] text-[rgba(201,168,76,0.88)]">
          {title}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-l from-[rgba(201,168,76,0.35)] to-transparent" />
      </div>
      {children}
    </section>
  )
}

const generarSlug = (nombre: string) =>
  nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export default function CategoriaForm({
  categoria,
  categoriasRaiz,
  ordenDefault = 0,
  onSuccess,
  onCancel,
}: CategoriaFormProps) {
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    imagen_url: '',
    orden: ordenDefault,
    activa: true,
    padre_id: '',
  })

  useEffect(() => {
    if (categoria) {
      setForm({
        nombre: categoria.nombre,
        slug: categoria.slug,
        imagen_url: categoria.imagen_url || '',
        orden: categoria.orden,
        activa: categoria.activa,
        padre_id: categoria.padre_id || '',
      })
    } else {
      setForm({
        nombre: '',
        slug: '',
        imagen_url: '',
        orden: ordenDefault,
        activa: true,
        padre_id: '',
      })
    }
  }, [categoria, ordenDefault])

  const handleNombreChange = (nombre: string) => {
    setForm(f => ({
      ...f,
      nombre,
      slug: categoria ? f.slug : generarSlug(nombre),
    }))
  }

  const handleImagenUpload = async (file: File) => {
    setUploadingImg(true)
    const ext = file.name.split('.').pop()
    const path = `categorias/${Date.now()}.${ext}`

    const { error } = await supabase.storage.from('productos').upload(path, file, { upsert: true })

    if (error) {
      toast.error('Error al subir imagen')
      setUploadingImg(false)
      return
    }

    const { data } = supabase.storage.from('productos').getPublicUrl(path)
    setForm(f => ({ ...f, imagen_url: data.publicUrl }))
    toast.success('Imagen subida')
    setUploadingImg(false)
  }

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }

    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      slug: form.slug.trim(),
      imagen_url: form.imagen_url || null,
      orden: form.orden,
      activa: form.activa,
      padre_id: form.padre_id || null,
    }

    if (categoria) {
      const { error } = await supabase
        .from('categorias')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', categoria.id)

      if (error) {
        if (error.code === '23505') toast.error('Ya existe una categoría con ese slug')
        else toast.error('Error al actualizar')
        setSaving(false)
        return
      }
      toast.success('Categoría actualizada')
    } else {
      const { error } = await supabase.from('categorias').insert([payload])

      if (error) {
        if (error.code === '23505') toast.error('Ya existe una categoría con ese slug')
        else toast.error('Error al crear categoría')
        setSaving(false)
        return
      }
      toast.success('Categoría creada')
    }

    setSaving(false)
    onSuccess()
  }

  const inputSelect = `w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-muted)] px-4 py-3 text-[13px] font-light text-[var(--text-primary)] focus:border-[rgba(201,168,76,0.65)] focus:outline-none transition-colors md:rounded-[2px]`

  return (
    <AdminFormLayout
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel} fullWidth>
            Cancelar
          </Button>
          <Button onClick={handleGuardar} loading={saving} fullWidth>
            {categoria ? 'Guardar cambios' : 'Crear categoría'}
          </Button>
        </div>
      }
    >
      <FormSection title="Información">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            label="Nombre *"
            value={form.nombre}
            onChange={e => handleNombreChange(e.target.value)}
            placeholder="Ej: Shampoo"
          />
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            placeholder="shampoo"
            hint="Generado automáticamente al escribir el nombre"
          />
        </div>
      </FormSection>

      <FormSection title="Clasificación">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-light uppercase tracking-[2px] text-[var(--text-muted)]">
              Categoría padre
            </label>
            <select
              value={form.padre_id}
              onChange={e => setForm(f => ({ ...f, padre_id: e.target.value }))}
              className={inputSelect}
            >
              <option value="">Ninguna — categoría raíz</option>
              {categoriasRaiz
                .filter(c => c.id !== categoria?.id)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
            </select>
            <p className="text-[10px] font-light tracking-[0.3px] text-[var(--text-subtle)]">
              Opcional — convierte esta en subcategoría
            </p>
          </div>
          <Input
            label="Orden de aparición"
            type="number"
            value={form.orden}
            onChange={e => setForm(f => ({ ...f, orden: Number(e.target.value) }))}
            hint="Menor número = aparece primero"
          />
        </div>
      </FormSection>

      <FormSection title="Imagen">
        <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
          {form.imagen_url ? (
            <div className="relative mx-auto h-36 w-36 shrink-0 md:mx-0 md:h-[9.5rem] md:w-[9.5rem]">
              <div className="h-full w-full overflow-hidden rounded-xl border border-[rgba(201,168,76,0.2)] bg-white md:rounded-[2px]">
                <img
                  src={form.imagen_url}
                  alt="Vista previa"
                  className="h-full w-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, imagen_url: '' }))}
                className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full border border-[rgba(201,168,76,0.3)] bg-[var(--bg-card)] text-[var(--text-muted)] transition-colors hover:border-red-400/50 hover:text-red-400"
                aria-label="Quitar imagen"
              >
                <X size={12} />
              </button>
            </div>
          ) : null}
          <label className="flex min-w-0 flex-1 cursor-pointer flex-col">
            <div className="flex min-h-[10rem] flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-[rgba(201,168,76,0.35)] bg-[var(--bg-muted)] px-4 py-8 text-center transition-all active:border-[rgba(201,168,76,0.55)] active:bg-[rgba(201,168,76,0.06)] md:min-h-[9.5rem] md:rounded-[2px] md:hover:border-[rgba(201,168,76,0.55)] md:hover:bg-[rgba(201,168,76,0.06)]">
              {uploadingImg ? (
                <p className="animate-pulse text-[12px] font-light text-[var(--text-muted)]">
                  Subiendo imagen...
                </p>
              ) : (
                <>
                  <ImageIcon size={20} className="mx-auto mb-2 text-[rgba(201,168,76,0.65)]" />
                  <p className="text-[12px] font-light text-[var(--text-primary)]">
                    {form.imagen_url ? 'Cambiar imagen' : 'Subir imagen de categoría'}
                  </p>
                  <p className="mt-1 text-[10px] font-light text-[var(--text-subtle)]">
                    JPG, PNG o WebP — opcional
                  </p>
                </>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploadingImg}
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) handleImagenUpload(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Visibilidad">
        <div className="flex items-center justify-between rounded-xl border border-[rgba(201,168,76,0.18)] bg-[var(--bg-muted)] px-4 py-3.5 md:rounded-[2px]">
          <div className="pr-4">
            <p className="text-[13px] font-light text-[var(--text-primary)]">Categoría activa</p>
            <p className="mt-0.5 text-[11px] font-light text-[var(--text-subtle)]">
              Las inactivas no aparecen en la tienda
            </p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, activa: !f.activa }))}
            className={`relative h-5 w-10 shrink-0 rounded-full transition-all duration-300 ${
              form.activa ? 'bg-[var(--gold-bright)]' : 'bg-[rgba(248,246,241,0.22)]'
            }`}
            aria-pressed={form.activa}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-[var(--bg-card)] shadow transition-all duration-300 ${
                form.activa ? 'left-5' : 'left-0.5'
              }`}
            />
          </button>
        </div>
      </FormSection>
    </AdminFormLayout>
  )
}
