import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import { ArrowLeft } from "lucide-react";

// Definir o tipo específico para o objeto formData
interface FormData {
  name: string;
  email: string;
  feedbackType: string;
  message: string;
  cardSuggestion: {
    type: string;
    text: string;
  };
}

const Feedback = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    feedbackType: "bug",
    message: "",
    cardSuggestion: {
      type: "black",
      text: "",
    },
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      if (parent === "cardSuggestion") {
        setFormData({
          ...formData,
          cardSuggestion: {
            ...formData.cardSuggestion,
            [child]: value,
          },
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulated form submission
    toast({
      title: "Feedback enviado!",
      description: "Obrigado por nos ajudar a melhorar o jogo.",
    });

    // Reset form
    setFormData({
      name: "",
      email: "",
      feedbackType: "bug",
      message: "",
      cardSuggestion: {
        type: "black",
        text: "",
      },
    });
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-6">
        <div className="flex items-center justify-between mb-6 px-4">
          <h1 className="text-3xl font-bold">Feedback e Sugestões</h1>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium">
                Nome (opcional)
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Seu nome"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">
                Email (opcional)
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu.email@exemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="feedbackType" className="block text-sm font-medium">
              Tipo de feedback
            </label>
            <select
              id="feedbackType"
              name="feedbackType"
              value={formData.feedbackType}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2"
            >
              <option value="bug">Reportar um bug</option>
              <option value="suggestion">Sugestão de melhoria</option>
              <option value="card">Sugerir nova carta</option>
              <option value="other">Outro</option>
            </select>
          </div>

          {formData.feedbackType !== "card" ? (
            <div className="space-y-2">
              <label htmlFor="message" className="block text-sm font-medium">
                Sua mensagem
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Descreva seu feedback em detalhes..."
                rows={6}
              />
            </div>
          ) : (
            <div className="space-y-4 p-4 border border-border rounded-md">
              <h3 className="font-medium">Sugestão de nova carta</h3>

              <div className="space-y-2">
                <label htmlFor="cardType" className="block text-sm font-medium">
                  Tipo de carta
                </label>
                <select
                  id="cardType"
                  name="cardSuggestion.type"
                  value={formData.cardSuggestion.type}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="black">
                    Carta Preta (pergunta/frase com lacuna)
                  </option>
                  <option value="white">Carta Branca (resposta)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="cardText" className="block text-sm font-medium">
                  Texto da carta
                </label>
                <Textarea
                  id="cardText"
                  name="cardSuggestion.text"
                  value={formData.cardSuggestion.text}
                  onChange={handleChange}
                  placeholder={
                    formData.cardSuggestion.type === "black"
                      ? "Ex: Qual é o segredo para uma vida feliz?"
                      : "Ex: Fingir que está trabalhando quando o chefe passa."
                  }
                  rows={3}
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Enviar feedback
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            Suas sugestões são muito importantes para nós! Para contato direto,
            envie um email para{" "}
            <a
              href="mailto:weryclison.nandi@gmail.com"
              className="text-primary hover:underline"
            >
              weryclison.nandi@gmail.com
            </a>
          </p>
        </form>
      </div>
    </Layout>
  );
};

export default Feedback;
