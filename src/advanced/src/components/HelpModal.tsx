import React, { useState, useCallback } from 'react';

const HelpModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  }, []);

  return (
    <>
      <button className="fixed top-4 right-4" onClick={toggleModal}>
        ?
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-end items-start z-50"
          onClick={handleOverlayClick}
        >
          <div
            className={`fixed right-0 top-0 h-full w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
              ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Modal Content goes here */}
            <div className="p-4">
              <h2 className="text-xl font-bold mb-4">Help & Information</h2>
              <p>This is a help modal. You can add more content here.</p>
              <button className="mt-4 p-2 bg-gray-200 rounded" onClick={toggleModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HelpModal;
