import { useState } from 'react';

/**
 * Custom hook to manage the state and logic for the Report Failure Modal
 */
export function useReportFailureModal() {
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedAsset(null);
    setDescription('');
  };

  const handleOpenModal = (asset) => {
    setSelectedAsset(asset);
    setShowModal(true);
  };

  return {
    showModal,
    setShowModal,
    selectedAsset,
    setSelectedAsset,
    description,
    setDescription,
    submitting,
    setSubmitting,
    handleCloseModal,
    handleOpenModal,
  };
}
