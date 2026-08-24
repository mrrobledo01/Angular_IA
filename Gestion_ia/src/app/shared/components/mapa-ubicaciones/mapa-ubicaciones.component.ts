import { Component, Input, OnChanges, SimpleChanges, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { PuntoGeorreferenciado } from '../../../../core/models/punto-georreferenciado.model';

@Component({
  selector: 'app-mapa-ubicaciones',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (puntos.length === 0) {
      <div class="text-center py-5">
        <i class="bi bi-geo-alt text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3 mb-0">El contribuyente no tiene ubicaciones georreferenciadas registradas</p>
      </div>
    } @else {
      <div class="mapa-container">
        <div #mapContainer class="mapa-el"></div>
      </div>
      <div class="mt-3">
        <h6 class="fw-bold mb-2">Listado de Ubicaciones</h6>
        <div class="table-responsive">
          <table class="table table-sm table-hover mb-0">
            <thead class="bg-light">
              <tr>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="text-end">Lat / Lng</th>
              </tr>
            </thead>
            <tbody>
              @for (p of puntos; track $index) {
                <tr class="cursor-pointer" (click)="centrarEnPunto(p)" [class.table-active]="puntoSeleccionado === p">
                  <td class="fw-bold">{{ p.nombre }}</td>
                  <td>{{ p.descripcion }}</td>
                  <td class="text-end text-muted small">{{ p.latitud.toFixed(6) }}, {{ p.longitud.toFixed(6) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    }
  `,
  styles: [`
    .mapa-container { border-radius: 8px; overflow: hidden; border: 1px solid #e9ecef; }
    .mapa-el { height: 450px; width: 100%; }
    @media (max-width: 768px) { .mapa-el { height: 300px; } }
    .cursor-pointer { cursor: pointer; }
  `],
})
export class MapaUbicacionesComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() puntos: PuntoGeorreferenciado[] = [];
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  puntoSeleccionado: PuntoGeorreferenciado | null = null;
  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  ngAfterViewInit(): void {
    if (this.puntos.length > 0) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['puntos'] && this.map) {
      this.updateMarkers();
    } else if (changes['puntos'] && this.puntos.length > 0 && !this.map) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  centrarEnPunto(punto: PuntoGeorreferenciado): void {
    this.puntoSeleccionado = punto;
    this.map?.setView([punto.latitud, punto.longitud], 16);
    this.markers.forEach((m) => {
      if (m.getLatLng().lat === punto.latitud && m.getLatLng().lng === punto.longitud) {
        m.openPopup();
      }
    });
  }

  private initMap(): void {
    if (!this.mapContainer?.nativeElement || this.map) return;

    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'leaflet/marker-icon-2x.png',
      iconUrl: 'leaflet/marker-icon.png',
      shadowUrl: 'leaflet/marker-shadow.png',
    });

    this.map = L.map(this.mapContainer.nativeElement, {
      center: [this.puntos[0].latitud, this.puntos[0].longitud],
      zoom: 13,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    this.updateMarkers();

    setTimeout(() => this.map?.invalidateSize(), 200);
  }

  private updateMarkers(): void {
    if (!this.map) return;

    this.markers.forEach((m) => m.remove());
    this.markers = [];

    const bounds = L.latLngBounds([]);

    this.puntos.forEach((p) => {
      const marker = L.marker([p.latitud, p.longitud])
        .addTo(this.map!)
        .bindPopup(`<strong>${p.nombre}</strong><br>${p.descripcion}`);
      this.markers.push(marker);
      bounds.extend([p.latitud, p.longitud]);
    });

    if (this.puntos.length === 1) {
      this.map.setView([this.puntos[0].latitud, this.puntos[0].longitud], 16);
    } else {
      this.map.fitBounds(bounds, { padding: [30, 30] });
    }
  }
}
