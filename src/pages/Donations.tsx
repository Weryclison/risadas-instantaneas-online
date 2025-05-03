import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Copy, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Donations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const pixKey = "weryclison.nandi@gmail.com";

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    toast({
      title: "Chave PIX copiada!",
      description: "A chave PIX foi copiada para sua área de transferência.",
    });
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Contribuições</h1>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>

        <p className="text-center text-muted-foreground mb-8">
          Ajude-nos a manter o jogo online e desenvolvê-lo ainda mais!
        </p>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-6">
            <Card className="bg-card p-6 rounded-lg border shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <span className="mr-2">❤️</span> Por que doar?
              </h2>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Manter servidores e infraestrutura online</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Desenvolver novas funcionalidades e cartas</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Melhorar a interface e experiência de usuário</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2 text-primary">✓</span>
                  <span>Manter o jogo gratuito para todos</span>
                </li>
              </ul>
            </Card>

            <Card className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-medium mb-4">
                Faça uma doação via PIX
              </h3>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/d/d0/QR_code_for_mobile_English_Wikipedia.svg"
                    alt="QR Code PIX"
                    className="w-40 h-40 mx-auto"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-4">
                <Input value={pixKey} readOnly className="font-mono text-sm" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPixKey}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Escaneie o QR code ou copie a chave PIX acima para realizar sua
                doação.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Donations;
