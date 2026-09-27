import { subscribeToCraiEvents } from "./craiData";

export function connectCraiRealtime(onChange) {
  return subscribeToCraiEvents(onChange);
}
