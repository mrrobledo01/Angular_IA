import { Component, inject, signal, HostListener, ElementRef, ViewChild, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ChatbotService } from '../../../../core/services/chatbot.service';
import { ChatMessage, ChatAccionSugerida } from '../../../../core/models/chat.model';

@Component({
  selector: 'app-chatbot-widget',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Botón flotante -->
    @if (!abierto()) {
      <button class="chatbot-fab" (click)="toggle()" aria-label="Abrir asistente virtual" title="Asistente Virtual">
        <i class="bi bi-chat-dots-fill"></i>
        @if (noLeidos() > 0) {
          <span class="badge-notification">{{ noLeidos() }}</span>
        }
      </button>
    }

    <!-- Panel de chat -->
    @if (abierto()) {
      <div class="chatbot-panel" role="dialog" aria-label="Asistente Virtual">
        <!-- Header -->
        <div class="chatbot-header">
          <div class="d-flex align-items-center gap-2">
            <i class="bi bi-robot"></i>
            <span class="fw-bold">Asistente FiscalIA</span>
          </div>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-light border-0" (click)="limpiar()" title="Limpiar conversación">
              <i class="bi bi-trash"></i>
            </button>
            <button class="btn btn-sm btn-outline-light border-0" (click)="toggle()" title="Cerrar">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
        </div>

        <!-- Mensajes -->
        <div class="chatbot-mensajes" #mensajesContainer aria-live="polite">
          @if (mensajes().length === 0) {
            <div class="chatbot-bienvenida">
              <div class="text-center mb-3">
                <i class="bi bi-robot text-primary" style="font-size: 2.5rem;"></i>
              </div>
              <p class="text-center fw-bold mb-2">¡Hola! Soy tu asistente de Fiscalización.</p>
              <p class="text-center text-muted small mb-3">Puedo ayudarte a consultar procesos, hallazgos, analizar contribuyentes y más.</p>
              <div class="d-flex flex-wrap gap-2 justify-content-center">
                @for (s of sugerenciasIniciales; track s) {
                  <button class="btn btn-sm btn-outline-primary rounded-pill" (click)="enviar(s)">{{ s }}</button>
                }
              </div>
            </div>
          }

          @for (msg of mensajes(); track msg.id) {
            <div class="chatbot-msg" [ngClass]="msg.role === 'user' ? 'msg-user' : 'msg-assistant'">
              @if (msg.role === 'assistant') {
                <div class="msg-avatar"><i class="bi bi-robot"></i></div>
              }
              <div class="msg-burbuja" [ngClass]="msg.role === 'user' ? 'burbuja-user' : 'burbuja-assistant'">
                @if (msg.cargando) {
                  <div class="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                } @else {
                  <div class="msg-texto" [innerHTML]="renderMarkdown(msg.contenido)"></div>
                }
              </div>
            </div>
            @if (msg.acciones?.length && !msg.cargando) {
              <div class="msg-acciones">
                @for (a of msg.acciones; track a.ruta) {
                  <button class="btn btn-sm btn-outline-primary rounded-pill" (click)="navegar(a)">
                    <i class="bi bi-box-arrow-up-right me-1"></i>{{ a.etiqueta }}
                  </button>
                }
              </div>
            }
          }
        </div>

        <!-- Input -->
        <div class="chatbot-input">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              [(ngModel)]="nuevoMensaje"
              (keyup.enter)="enviarMensaje()"
              placeholder="Escribe tu pregunta..."
              [disabled]="enviando()"
              aria-label="Mensaje al asistente"
            />
            <button class="btn btn-primary" (click)="enviarMensaje()" [disabled]="!nuevoMensaje.trim() || enviando()">
              @if (enviando()) {
                <span class="spinner-border spinner-border-sm"></span>
              } @else {
                <i class="bi bi-send-fill"></i>
              }
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .chatbot-fab {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 56px; height: 56px; border-radius: 50%;
      background: linear-gradient(135deg, #0d6efd, #0b5ed7);
      color: white; border: none; box-shadow: 0 4px 12px rgba(13,110,253,0.4);
      cursor: pointer; font-size: 1.4rem;
      display: flex; align-items: center; justify-content: center;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .chatbot-fab:hover { transform: scale(1.08); box-shadow: 0 6px 20px rgba(13,110,253,0.5); }
    .badge-notification {
      position: absolute; top: -4px; right: -4px;
      background: #dc3545; color: white; font-size: 0.65rem;
      width: 18px; height: 18px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-weight: bold;
    }
    .chatbot-panel {
      position: fixed; bottom: 24px; right: 24px; z-index: 9999;
      width: 380px; max-width: calc(100vw - 32px); height: 520px; max-height: calc(100vh - 80px);
      background: white; border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.18);
      display: flex; flex-direction: column; overflow: hidden;
      animation: slideUp 0.25s ease-out;
    }
    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .chatbot-header {
      background: linear-gradient(135deg, #0d6efd, #0b5ed7);
      color: white; padding: 12px 16px;
      display: flex; justify-content: space-between; align-items: center;
    }
    .chatbot-mensajes {
      flex: 1; overflow-y: auto; padding: 16px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .chatbot-bienvenida { padding: 20px 8px; }
    .chatbot-msg { display: flex; gap: 8px; max-width: 90%; }
    .msg-user { align-self: flex-end; flex-direction: row-reverse; }
    .msg-assistant { align-self: flex-start; }
    .msg-avatar {
      width: 32px; height: 32px; border-radius: 50%;
      background: #e9ecef; display: flex; align-items: center; justify-content: center;
      font-size: 0.85rem; color: #6c757d; flex-shrink: 0;
    }
    .msg-burbuja { padding: 10px 14px; border-radius: 12px; font-size: 0.875rem; line-height: 1.5; }
    .burbuja-user { background: #0d6efd; color: white; border-bottom-right-radius: 4px; }
    .burbuja-assistant { background: #f1f3f5; color: #212529; border-bottom-left-radius: 4px; }
    .msg-texto { white-space: pre-wrap; word-break: break-word; }
    .msg-texto strong { font-weight: 600; }
    .msg-acciones { display: flex; flex-wrap: wrap; gap: 6px; padding-left: 40px; }
    .chatbot-input { padding: 12px; border-top: 1px solid #e9ecef; }
    .typing-indicator { display: flex; gap: 4px; padding: 4px 0; }
    .typing-indicator span {
      width: 7px; height: 7px; border-radius: 50%; background: #adb5bd;
      animation: typing 1.2s infinite ease-in-out;
    }
    .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
    .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes typing {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
      30% { transform: translateY(-6px); opacity: 1; }
    }
    @media (max-width: 480px) {
      .chatbot-panel { width: calc(100vw - 16px); right: 8px; bottom: 8px; height: calc(100vh - 100px); }
    }
  `],
})
export class ChatbotWidgetComponent implements AfterViewChecked {
  @ViewChild('mensajesContainer') mensajesContainer!: ElementRef<HTMLDivElement>;

  private chatService = inject(ChatbotService);
  private router = inject(Router);

  abierto = signal(false);
  mensajes = signal<ChatMessage[]>([]);
  nuevoMensaje = '';
  enviando = signal(false);
  noLeidos = signal(0);

  sugerenciasIniciales = [
    '¿Cuántos procesos hay?',
    'Hallazgos pendientes',
    '¿Cómo creo un proceso?',
    'Análisis de un NIT',
  ];

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Escape' && this.abierto()) this.abierto.set(false);
  }

  toggle(): void {
    this.abierto.update((v) => !v);
    if (this.abierto()) this.noLeidos.set(0);
  }

  enviar(texto: string): void {
    this.nuevoMensaje = texto;
    this.enviarMensaje();
  }

  enviarMensaje(): void {
    const texto = this.nuevoMensaje.trim();
    if (!texto || this.enviando()) return;

    const userMsg: ChatMessage = {
      id: this.genId(),
      role: 'user',
      contenido: texto,
      timestamp: new Date(),
    };

    this.mensajes.update((m) => [...m, userMsg]);
    this.nuevoMensaje = '';
    this.enviando.set(true);

    const loadingMsg: ChatMessage = {
      id: this.genId(),
      role: 'assistant',
      contenido: '',
      timestamp: new Date(),
      cargando: true,
    };
    this.mensajes.update((m) => [...m, loadingMsg]);

    this.chatService.enviarMensaje({
      mensaje: texto,
      historial: this.mensajes(),
      contexto: { pantalla: this.router.url },
    }).subscribe({
      next: (res) => {
        this.mensajes.update((m) =>
          m.map((msg) =>
            msg.id === loadingMsg.id
              ? { ...msg, cargando: false, contenido: res.respuesta, acciones: res.acciones }
              : msg
          )
        );
        this.enviando.set(false);
        if (!this.abierto()) this.noLeidos.update((n) => n + 1);
      },
      error: () => {
        this.mensajes.update((m) =>
          m.map((msg) =>
            msg.id === loadingMsg.id
              ? { ...msg, cargando: false, contenido: 'No pude procesar tu solicitud. Intenta de nuevo.' }
              : msg
          )
        );
        this.enviando.set(false);
      },
    });
  }

  navegar(accion: ChatAccionSugerida): void {
    this.router.navigate([accion.ruta]);
    this.abierto.set(false);
  }

  limpiar(): void {
    this.mensajes.set([]);
    this.chatService.limpiarHistorial();
  }

  renderMarkdown(texto: string): string {
    return texto
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.*)/gm, '• $1')
      .replace(/^(\d+)\. (.*)/gm, '$1. $2')
      .replace(/\n/g, '<br>');
  }

  private scrollToBottom(): void {
    const el = this.mensajesContainer?.nativeElement;
    if (el) el.scrollTop = el.scrollHeight;
  }

  private genId(): string {
    return Math.random().toString(36).substring(2, 10);
  }
}
