import React from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/AlertDialog";

const BannerPopup = ({ isOpen, onClose, bannerMessage }) => {
  if (!bannerMessage) return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="w-full max-w-[720px] flex flex-col items-center justify-center bg-[#121315] rounded-2xl p-3 md:p-5 border-[#1b1d21] border-2">
        <AlertDialogHeader className="w-full">
          <AlertDialogTitle className="text-xl font-medium mb-2  text-center text-primary ">
            Important Notice
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white whitespace-pre-line text-center text-sm lg:text-lg">
            {bannerMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            onClick={onClose}
            className="bg-primary hover:bg-primary/90 text-white border-none"
          >
            OK
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default BannerPopup;
