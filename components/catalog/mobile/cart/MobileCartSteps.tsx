'use client'

import { Check } from 'lucide-react'

type Step = 'carrito' | 'datos' | 'resumen'

const STEPS: { id: Step; label: string }[] = [
  { id: 'carrito', label: 'Carrito' },
  { id: 'datos', label: 'Datos' },
  { id: 'resumen', label: 'Confirmar' },
]

type MobileCartStepsProps = {
  step: Step
  stepIndex: number
  onStepClick: (step: Step) => void
}

export default function MobileCartSteps({ step, stepIndex, onStepClick }: MobileCartStepsProps) {
  return (
    <nav className="mobile-cart-steps" aria-label="Pasos del pedido">
      <ol className="flex w-full items-start">
        {STEPS.map((s, i) => {
          const isActive = step === s.id
          const isDone = i < stepIndex
          const isClickable = i < stepIndex
          const leftConnectorGold = i > 0 && stepIndex >= i
          const rightConnectorGold = i < STEPS.length - 1 && stepIndex > i

          return (
            <li key={s.id} className="flex min-w-0 flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div
                  className={`mobile-cart-steps-connector h-[2px] flex-1 ${
                    i === 0 ? 'opacity-0' : leftConnectorGold ? 'mobile-cart-steps-connector--gold' : ''
                  }`}
                  aria-hidden
                />

                <span
                  className={`mobile-cart-steps-node relative z-[1] flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    isActive
                      ? 'border-[var(--gold)] bg-[var(--bg-base)] text-[var(--gold)]'
                      : isDone
                        ? 'border-[var(--gold)] bg-[var(--gold)] text-[var(--text-on-gold)]'
                        : 'border-[var(--border-input)] bg-[var(--bg-base)] text-[var(--text-subtle)]'
                  } ${!isActive && !isDone ? 'opacity-50' : ''}`}
                  aria-hidden
                >
                  {isDone && !isActive ? (
                    <Check size={14} strokeWidth={2.5} />
                  ) : (
                    <span className="text-[11px] font-semibold tabular-nums">{i + 1}</span>
                  )}
                </span>

                <div
                  className={`mobile-cart-steps-connector h-[2px] flex-1 ${
                    i === STEPS.length - 1 ? 'opacity-0' : rightConnectorGold ? 'mobile-cart-steps-connector--gold' : ''
                  }`}
                  aria-hidden
                />
              </div>

              <button
                type="button"
                disabled={!isClickable && !isActive}
                onClick={() => isClickable && onStepClick(s.id)}
                aria-current={isActive ? 'step' : undefined}
                className={`mt-2.5 max-w-[5.5rem] text-center text-[10px] font-medium uppercase leading-tight tracking-[0.6px] transition-colors disabled:cursor-default ${
                  isActive
                    ? 'text-[var(--gold)]'
                    : isDone
                      ? 'text-[var(--text-secondary)] enabled:active:text-[var(--gold)]'
                      : 'text-[var(--text-faint)]'
                }`}
              >
                {s.label}
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export type { Step }
