export function delay(callback: Function, time: number){
  return setTimeout(callback, time);
}
export function clearDelay(timeout:any) {
  clearTimeout(timeout)
}
