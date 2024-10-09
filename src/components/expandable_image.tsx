import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ZoomIn } from "lucide-react";

export default function ExpandableImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-white text-black border-none hover:bg-white/80 hover:text-black"
        >
          <ZoomIn className="mr-2 h-4 w-4" /> Expand Image
        </Button>
      </DialogTrigger>
      <DialogContent className="w-full max-w-3xl">
        <img src={src} alt={alt} className="w-full h-auto" />
      </DialogContent>
    </Dialog>
  );
}
