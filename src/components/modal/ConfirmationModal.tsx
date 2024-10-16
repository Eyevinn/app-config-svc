import { useTransition } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';

type ConfirmationModalProps = {
  isOpen: boolean;
  setIsOpen: (param: boolean) => void;
  handleConfirmClick: () => void;
  modalContent: string;
  buttonContent: string;
};

export const ConfirmationModal = ({
  isOpen,
  setIsOpen,
  handleConfirmClick,
  modalContent,
  buttonContent
}: ConfirmationModalProps) => {
  const [isPending, startTransition] = useTransition();
  const handleConfirm = () => {
    startTransition(() => {
      handleConfirmClick();
    });
    setIsOpen(false);
  };
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      scrollBehavior="outside"
      placement="center"
    >
      <ModalContent>
        <ModalHeader>Are you sure?</ModalHeader>
        <ModalBody className="text-sm">{modalContent}</ModalBody>
        <ModalFooter>
          <Button
            color="default"
            variant="light"
            onPress={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button color="primary" isLoading={isPending} onPress={handleConfirm}>
            {buttonContent}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
