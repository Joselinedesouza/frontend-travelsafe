declare module "sockjs-client" {
  interface SockJS {
    close(): void;
    onopen?: (ev?: Event) => void;
    onmessage?: (ev: MessageEvent) => void;
    onclose?: (ev?: CloseEvent) => void;
    send(data: string): void;
  }

  interface SockJSStatic {
    new(url: string, options?: any): SockJS;
  }

  const SockJS: SockJSStatic;

  export default SockJS;
}
