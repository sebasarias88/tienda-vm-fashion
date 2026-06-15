'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Producto, Categoria } from '@/types'
import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import ImageUploader from '@/components/admin/ImageUploader'
import VariacionesEditor from '@/components/admin/VariacionesEditor'
import toast from 'react-hot-toast'

type ProductFormProps = {
  producto?: Producto | null
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

export default function ProductForm({ producto, onSuccess, onCancel }: ProductFormProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    slug: '',
    descripcion: '',
    precio: '',
    precio_antes: '',
    precio_mayoreo: '',
    precio_antes_mayoreo: '',
    disponible: true,
    destacado: false,
    categoria_id: '',
    imagenes: [] as string[],
    sku: '',
    orden: 0,
  })

  useEffect(() => {
    supabase
      .from('categorias')
      .select('*')
      .eq('activa', true)
      .order('orden')
      .then(({ data }) => setCategorias(data || []))

    if (producto) {
      setForm({
        nombre: producto.nombre,
        slug: producto.slug,
        descripcion: producto.descripcion || '',
        precio: producto.precio.toString(),
        precio_antes: producto.precio_antes?.toString() || '',
        precio_mayoreo: producto.precio_mayoreo?.toString() || '',
        precio_antes_mayoreo: producto.precio_antes_mayoreo?.toString() || '',
        disponible: producto.disponible,
        destacado: producto.destacado,
        categoria_id: producto.categoria_id || '',
        imagenes: producto.imagenes || [],
        sku: producto.sku || '',
        orden: producto.orden,
      })
    }
  }, [producto])

  const generarSlug = (nombre: string) =>
    nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')

  const handleNombre = (nombre: string) => {
    setForm(f => ({
      ...f,
      nombre,
      slug: producto ? f.slug : generarSlug(nombre),
    }))
  }

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    if (!form.precio || isNaN(Number(form.precio))) {
      toast.error('El precio es requerido')
      return
    }

    setSaving(true)
    const payload = {
      nombre: form.nombre.trim(),
      slug: form.slug.trim(),
      descripcion: form.descripcion.trim() || null,
      precio: Number(form.precio),
      precio_antes: form.precio_antes ? Number(form.precio_antes) : null,
      precio_mayoreo: form.precio_mayoreo ? Number(form.precio_mayoreo) : null,
      precio_antes_mayoreo: form.precio_antes_mayoreo ? Number(form.precio_antes_mayoreo) : null,
      disponible: form.disponible,
      destacado: form.destacado,
      categoria_id: form.categoria_id || null,
      imagenes: form.imagenes,
      sku: form.sku.trim() || null,
      orden: form.orden,
    }

    if (producto) {
      const { error } = await supabase.from('productos').update(payload).eq('id', producto.id)

      if (error) {
        if (error.code === '23505') toast.error('Ya existe un producto con ese slug')
        else toast.error('Error al actualizar producto')
        setSaving(false)
        return
      }
      toast.success('Producto actualizado')
    } else {
      const { error } = await supabase.from('productos').insert([payload])

      if (error) {
        if (error.code === '23505') toast.error('Ya existe un producto con ese slug')
        else toast.error('Error al crear producto')
        setSaving(false)
        return
      }
      toast.success('Producto creado')
    }

    setSaving(false)
    onSuccess()
  }

  const inputSelect = `w-full rounded-[2px] border border-[var(--border-input)] bg-[var(--bg-muted)] px-4 py-3 text-[13px] font-light text-[var(--text-primary)] focus:border-[rgba(201,168,76,0.65)] focus:outline-none transition-colors`

  return (
    <div className="space-y-8">
      <FormSection title="Imágenes">
        <ImageUploader
          imagenes={form.imagenes}
          onChange={imgs => setForm(f => ({ ...f, imagenes: imgs }))}
        />
      </FormSection>

      <FormSection title="Información">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Nombre *"
            value={form.nombre}
            onChange={e => handleNombre(e.target.value)}
            placeholder="Ej: Shampoo Keratina Pro"
          />
          <Input
            label="Slug (URL)"
            value={form.slug}
            onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
            placeholder="shampoo-keratina-pro"
            hint="Generado automáticamente al escribir el nombre"
          />
        </div>
        <Textarea
          label="Descripción"
          value={form.descripcion}
          onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
          placeholder="Descripción detallada del producto..."
          rows={3}
        />
      </FormSection>

      <FormSection title="Precios — Detal">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Precio (COP) *"
            type="number"
            value={form.precio}
            onChange={e => setForm(f => ({ ...f, precio: e.target.value }))}
            placeholder="45000"
          />
          <Input
            label="Precio anterior (tachado)"
            type="number"
            value={form.precio_antes}
            onChange={e => setForm(f => ({ ...f, precio_antes: e.target.value }))}
            placeholder="60000"
            hint="Opcional — para mostrar descuento"
          />
        </div>
      </FormSection>

      <FormSection title="Precios — Mayoreo">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Precio mayoreo (COP)"
            type="number"
            value={form.precio_mayoreo}
            onChange={e => setForm(f => ({ ...f, precio_mayoreo: e.target.value }))}
            placeholder="38000"
            hint="Catálogo al por mayor"
          />
          <Input
            label="Precio mayoreo anterior"
            type="number"
            value={form.precio_antes_mayoreo}
            onChange={e => setForm(f => ({ ...f, precio_antes_mayoreo: e.target.value }))}
            placeholder="50000"
            hint="Opcional — precio tachado en mayoreo"
          />
        </div>
      </FormSection>

      <FormSection title="Clasificación">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="block text-[10px] font-light uppercase tracking-[2px] text-[var(--text-muted)]">
              Categoría
            </label>
            <select
              value={form.categoria_id}
              onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
              className={inputSelect}
            >
              <option value="">Sin categoría</option>
              {categorias.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="SKU"
            value={form.sku}
            onChange={e => setForm(f => ({ ...f, sku: e.target.value }))}
            placeholder="Ej: SH-KER-001"
            hint="Código interno opcional"
          />
        </div>
        <Input
          label="Orden de aparición"
          type="number"
          value={form.orden}
          onChange={e => setForm(f => ({ ...f, orden: Number(e.target.value) }))}
          hint="Menor número = aparece primero en el catálogo"
        />
      </FormSection>

      <FormSection title="Visibilidad">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[
            {
              key: 'disponible' as const,
              label: 'Producto disponible',
              desc: 'Si está desactivado aparece como agotado',
            },
            {
              key: 'destacado' as const,
              label: 'Producto destacado',
              desc: 'Aparece en la sección de inicio',
            },
          ].map(({ key, label, desc }) => (
            <div
              key={key}
              className="flex items-center justify-between rounded-[2px] border border-[rgba(201,168,76,0.18)] bg-[var(--bg-muted)] px-4 py-3.5"
            >
              <div className="pr-4">
                <p className="text-[13px] font-light text-[var(--text-primary)]">{label}</p>
                <p className="mt-0.5 text-[11px] font-light text-[var(--text-muted)]">
                  {desc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, [key]: !f[key] }))}
                className={`relative h-5 w-10 shrink-0 rounded-full transition-all duration-300 ${
                  form[key] ? 'bg-[var(--gold-bright)]' : 'bg-[rgba(248,246,241,0.22)]'
                }`}
                aria-pressed={form[key]}
              >
                <span
                  className={`absolute top-0.5 h-4 w-4 rounded-full bg-[var(--bg-card)] shadow transition-all duration-300 ${
                    form[key] ? 'left-5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </FormSection>

      <FormSection title="Variaciones">
        <VariacionesEditor productoId={producto?.id ?? null} />
      </FormSection>

      <div className="sticky bottom-0 -mx-6 flex gap-3 border-t border-[rgba(201,168,76,0.18)] bg-[var(--bg-card)] px-6 py-4">
        <Button variant="outline" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
        <Button
          onClick={handleGuardar}
          loading={saving}
          fullWidth
          className=""
        >
          {producto ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </div>
  )
}
