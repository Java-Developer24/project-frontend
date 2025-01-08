import React, { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/AlertDialog";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";

const PurchaseDisclaimer = ({ 
  isOpen, 
  onClose, 
  onContinue, 
  disclaimerContent 
}) => {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleContinue = () => {
    if (dontShowAgain) {
      localStorage.setItem('hidePurchaseDisclaimer', 'true');
    }
    onContinue();
  };

  if (!disclaimerContent || !isOpen) return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="dark border-[#1b1d21] bg-[#121315] border-2">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-medium mb-2">
            Important Notice
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white">
            {disclaimerContent}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <Checkbox
            id="dontShow"
            checked={dontShowAgain}
            onCheckedChange={setDontShowAgain}
            className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label htmlFor="dontShow" className="text-sm text-gray-300">
            Don't show this again
          </Label>
        </div>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            onClick={onClose}
            className="focus:outline-none border border-white"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleContinue}
            className="bg-primary hover:bg-primary/90"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PurchaseDisclaimer;