/* eslint-disable @typescript-eslint/no-explicit-any */
declare namespace JSX {
  interface IntrinsicElements {
    "gmpx-place-autocomplete": React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      placeholder?: string;
      value?: any;
      onPlaceSelect?: (e: any) => void;
    };
  }
}
