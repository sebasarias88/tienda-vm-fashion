'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Categoria } from '@/types'
import { Input } from '@/components/ui/Input'
import { AdminSelect } from '@/components/ui/AdminSelect'
import Button from '@/components/ui/Button'
import AdminFormLayout from '@/components/admin/mobile/AdminFormLayout'
import toast from 'react-hot-toast'
import { ImageIcon, X, Layers, CornerDownRight } from 'lucide-react'

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
        <h3 className="admin-form-section-title shrink-0">
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
  const [tipo, setTipo] = useState<'principal' | 'subcategoria'>('principal')
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
      setTipo(categoria.padre_id ? 'subcategoria' : 'principal')
    } else {
      setForm({
        nombre: '',
        slug: '',
        imagen_url: '',
        orden: ordenDefault,
        activa: true,
        padre_id: '',
      })
      setTipo('principal')
    }
  }, [categoria, ordenDefault])

  const seleccionarTipo = (nuevoTipo: 'principal' | 'subcategoria') => {
    setTipo(nuevoTipo)
    if (nuevoTipo === 'principal') {
      setForm(f => ({ ...f, padre_id: '' }))
    }
  }

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
    if (tipo === 'subcategoria' && !form.padre_id) {
      toast.error('Elige dentro de qué categoría va esta subcategoría')
      return
    }

    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      slug: form.slug.trim(),
      imagen_url: form.imagen_url || null,
      orden: form.orden,
      activa: form.activa,
      padre_id: tipo === 'subcategoria' ? form.padre_id || null : null,
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

      <FormSection title="Tipo">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => seleccionarTipo('principal')}
            aria-pressed={tipo === 'principal'}
            className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all md:rounded-[2px] ${
              tipo === 'principal'
                ? 'border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.1)] shadow-[inset_0_1px_0_rgba(201,168,76,0.12)]'
                : 'border-[var(--border-input)] bg-[var(--bg-card)] hover:border-[rgba(201,168,76,0.3)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border ${
                  tipo === 'principal'
                    ? 'border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.18)] text-[var(--gold-bright)]'
                    : 'border-[var(--border-input)] text-[var(--text-muted)]'
                }`}
              >
                <Layers size={15} />
              </span>
              <span
                className={`text-[12px] font-medium uppercase tracking-[1px] ${
                  tipo === 'principal' ? 'text-[var(--gold-bright)]' : 'text-[var(--text-primary)]'
                }`}
              >
                Categoría principal
              </span>
            </div>
            <p className="text-[11px] font-light leading-relaxed text-[var(--text-muted)]">
              Aparece como una sección principal de la tienda. Puede agrupar
              subcategorías dentro.
            </p>
          </button>

          <button
            type="button"
            onClick={() => seleccionarTipo('subcategoria')}
            aria-pressed={tipo === 'subcategoria'}
            className={`flex flex-col gap-2 rounded-xl border p-4 text-left transition-all md:rounded-[2px] ${
              tipo === 'subcategoria'
                ? 'border-[rgba(201,168,76,0.5)] bg-[rgba(201,168,76,0.1)] shadow-[inset_0_1px_0_rgba(201,168,76,0.12)]'
                : 'border-[var(--border-input)] bg-[var(--bg-card)] hover:border-[rgba(201,168,76,0.3)]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border ${
                  tipo === 'subcategoria'
                    ? 'border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.18)] text-[var(--gold-bright)]'
                    : 'border-[var(--border-input)] text-[var(--text-muted)]'
                }`}
              >
                <CornerDownRight size={15} />
              </span>
              <span
                className={`text-[12px] font-medium uppercase tracking-[1px] ${
                  tipo === 'subcategoria' ? 'text-[var(--gold-bright)]' : 'text-[var(--text-primary)]'
                }`}
              >
                Subcategoría
              </span>
            </div>
            <p className="text-[11px] font-light leading-relaxed text-[var(--text-muted)]">
              Va agrupada dentro de una categoría principal (ej: “Shampoo”
              dentro de “Cabello”).
            </p>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tipo === 'subcategoria' && (
            <div className="space-y-1.5">
              <label className="admin-form-label">Dentro de la categoría *</label>
              <AdminSelect
                value={form.padre_id}
                onChange={padre_id => setForm(f => ({ ...f, padre_id }))}
                groups={[
                  {
                    label: 'Categorías principales',
                    options: categoriasRaiz
                      .filter(c => c.id !== categoria?.id)
                      .map(c => ({ value: c.id, label: c.nombre })),
                  },
                ]}
                placeholder="Selecciona la categoría principal"
              />
              <p className="admin-form-hint">
                Esta subcategoría aparecerá agrupada aquí
              </p>
            </div>
          )}
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
            <div className="admin-upload-zone min-h-[10rem] md:min-h-[9.5rem]">
              {uploadingImg ? (
                <p className="animate-pulse text-[12px] text-[var(--text-muted)]">
                  Subiendo imagen...
                </p>
              ) : (
                <>
                  <ImageIcon size={20} className="mx-auto mb-2 text-[rgba(201,168,76,0.72)]" />
                  <p className="admin-upload-zone__title">
                    {form.imagen_url ? 'Cambiar imagen' : 'Subir imagen de categoría'}
                  </p>
                  <p className="admin-upload-zone__meta">JPG, PNG o WebP — opcional</p>
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
        <div className="admin-form-panel flex items-center justify-between px-4 py-3.5">
          <div className="pr-4">
            <p className="admin-form-panel__title">Categoría activa</p>
            <p className="admin-form-panel__desc">Las inactivas no aparecen en la tienda</p>
          </div>
          <button
            type="button"
            onClick={() => setForm(f => ({ ...f, activa: !f.activa }))}
            className={`admin-toggle ${form.activa ? 'admin-toggle--on' : 'admin-toggle--off'}`}
            aria-pressed={form.activa}
          >
            <span className="admin-toggle__thumb" />
          </button>
        </div>
      </FormSection>
    </AdminFormLayout>
  )
}
