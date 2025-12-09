export interface formState {
  formType: string;
  initialData: any;
}

export interface dialogState {
  isOpen: boolean;
  title: string;
  submitButtonText: string;
  readOnly: boolean;
  secondaryButtonText: string;
  primarySecondButtonText: string;
  cancelButtonText: string;
  formState: formState;
}
