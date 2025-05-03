
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";

const Feedback = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    feedbackType: "bug",
    message: "",
    cardSuggestion: {
      type: "black",
      text: "",
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent as keyof typeof formData],
          [child]: value,
        },
      });
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
        <h1 className="text-3xl font-bold mb-6 text-center">Feedback e Sugestões</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  <option value="black">Carta Preta (pergunta/frase com lacuna)</option>
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
                  placeholder={formData.cardSuggestion.type === "black" 
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
        </form>
      </div>
    </Layout>
  );
};

export default Feedback;
