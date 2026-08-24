import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, delay } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChatRequest, ChatResponse, ChatMessage } from '../models/chat.model';

interface MockRule {
  keywords: string[];
  respuesta: string;
  acciones?: { etiqueta: string; ruta: string }[];
}

const MOCK_RULES: MockRule[] = [
  {
    keywords: ['proceso', 'crear', 'nuevo', 'fiscalización'],
    respuesta: 'Para crear un proceso de fiscalización:\n\n1. Ve a **Procesos** → **Nuevo Proceso**\n2. Ingresa el NIT de la entidad\n3. Define el periodo, vigencia y tipo de régimen\n4. Selecciona las actividades económicas (CIIU)\n5. Haz clic en **Crear Proceso**\n\nEl proceso pasará automáticamente al estado *EN_COLA* y comenzará a procesarse.',
    acciones: [{ etiqueta: 'Ir a Crear Proceso', ruta: '/procesos/crear' }],
  },
  {
    keywords: ['entidad', 'entidades', 'municipio', 'alcaldía'],
    respuesta: 'Las entidades fiscalizadoras son los municipios o entidades que ejecutan los procesos de fiscalización. Cada entidad se identifica por su NIT.\n\nPuedes buscar una entidad por NIT o crear una nueva desde la pantalla de entidades.',
    acciones: [{ etiqueta: 'Ver Entidades', ruta: '/entidades' }],
  },
  {
    keywords: ['hallazgo', 'hallazgos', 'detectado', 'accioanble'],
    respuesta: 'Los hallazgos son resultados del análisis que identifican posibles incumplimientos tributarios. Cada hallazgo tiene:\n\n- **Regla** (R1-R10): la regla fiscal que detectó el hallazgo\n- **Estado**: DETECTADO, VALIDADO, DESCARTADO, etc.\n- **Score**: prioridad de actuación (0-100)\n- **Brecha valor**: monto estimado del incumplimiento\n\nPuedes revisar hallazgos desde la pantalla de Reglas y Hallazgos.',
    acciones: [{ etiqueta: 'Ver Hallazgos', ruta: '/reglas' }],
  },
  {
    keywords: ['análisis', 'individual', 'contribuyente', 'NIT', 'contribuyente_nit'],
    respuesta: 'El Análisis Individual evalúa un contribuyente específico:\n\n1. Ingresa el NIT y periodo\n2. El sistema calcula el **SRF** (Score de Riesgo Fiscal)\n3. Clasifica como **OMISO**, **INEXACTO** o **EXACTO**\n4. Genera una explicación detallada con IA\n\nTambién puedes ver la ubicación georreferenciada del contribuyente en el tab "Ubicación".',
    acciones: [{ etiqueta: 'Ir a Análisis Individual', ruta: '/analisis' }],
  },
  {
    keywords: ['comportamiento', 'comportamental', 'desviación', 'benchmark'],
    respuesta: 'El Análisis Comportamental compara al contribuyente con su sector (CIIU + régimen):\n\n- **Score comportamental** (0-100): qué tan "fuera de patrón" está\n- **Desviaciones**: percentil de base gravable, z-score robusto\n- **Benchmark**: mediana sectorial, percentiles P10-P90\n\nPuedes consultar el comportamiento de cualquier contribuyente por NIT.',
    acciones: [{ etiqueta: 'Ir a Análisis Comportamental', ruta: '/comportamiento' }],
  },
  {
    keywords: ['regla', 'reglas', 'evaluar', 'ejecutar', 'R1', 'R2', 'R3', 'R4', 'R5'],
    respuesta: 'Las Reglas de Fiscalización (R1-R10) son criterios automáticos que detectan incumplimientos:\n\n- **Evaluar**: simula la aplicación de reglas (sin persistir datos)\n- **Ejecutar**: aplica las reglas y genera hallazgos reales\n\nSelecciona las reglas que deseas aplicar, ingresa NIT y periodo.',
    acciones: [{ etiqueta: 'Ir a Reglas', ruta: '/reglas' }],
  },
  {
    keywords: ['dashboard', 'panel', 'resumen', 'estadísticas', 'métricas'],
    respuesta: 'El Dashboard muestra un resumen general del sistema:\n\n- Total de procesos y su estado\n- Hallazgos por clasificación\n- Entidades activas\n\nEs tu punto de partida para monitorear la fiscalización.',
    acciones: [{ etiqueta: 'Ir al Dashboard', ruta: '/dashboard' }],
  },
  {
    keywords: ['estado', 'proceso', 'estatus', 'avance', 'progreso'],
    respuesta: 'Para ver el estado de un proceso:\n\n1. Ve a **Procesos**\n2. Busca por NIT de entidad\n3. Haz clic en el ícono 👁️ del proceso\n\nVerás el avance, resultados y errores del proceso.',
    acciones: [{ etiqueta: 'Ver Procesos', ruta: '/procesos' }],
  },
  {
    keywords: ['expediente', 'fiscal', 'resumen ejecutivo'],
    respuesta: 'El Expediente Fiscal consolida toda la información de un contribuyente:\n\n- Métricas tributarias\n- Score fiscal unificado\n- Resumen ejecutivo con IA\n\nPuedes acceder desde Análisis Comportamental.',
    acciones: [{ etiqueta: 'Ir a Comportamiento', ruta: '/comportamiento' }],
  },
  {
    keywords: ['ayuda', 'cómo', 'qué es', 'funcionamiento', '.manual'],
    respuesta: '**FiscalIA - Asistente de Fiscalización**\n\nPuedo ayudarte con:\n\n- **Crear procesos** de fiscalización\n- **Consultar hallazgos** y su estado\n- **Analizar contribuyentes** individuales\n- **Ver el dashboard** y métricas\n- **Evaluar reglas** fiscales\n\nSimplemente pregúntame en lenguaje natural.',
  },
];

@Injectable({ providedIn: 'root' })
export class ChatbotService {
  private http = inject(HttpClient);
  private baseUrl = environment.chatbotApiUrl;
  private historial: ChatMessage[] = [];

  enviarMensaje(request: ChatRequest): Observable<ChatResponse> {
    if (environment.useMockChatbot) {
      return this.mockRespuesta(request.mensaje);
    }
    return this.http.post<ChatResponse>(`${this.baseUrl}/chat`, request);
  }

  private mockRespuesta(mensaje: string): Observable<ChatResponse> {
    const lower = mensaje.toLowerCase();

    for (const rule of MOCK_RULES) {
      if (rule.keywords.some((kw) => lower.includes(kw))) {
        return of({ respuesta: rule.respuesta, acciones: rule.acciones }).pipe(delay(600));
      }
    }

    return of({
      respuesta: `No encontré información específica sobre "${mensaje}".\n\nPuedo ayudarte con:\n- Crear procesos de fiscalización\n- Consultar hallazgos\n- Analizar contribuyentes\n- Ver el dashboard\n\n¿Qué necesitas?`,
      acciones: [{ etiqueta: 'Ir al Dashboard', ruta: '/dashboard' }],
    }).pipe(delay(600));
  }

  getHistorial(): ChatMessage[] {
    return this.historial;
  }

  setHistorial(mensajes: ChatMessage[]): void {
    this.historial = mensajes;
  }

  limpiarHistorial(): void {
    this.historial = [];
  }
}
