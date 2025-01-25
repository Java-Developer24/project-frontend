import React, { useState, useEffect } from 'react';
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
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check localStorage if the banner should not show again
  useEffect(() => {
    const showBanner = localStorage.getItem('showBanner');
    if (showBanner === 'false') {
      onClose();  // Automatically close the banner if the user opted out
    }
  }, [onClose]);

  // Handle the "Don't Show Again" checkbox
  const handleCheckboxChange = (e) => {
    setDontShowAgain(e.target.checked);
  };

  const handleClose = () => {
    // Store user's preference in localStorage
    if (dontShowAgain) {
      localStorage.setItem('showBanner', 'false');
    }
    onClose(); // Close the banner
  };

  if (!bannerMessage) return null;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent className="w-full max-w-[330px] h-[480px] sm:h-[380px] sm:max-w-[480px] md:max-w-[720px]  md:h-[430px] flex flex-col items-center justify-center bg-[#121315] rounded-2xl p-3 md:p-5 border-[#1b1d21] border-2">
        <AlertDialogHeader className="w-full">
          <AlertDialogTitle className="text-xl font-medium mb-2 text-center text-primary">
            Important Notice
          </AlertDialogTitle>
          <AlertDialogDescription className="text-white whitespace-pre-line text-center text-sm lg:text-lg">
            {bannerMessage}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex items-center justify-center mt-3">
          <input
            type="checkbox"
            id="dontShowAgain"
            checked={dontShowAgain}
            onChange={handleCheckboxChange}
            className="mr-2"
          />
          <label htmlFor="dontShowAgain" className="text-white text-sm">
            Don't show again
          </label>
        </div>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            onClick={handleClose}
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
