export interface DolarApiResponse {
  fuente?: string;
  nombre?: string;
  promedio: number;
  fechaActualizacion?: string;
}

export const DEFAULT_BCV_RATE = 44.50;

export async function fetchLiveBcvRate(): Promise<{ rate: number; updatedAt?: string; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch('https://ve.dolarapi.com/v1/dolares/oficial', {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Error en API BCV: ${response.statusText}`);
    }

    const data: DolarApiResponse = await response.json();
    if (data && typeof data.promedio === 'number' && data.promedio > 0) {
      return {
        rate: Math.round(data.promedio * 100) / 100,
        updatedAt: data.fechaActualizacion || new Date().toISOString(),
      };
    }

    throw new Error('Respuesta no válida del servicio BCV');
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido al consultar BCV';
    console.warn('[BCV Service] No se pudo obtener la tasa en vivo:', message);
    return {
      rate: DEFAULT_BCV_RATE,
      error: message,
    };
  }
}
