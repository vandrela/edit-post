interface InputFieldProps {
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error: boolean;
  errorMessage: string;
  placeholder: string;
  as?: "input" | "textarea";
}

const InputField: React.FC<InputFieldProps> = ({
  value,
  onChange,
  error,
  errorMessage,
  placeholder,
  as = "input",
}) => {
  const InputComponent = as;
  return (
    <div>
      <InputComponent
        value={value}
        onChange={onChange}
        className={`border p-2 w-full rounded ${error ? "border-red-500" : ""}`}
        placeholder={placeholder}
      />
      {error && <p className="text-red-500 text-sm mt-1">{errorMessage}</p>}
    </div>
  );
};

export default InputField;
