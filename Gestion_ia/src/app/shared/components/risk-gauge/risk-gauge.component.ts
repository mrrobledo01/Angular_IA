import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NivelConfig {
  color: string;
  bgClass: string;
}

@Component({
  selector: 'app-risk-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="gauge-wrapper">
      <div class="gauge-header">
        <span class="gauge-nivel" [style.color]="config().color">{{ nivel() }}</span>
        <span class="gauge-valor">&middot; {{ valorNormalizado() }}/100</span>
      </div>

      <div class="gauge-track">
        <div class="gauge-zone zone-bajo"></div>
        <div class="gauge-zone zone-medio"></div>
        <div class="gauge-zone zone-alto"></div>

        <div
          class="gauge-indicator"
          [style.left.%]="indicadorPos()"
        >
          <div class="indicator-arrow"></div>
          <div class="indicator-dot" [style.background]="config().color"></div>
        </div>
      </div>

      <div class="gauge-labels">
        <span class="label-bajo">Bajo</span>
        <span class="label-medio">Medio</span>
        <span class="label-alto">Alto</span>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 320px;
    }

    .gauge-wrapper {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .gauge-header {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .gauge-nivel {
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .gauge-valor {
      font-size: 12px;
      color: #6c757d;
      font-weight: 500;
    }

    .gauge-track {
      position: relative;
      height: 14px;
      display: flex;
      border-radius: 7px;
      overflow: visible;
      box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .gauge-zone {
      flex: 1;
      height: 100%;
    }

    .zone-bajo {
      background: linear-gradient(135deg, #198754, #20c997);
      border-radius: 7px 0 0 7px;
    }

    .zone-medio {
      background: linear-gradient(135deg, #ffc107, #fd7e14);
    }

    .zone-alto {
      background: linear-gradient(135deg, #dc3545, #b02a37);
      border-radius: 0 7px 7px 0;
    }

    .gauge-indicator {
      position: absolute;
      top: -6px;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2;
    }

    .indicator-arrow {
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 6px solid #343a40;
    }

    .indicator-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 2px solid #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
      margin-top: -1px;
    }

    .gauge-labels {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #6c757d;
      padding: 0 2px;
    }

    .label-bajo {
      flex: 1;
      text-align: center;
    }

    .label-medio {
      flex: 1;
      text-align: center;
    }

    .label-alto {
      flex: 1;
      text-align: center;
    }
  `,
})
export class RiskGaugeComponent {
  valor = input.required<number>();
  nivel = input.required<string>();

  private nivelConfigs: Record<string, NivelConfig> = {
    BAJO: { color: '#198754', bgClass: 'text-success' },
    MEDIO: { color: '#fd7e14', bgClass: 'text-warning' },
    ALTO: { color: '#dc3545', bgClass: 'text-danger' },
  };

  config = computed(() => {
    const key = (this.nivel() || 'BAJO').toUpperCase();
    return this.nivelConfigs[key] || this.nivelConfigs['BAJO'];
  });

  valorNormalizado = computed(() => {
    const v = this.valor();
    if (v == null || isNaN(v)) return 0;
    // Si el valor ya está en 0-100, usarlo directo
    if (v >= 0 && v <= 100) return Math.round(v);
    // Si es 0-1, escalar a 0-100
    if (v >= 0 && v <= 1) return Math.round(v * 100);
    // Si es mayor a 100, asumir escala 0-1000 y normalizar
    return Math.min(100, Math.round((v / 1000) * 100));
  });

  indicadorPos = computed(() => {
    // Posición porcentual (0-100%) dentro de la barra
    return Math.max(0, Math.min(100, this.valorNormalizado()));
  });
}
