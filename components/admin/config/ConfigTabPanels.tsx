'use client'

import { Input, Textarea } from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import {
  Truck,
  CreditCard,
  Plus,
  Store,
  MapPin,
  Globe,
  Gift,
  Sparkles,
  Trash2,
} from 'lucide-react'
import {
  AdminTableHead,
  AdminTableHeaderRow,
  AdminTableTh,
  AdminTableBody,
  AdminTableRow,
  AdminTableTd,
  AdminTableEmpty,
} from '@/components/admin/AdminTable'
import MobilePaymentMethodCard from '@/components/admin/mobile/MobilePaymentMethodCard'
import { MobileEmptyState } from '@/components/admin/mobile/MobileAdminPrimitives'
import { Config, FormSection, InfoBanner, TabId } from '@/components/admin/config/config-ui'

export type ConfigTabPanelsProps = {
  tab: TabId
  config: Config
  updateConfig: (clave: string, valor: string) => void
  metodosPago: string[]
  nuevoMetodo: string
  setNuevoMetodo: (value: string) => void
  agregarMetodo: () => void
  quitarMetodo: (metodo: string) => void
  variant?: 'desktop' | 'mobile'
}

const inputInline =
  'min-w-0 w-full rounded-xl border border-[var(--border-input)] bg-[var(--bg-muted)] px-4 py-3 text-[13px] font-light text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:border-[rgba(201,168,76,0.65)] focus:outline-none transition-colors md:rounded-[2px]'

function ZoneCard({
  icon: Icon,
  title,
  subtitle,
  children,
  mobile,
}: {
  icon: typeof MapPin
  title: string
  subtitle: string
  children: React.ReactNode
  mobile?: boolean
}) {
  return (
    <div
      className={`mobile-admin-field rounded-xl border border-[rgba(201,168,76,0.2)] bg-[var(--bg-muted)] transition-colors md:rounded-[2px] ${
        mobile ? 'p-4' : 'p-5 hover:border-[rgba(201,168,76,0.35)]'
      }`}
    >
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.1)] md:rounded-[2px]">
          <Icon size={16} className="text-[var(--gold-bright)]" />
        </div>
        <div>
          <p className="text-[12px] font-light uppercase tracking-[1px] text-[var(--text-primary)]">
            {title}
          </p>
          <p className="text-[10px] font-light text-[var(--text-subtle)]">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  )
}

export default function ConfigTabPanels({
  tab,
  config,
  updateConfig,
  metodosPago,
  nuevoMetodo,
  setNuevoMetodo,
  agregarMetodo,
  quitarMetodo,
  variant = 'desktop',
}: ConfigTabPanelsProps) {
  const mobile = variant === 'mobile'

  if (tab === 'negocio') {
    return (
      <>
        <InfoBanner icon={Store} compact={mobile}>
          Aparecen en el footer, WhatsApp del checkout y mensajes al confirmar pedidos.
        </InfoBanner>
        <FormSection title="Datos del negocio">
          <div className={`grid grid-cols-1 gap-4 ${mobile ? '' : 'md:grid-cols-2'}`}>
            <Input
              label="Nombre del negocio"
              value={config['nombre_negocio'] || ''}
              onChange={e => updateConfig('nombre_negocio', e.target.value)}
              placeholder="Tienda VM Fashion"
            />
            <Input
              label="Número de WhatsApp *"
              value={config['whatsapp_numero'] || ''}
              onChange={e => updateConfig('whatsapp_numero', e.target.value)}
              placeholder="573185867702"
              hint="Con código de país, sin espacios"
            />
          </div>
        </FormSection>
      </>
    )
  }

  if (tab === 'contenido') {
    return (
      <>
        <InfoBanner icon={Sparkles} compact={mobile}>
          Textos visibles en la página de inicio y la sección nosotros.
        </InfoBanner>
        <FormSection title="Hero — Página de inicio">
          <div className={`grid grid-cols-1 gap-4 ${mobile ? '' : 'lg:grid-cols-2'}`}>
            <Input
              label="Título del inicio"
              value={config['hero_titulo'] || ''}
              onChange={e => updateConfig('hero_titulo', e.target.value)}
              placeholder="Tu ritual de belleza ideal"
            />
            <Input
              label="Subtítulo del inicio"
              value={config['hero_subtitulo'] || ''}
              onChange={e => updateConfig('hero_subtitulo', e.target.value)}
              placeholder="Productos profesionales para cada tipo de cabello..."
            />
          </div>
        </FormSection>
        <FormSection title="Sección Nosotros">
          <Textarea
            label="Texto descriptivo"
            value={config['texto_nosotros'] || ''}
            onChange={e => updateConfig('texto_nosotros', e.target.value)}
            placeholder="Somos Tienda VM Fashion, tu aliado de belleza en Armenia, Quindío."
            rows={mobile ? 6 : 5}
          />
        </FormSection>
      </>
    )
  }

  if (tab === 'envios') {
    return (
      <>
        <InfoBanner icon={Truck} compact={mobile}>
          Armenia usa tarifa local; el resto del país, tarifa nacional.
        </InfoBanner>
        <FormSection title="Tarifas por zona">
          <div className={`grid grid-cols-1 gap-4 ${mobile ? '' : 'sm:grid-cols-2'}`}>
            <ZoneCard icon={MapPin} title="Armenia" subtitle="Entrega local" mobile={mobile}>
              <div className="space-y-4">
                <Input
                  label="Costo (COP)"
                  type="number"
                  value={config['envio_armenia'] || ''}
                  onChange={e => updateConfig('envio_armenia', e.target.value)}
                  placeholder="5000"
                />
                <Input
                  label="Tiempo de entrega"
                  value={config['tiempo_entrega_armenia'] || ''}
                  onChange={e => updateConfig('tiempo_entrega_armenia', e.target.value)}
                  placeholder="El mismo día"
                />
              </div>
            </ZoneCard>
            <ZoneCard icon={Globe} title="Resto del país" subtitle="Envío nacional" mobile={mobile}>
              <div className="space-y-4">
                <Input
                  label="Costo (COP)"
                  type="number"
                  value={config['envio_nacional'] || ''}
                  onChange={e => updateConfig('envio_nacional', e.target.value)}
                  placeholder="0"
                  hint="0 = A convenir con el cliente"
                />
                <Input
                  label="Tiempo de entrega"
                  value={config['tiempo_entrega_nacional'] || ''}
                  onChange={e => updateConfig('tiempo_entrega_nacional', e.target.value)}
                  placeholder="2 a 3 días hábiles"
                />
              </div>
            </ZoneCard>
          </div>
        </FormSection>
        <FormSection title="Promoción de envío">
          <div className={`mobile-admin-field rounded-xl border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.06)] md:rounded-[2px] ${mobile ? 'p-4' : 'p-5'}`}>
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.12)] md:rounded-[2px]">
                <Gift size={16} className="text-[var(--gold-bright)]" />
              </div>
              <div>
                <p className="text-[12px] font-light uppercase tracking-[1px] text-[var(--text-primary)]">
                  Envío gratis
                </p>
                <p className="text-[10px] font-light text-[var(--text-subtle)]">
                  Monto mínimo para aplicar
                </p>
              </div>
            </div>
            <Input
              label="Aplicar envío gratis desde (COP)"
              type="number"
              value={config['envio_gratis_desde'] || ''}
              onChange={e => updateConfig('envio_gratis_desde', e.target.value)}
              placeholder="0"
              hint="0 = Desactivado. Ej: 100000"
            />
          </div>
        </FormSection>
      </>
    )
  }

  return (
    <>
      <InfoBanner icon={CreditCard} compact={mobile}>
        Opciones en el paso de pago del carrito. Agrega al menos uno.
      </InfoBanner>

      <FormSection title="Métodos activos">
        {mobile ? (
          metodosPago.length === 0 ? (
            <MobileEmptyState
              icon={CreditCard}
              title="Sin métodos de pago"
              description="Agrega al menos uno abajo"
            />
          ) : (
            <div className="space-y-2.5">
              {metodosPago.map(metodo => (
                <MobilePaymentMethodCard
                  key={metodo}
                  metodo={metodo}
                  onRemove={() => quitarMetodo(metodo)}
                />
              ))}
            </div>
          )
        ) : (
          <div className="overflow-x-auto rounded-[2px] border border-[var(--border-card)]">
            <table className="w-full" style={{ minWidth: '480px' }}>
              <AdminTableHead>
                <AdminTableHeaderRow>
                  <AdminTableTh className="w-14">#</AdminTableTh>
                  <AdminTableTh>Método de pago</AdminTableTh>
                  <AdminTableTh className="w-28 text-right">Acciones</AdminTableTh>
                </AdminTableHeaderRow>
              </AdminTableHead>
              <AdminTableBody>
                {metodosPago.length === 0 ? (
                  <AdminTableEmpty
                    colSpan={3}
                    icon={CreditCard}
                    title="Sin métodos de pago"
                    description="Agrega al menos uno usando el formulario de abajo"
                  />
                ) : (
                  metodosPago.map((metodo, i) => (
                    <AdminTableRow key={metodo}>
                      <AdminTableTd>
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-[2px] border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[11px] font-light tabular-nums text-[var(--text-muted)]">
                          {i + 1}
                        </span>
                      </AdminTableTd>
                      <AdminTableTd>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-[rgba(201,168,76,0.2)] bg-[rgba(201,168,76,0.08)]">
                            <CreditCard size={14} className="text-[var(--gold-bright)]" />
                          </div>
                          <span className="text-[13px] font-light text-[var(--text-primary)]">{metodo}</span>
                        </div>
                      </AdminTableTd>
                      <AdminTableTd className="text-right">
                        <button
                          type="button"
                          onClick={() => quitarMetodo(metodo)}
                          className="inline-flex items-center gap-1.5 rounded-[2px] border border-transparent px-2.5 py-1.5 text-[var(--text-muted)] transition-all hover:border-[rgba(248,113,113,0.25)] hover:bg-[rgba(248,113,113,0.08)] hover:text-red-400"
                          aria-label={`Eliminar ${metodo}`}
                        >
                          <Trash2 size={14} />
                          <span className="text-[10px] font-light uppercase tracking-[1px]">Quitar</span>
                        </button>
                      </AdminTableTd>
                    </AdminTableRow>
                  ))
                )}
              </AdminTableBody>
            </table>
          </div>
        )}
      </FormSection>

      <FormSection title="Agregar método">
        {mobile ? (
          <div className="pb-6">
            <div className="flex items-center gap-2 rounded-xl border border-[var(--border-input)] bg-[var(--bg-muted)] py-1.5 pl-4 pr-1.5">
              <input
                type="text"
                value={nuevoMetodo}
                onChange={e => setNuevoMetodo(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    agregarMetodo()
                  }
                }}
                placeholder="Ej: Nequi, Bancolombia, Efectivo..."
                className="mobile-config-add-input min-h-[2.75rem] min-w-0 flex-1 border-0 bg-transparent py-2 text-[13px] font-light text-[var(--text-primary)] placeholder:text-[var(--text-subtle)] focus:outline-none"
              />
              <button
                type="button"
                onClick={agregarMetodo}
                disabled={!nuevoMetodo.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.35)] bg-[var(--gold-bright)] text-[var(--bg-base)] transition-opacity disabled:opacity-35"
                aria-label="Agregar método"
              >
                <Plus size={17} strokeWidth={2} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              value={nuevoMetodo}
              onChange={e => setNuevoMetodo(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  agregarMetodo()
                }
              }}
              placeholder="Ej: Nequi, Bancolombia, Efectivo..."
              className={inputInline}
            />
            <Button type="button" onClick={agregarMetodo} size="sm" className="shrink-0 sm:w-auto">
              <Plus size={13} />
              Agregar
            </Button>
          </div>
        )}
      </FormSection>
    </>
  )
}
