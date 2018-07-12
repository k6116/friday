
export class ConfirmModalOptions {
  title: string;
  message: string;
  iconClass: string;
  iconColor: string;
  closeButton: boolean;
  allowOutsideClickDismiss: boolean;
  allowEscKeyDismiss: boolean;
  buttons: ConfirmModalButtons[];
}

export class ConfirmModalButtons {
  text: string;
  bsClass: string;
  emit: any;  // you can emit and receive any data type that meets your needs - string, boolean, number, object
}
