type ExamplePrompt = {
  label: string;
  value: string;
};

type WelcomeCardExamplesProps = {
  prompts: ExamplePrompt[];
  onSelect?: (value: string) => void;
};

export function WelcomeCardExamples({ prompts, onSelect }: WelcomeCardExamplesProps) {
  return (
    <div 
      className="welcome-examples-container"
    >
      {prompts.map((prompt) => (
        <button
          key={prompt.label}
          type="button"
          onClick={() => onSelect?.(prompt.value)}
          className="welcome-example-button"
          aria-label={`Use example: ${prompt.label}`}
        >
          {prompt.label}
        </button>
      ))}
    </div>
  );
}

