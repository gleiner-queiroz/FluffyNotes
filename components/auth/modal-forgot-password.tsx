import { FC, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { sendPasswordResetEmail } from "firebase/auth";
import { useAuth } from "reactfire";

interface ModalChangePasswordProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const ModalForgotPassword: FC<ModalChangePasswordProps> = ({
  isOpen,
  setIsOpen,
}) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const auth = useAuth();

  const onSubmit = async () => {
    try {
      setIsLoading(true);
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Sucesso!",
        description: "Um link de redefinição de senha foi enviado para o seu email.",
      });
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Erro: ", description: `${error}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Esqueceu sua senha?</DialogTitle>
            <DialogDescription>
              Insira seu endereço de email abaixo.
            </DialogDescription>
          </DialogHeader>

          <Label htmlFor="email">Email</Label>
          <Input
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            disabled={isLoading}
            name="email"
            type="email"
            required
          />

          <p className="text-[0.8rem] -mt-3">
            Enviaremos um link para redefinir sua senha.
          </p>
          <Button disabled={isLoading} onClick={() => onSubmit()}>
            Enviar
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};
