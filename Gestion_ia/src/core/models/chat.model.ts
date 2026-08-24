export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  contenido: string;
  timestamp: Date;
  acciones?: ChatAccionSugerida[];
  cargando?: boolean;
}

export interface ChatAccionSugerida {
  etiqueta: string;
  ruta: string;
}

export interface ChatRequest {
  mensaje: string;
  historial: ChatMessage[];
  contexto?: {
    pantalla?: string;
    procesoId?: string;
    contribuyenteNit?: string;
  };
}

export interface ChatResponse {
  respuesta: string;
  acciones?: ChatAccionSugerida[];
}
