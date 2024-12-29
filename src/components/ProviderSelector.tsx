import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Brain, Bot } from "lucide-react";
import { useState } from "react";
import { PinDialog } from "./PinDialog";

interface ProviderSelectorProps {
  provider: string;
  onProviderChange: (value: string) => void;
  ttsProvider: string;
  onTTSProviderChange: (value: string) => void;
}

export const ProviderSelector = ({
  provider,
  onProviderChange,
  ttsProvider,
  onTTSProviderChange,
}: ProviderSelectorProps) => {
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<string | null>(null);

  const handleProviderChange = (value: string) => {
    if (value === "iaraai") {
      setPendingProvider(value);
      setShowPinDialog(true);
    } else {
      onProviderChange(value);
    }
  };

  const handlePinSuccess = () => {
    if (pendingProvider) {
      onProviderChange(pendingProvider);
      setPendingProvider(null);
    }
  };

  return (
    <div className="space-y-4">
      <ToggleGroup
        type="single"
        value={provider}
        onValueChange={handleProviderChange}
        className="justify-center"
      >
        <ToggleGroupItem value="gemini" aria-label="Usar Gemini">
          <Brain className="mr-2" />
          Gemini
        </ToggleGroupItem>
        <ToggleGroupItem value="groq" aria-label="Usar Groq">
          <Bot className="mr-2" />
          Groq
        </ToggleGroupItem>
        <ToggleGroupItem value="iaraai" aria-label="Usar IARA AI">
          <Bot className="mr-2" />
          IARA AI
        </ToggleGroupItem>
      </ToggleGroup>

      {provider !== "iaraai" && (
        <ToggleGroup
          type="single"
          value={ttsProvider}
          onValueChange={onTTSProviderChange}
          className="justify-center mt-4"
        >
          <ToggleGroupItem value="polly" aria-label="Usar Polly">
            <Bot className="mr-2" />
            Polly
          </ToggleGroupItem>
          <ToggleGroupItem value="ttsopenai" aria-label="Usar TTS OpenAI">
            <Bot className="mr-2" />
            TTS OpenAI
          </ToggleGroupItem>
        </ToggleGroup>
      )}

      <PinDialog
        isOpen={showPinDialog}
        onClose={() => {
          setShowPinDialog(false);
          setPendingProvider(null);
        }}
        onSuccess={handlePinSuccess}
      />
    </div>
  );
};