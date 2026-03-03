declare module 'convict-format-with-validator' {
  type ValidatorFormat = {
    name: string;
    coerce: (value: unknown) => unknown;
    validate: (value: unknown) => void;
  };

  type ValidatorFormats = Record<string, ValidatorFormat>;
  const formats: ValidatorFormats;

  export default formats;
}
