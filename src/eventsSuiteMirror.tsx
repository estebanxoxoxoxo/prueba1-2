// Espejo local de events-suite — EL ÚNICO archivo de la app que importa de la
// suite ("una sola cosa": su index). El resto de la app importa SIEMPRE de acá:
// si la suite se mueve, se renombra o cambia de forma, la app solo toca este
// archivo. Copiar y pegar junto con la suite en cualquier proyecto.

export { EventsSuiteProvider, useEventsSuite, BusinessEventNames, pushEvent, FbEvent } from '../events-suite';
export type { EventsSuiteCtx, StartDeliveryConfig, BusinessEventPayload } from '../events-suite';
