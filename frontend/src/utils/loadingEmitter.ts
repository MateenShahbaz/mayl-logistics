import mitt from "mitt";

type Events = {
  start: void;
  stop: void;
};

export const loadingEmitter = mitt<Events>();
