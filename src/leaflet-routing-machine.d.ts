declare module "leaflet-routing-machine" {
  import * as L from "leaflet";

  interface RoutingControlOptions extends L.ControlOptions {
    waypoints?: L.LatLng[];
    routeWhileDragging?: boolean;
    showAlternatives?: boolean;
    lineOptions?: {
      styles?: { color?: string; opacity?: number; weight?: number }[];
    };
    addWaypoints?: boolean;
    draggableWaypoints?: boolean;
    fitSelectedRoutes?: boolean;
    show?: boolean;
  }

  namespace Routing {
    function control(options?: RoutingControlOptions): L.Control;
  }

  const Routing: {
    control: typeof Routing.control;
  };

  export = Routing;
}
