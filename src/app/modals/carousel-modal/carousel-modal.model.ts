
export class CarouselModalOptions {
  title: string;
  iconClass: string;
  iconColor: string;
  closeButton: boolean;
  allowOutsideClickDismiss: boolean;
  allowEscKeyDismiss: boolean;
  buttons: CarouselModalButtons[];
  slides: CarouselModalSlides[];
}

export class CarouselModalButtons {
  text: string;
  bsClass: string;
  emit: any;  // you can emit and receive any data type that meets your needs - string, boolean, number, object
}

export class CarouselModalSlides {
  src: string;
  alt: string;
  captionHeader: string;
  captionBody: string;
  active: boolean;
}
