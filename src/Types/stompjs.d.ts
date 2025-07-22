declare module "stompjs" {
  interface Client {
    connect(
      headers: any,
      connectCallback: () => void,
      errorCallback?: (error: any) => void
    ): void;
    disconnect(disconnectCallback?: () => void): void;
    subscribe(destination: string, callback: (message: any) => void): any;
    send(destination: string, headers?: any, body?: string): void;
    unsubscribe(id: string): void;
  }

  const Stomp: {
    over(socket: any): Client;
    client(): Client;
  };

  export default Stomp;
}
