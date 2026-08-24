import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

type NivelRiesgo = 'BAJO' | 'MEDIO' | 'ALTO';

interface NivelConfig {
  color: string;
  gradientId: string;
  fillPercent: number;
  label: string;
}

@Component({
  selector: 'app-risk-thermometer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="thermometer-wrapper">
      <svg
        [attr.viewBox]="'0 0 60 160'"
        xmlns="http://www.w3.org/2000/svg"
        class="thermometer-svg"
      >
        <defs>
          <linearGradient id="grad-bajo" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#198754" />
            <stop offset="100%" stop-color="#20c997" />
          </linearGradient>
          <linearGradient id="grad-medio" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#ffc107" />
            <stop offset="100%" stop-color="#fd7e14" />
          </linearGradient>
          <linearGradient id="grad-alto" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stop-color="#dc3545" />
            <stop offset="100%" stop-color="#b02a37" />
          </linearGradient>
          <clipPath id="tube-clip">
            <rect x="18" y="15" width="24" height="100" rx="12" />
          </clipPath>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Bulb (bottom circle) -->
        <circle
          cx="30"
          cy="133"
          r="18"
          [attr.fill]="'url(#' + config().gradientId + ')'"
          class="bulb"
        />
        <circle
          cx="30"
          cy="133"
          r="12"
          fill="none"
          stroke="rgba(255,255,255,0.3)"
          stroke-width="1.5"
        />

        <!-- Tube background -->
        <rect
          x="18"
          y="15"
          width="24"
          height="100"
          rx="12"
          fill="#e9ecef"
          stroke="#dee2e6"
          stroke-width="1"
        />

        <!-- Tube fill (animated) -->
        <g clip-path="url(#tube-clip)">
          <rect
            x="18"
            [attr.y]="fillY()"
            width="24"
            [attr.height]="fillHeight()"
            [attr.fill]="'url(#' + config().gradientId + ')'"
            class="tube-fill"
          />
        </g>

        <!-- Tube border -->
        <rect
          x="18"
          y="15"
          width="24"
          height="100"
          rx="12"
          fill="none"
          stroke="#dee2e6"
          stroke-width="1.5"
        />

        <!-- Indicator dot -->
        <circle
          cx="30"
          [attr.cy]="indicatorY()"
          r="4"
          [attr.fill]="config().color"
          filter="url(#glow)"
          class="indicator"
        />

        <!-- Scale marks -->
        <line x1="44" y1="25" x2="48" y2="25" stroke="#adb5bd" stroke-width="1" />
        <line x1="44" y1="65" x2="48" y2="65" stroke="#adb5bd" stroke-width="1" />
        <line x1="44" y1="105" x2="48" y2="105" stroke="#adb5bd" stroke-width="1" />

        <!-- Scale labels -->
        <text x="52" y="28" fill="#6c757d" font-size="7" font-family="sans-serif">ALTO</text>
        <text x="52" y="68" fill="#6c757d" font-size="7" font-family="sans-serif">MEDIO</text>
        <text x="52" y="108" fill="#6c757d" font-size="7" font-family="sans-serif">BAJO</text>
      </svg>

      <div
        class="thermometer-label"
        [style.color]="config().color"
      >
        {{ config().label }}
      </div>
    </div>
  `,
  styles: `
    .thermometer-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .thermometer-svg {
      width: 60px;
      height: 160px;
    }

    .tube-fill {
      transition: y 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                  height 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .bulb {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
    }

    .indicator {
      transition: cy 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .thermometer-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }
  `,
})
export class RiskThermometerComponent {
  nivel = input.required<string>();

  private nivelMap: Record<string, NivelConfig> = {
    BAJO: { color: '#198754', gradientId: 'grad-bajo', fillPercent: 0.25, label: 'BAJO' },
    MEDIO: { color: '#fd7e14', gradientId: 'grad-medio', fillPercent: 0.55, label: 'MEDIO' },
    ALTO: { color: '#dc3545', gradientId: 'grad-alto', fillPercent: 0.85, label: 'ALTO' },
  };

  config = computed(() => {
    const key = (this.nivel() || 'BAJO').toUpperCase();
    return this.nivelMap[key] || this.nivelMap['BAJO'];
  });

  // tube: y=15, height=100. Fill from bottom up.
  fillY = computed(() => {
    const tubeTop = 15;
    const tubeHeight = 100;
    const fill = this.config().fillPercent;
    return tubeTop + tubeHeight * (1 - fill);
  });

  fillHeight = computed(() => {
    return 100 * this.config().fillPercent;
  });

  indicatorY = computed(() => {
    const tubeTop = 20;
    const tubeBottom = 110;
    const fill = this.config().fillPercent;
    return tubeBottom - (tubeBottom - tubeTop) * fill;
  });
}
