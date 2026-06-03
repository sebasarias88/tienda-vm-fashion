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
    nombre.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')

  const handleNombre = (nombre: string) => {
    setForm(f => ({
      ...f,
      nombre,
      slug: producto ? f.slug : generarSlug(nombre),
    }))
  }

  const handleGuardar = async () => {
    if (!form.nombre.trim()) { toast.error('El nombre es requerido'); return }
    if (!form.precio || isNaN(Number(form.precio))) { toast.error('El precio es requerido'); return }

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
      const { error } = await supabase
        .from('productos')
        .update(payload)
        .eq('id', producto.id)

      if (error) {
        if (error.code === '23505') toast.error('Ya existe un producto con ese slug')
        else toast.error('Error al actualizar producto')
        setSaving(false)
        return
      }
      toast.success('Producto actualizado')
    } else {
      const { error } = await supabase
        .from('productos')
        .insert([payload])

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

  const inputSelect = `w-full bg-[var(--bg-card)] border border-[rgba(26,26,26,0.22)]
    rounded-[2px] px-4 py-3 text-[13px] font-light text-[#1A1A1A]
    focus:outline-none focus:border-[rgba(184,146,42,0.65)] transition-colors`

  return (
    <div className="space-y-5">

      {/* Imágenes */}
      <ImageUploader
        imagenes={form.imagenes}
        onChange={imgs => setForm(f => ({ ...f, imagenes: imgs }))}
      />

      <div className="h-px bg-[rgba(184,146,42,0.18)]" />

      {/* Nombre y slug */}
      <div className="grid grid-cols-2 gap-4">
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
          hint="Generado automáticamente"
        />
      </div>

      {/* Descripción */}
      <Textarea
        label="Descripción"
        value={form.descripcion}
        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
        placeholder="Descripción detallada del producto..."
        rows={3}
      />

      {/* Precio */}
      <div className="grid grid-cols-2 gap-4">
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

      <div className="h-px bg-[rgba(184,146,42,0.18)]" />
      <p className="text-[11px] tracking-[2px] uppercase text-[rgba(240,235,228,0.65)] font-light">
        Precios Mayoreo
      </p>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio Mayoreo (COP)"
          type="number"
          value={form.precio_mayoreo}
          onChange={e => setForm(f => ({ ...f, precio_mayoreo: e.target.value }))}
          placeholder="38000"
          hint="Precio para el catálogo al por mayor"
        />
        <Input
          label="Precio Mayoreo anterior"
          type="number"
          value={form.precio_antes_mayoreo}
          onChange={e => setForm(f => ({ ...f, precio_antes_mayoreo: e.target.value }))}
          placeholder="50000"
          hint="Opcional — precio tachado en mayoreo"
        />
      </div>

      {/* Categoría y SKU */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-[11px] tracking-[2px] uppercase text-[rgba(240,235,228,0.65)] font-light">
            Categoría
          </label>
          <select
            value={form.categoria_id}
            onChange={e => setForm(f => ({ ...f, categoria_id: e.target.value }))}
            className={inputSelect}
          >
            <option value="">Sin categoría</option>
            {categorias.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.nombre}</option>
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

      {/* Orden */}
      <Input
        label="Orden de aparición"
        type="number"
        value={form.orden}
        onChange={e => setForm(f => ({ ...f, orden: Number(e.target.value) }))}
      />

      <div className="h-px bg-[rgba(184,146,42,0.18)]" />

      {/* Toggles */}
      <div className="space-y-3">
        {[
          { key: 'disponible', label: 'Producto disponible', desc: 'Si está desactivado aparece como agotado' },
          { key: 'destacado', label: 'Producto destacado', desc: 'Aparece primero en el catálogo' },
        ].map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-3 border border-[rgba(184,146,42,0.18)] rounded-[2px] px-4">
            <div>
              <p className="text-[13px] font-light text-[#1A1A1A] tracking-[0.3px]">{label}</p>
              <p className="text-[11px] text-[rgba(240,235,228,0.52)] font-light mt-0.5">{desc}</p>
            </div>
            <button
              type="button"
              onClick={() => setForm(f => ({ ...f, [key]: !f[key as keyof typeof f] }))}
              className={`relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0 ${
                form[key as keyof typeof form] ? 'bg-[#B8922A]' : 'bg-[rgba(240,235,228,0.28)]'
              }`}
            >
              <span className={`absolute top-0.5 w-4 h-4 bg-[var(--bg-card)] rounded-full shadow transition-all duration-300 ${
                form[key as keyof typeof form] ? 'left-5' : 'left-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="h-px bg-[rgba(184,146,42,0.18)]" />

      <VariacionesEditor productoId={producto?.id ?? null} />

      {/* Acciones */}
      <div className="flex gap-3 border-t border-[rgba(184,146,42,0.18)] pt-4">
        <Button variant="outline" onClick={onCancel} fullWidth>
          Cancelar
        </Button>
        <Button onClick={handleGuardar} loading={saving} fullWidth>
          {producto ? 'Guardar cambios' : 'Crear producto'}
        </Button>
      </div>
    </div>
  )
}